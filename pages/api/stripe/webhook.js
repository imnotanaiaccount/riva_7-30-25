import { buffer } from 'micro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import rateLimit from '../../../utils/rateLimit';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: {
    bodyParser: false, // Don't parse body, we'll handle it manually
  },
};

export default async function handler(req, res) {
  // Apply rate limiting
  const rateLimitRes = await rateLimit(req, res);
  if (rateLimitRes) return rateLimitRes;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpdate(event.data.object);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object);
        break;
      case 'customer.subscription.trial_will_end':
        await handleTrialEnding(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler failed', error);
    return res.status(400).send('Webhook handler failed');
  }
}

// Helper function to find user by Stripe customer ID or email
async function findUser(customerId, email = null) {
  let query = supabase
    .from('submissions2')
    .select('*');

  if (customerId) {
    query = query.eq('stripe_customer_id', customerId);
  } else if (email) {
    query = query.eq('email', email);
  } else {
    return null;
  }

  const { data, error } = await query.maybeSingle();
  
  if (error) {
    console.error('Error finding user:', error);
    return null;
  }
  
  return data;
}

// Handler functions for different event types
async function handleCheckoutSessionCompleted(session) {
  console.log('Checkout session completed:', session.id);
  
  // Get the subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  // Find the user by email or customer ID
  const user = await findUser(session.customer, session.customer_email);
  
  if (!user) {
    console.error('User not found for checkout session:', {
      customer: session.customer,
      email: session.customer_email,
      subscription: session.subscription
    });
    return;
  }

  // Update user with subscription details
  const updates = {
    stripe_customer_id: session.customer,
    subscription_id: subscription.id,
    subscription_status: subscription.status,
    plan: session.metadata?.plan_id || subscription.items.data[0]?.price.lookup_key || 'trial',
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('submissions2')
    .update(updates)
    .eq('id', user.id)
    .select();

  if (error) {
    console.error('Error updating user after checkout:', error);
    throw error;
  }

  console.log('User updated after checkout:', data);
}

async function handleSubscriptionUpdate(subscription) {
  console.log('Subscription updated:', subscription.id);
  
  const user = await findUser(subscription.customer);
  if (!user) {
    console.error('User not found for subscription:', subscription.customer);
    return;
  }

  const updates = {
    subscription_status: subscription.status,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString()
  };

  // If subscription was cancelled but is now active again
  if (subscription.status === 'active' && user.subscription_status === 'canceled') {
    updates.plan = subscription.items.data[0]?.price.lookup_key || user.plan || 'premium';
  }

  const { data, error } = await supabase
    .from('submissions2')
    .update(updates)
    .eq('id', user.id)
    .select();

  if (error) {
    console.error('Error updating user after subscription update:', error);
    throw error;
  }

  console.log('User updated after subscription update:', data);
}

async function handleSubscriptionCreated(subscription) {
  console.log('New subscription created:', subscription.id);
  
  const user = await findUser(subscription.customer);
  if (!user) {
    console.error('User not found for subscription:', subscription.customer);
    return;
  }

  const updates = {
    subscription_id: subscription.id,
    subscription_status: subscription.status,
    plan: subscription.items.data[0]?.price.lookup_key || 'premium',
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('submissions2')
    .update(updates)
    .eq('id', user.id)
    .select();

  if (error) {
    console.error('Error updating user after subscription creation:', error);
    throw error;
  }

  console.log('User updated after subscription creation:', data);
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  const user = await findUser(subscription.customer);
  if (!user) {
    console.error('User not found for deleted subscription:', subscription.customer);
    return;
  }

  const updates = {
    subscription_status: 'canceled',
    cancel_at_period_end: false,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('submissions2')
    .update(updates)
    .eq('id', user.id)
    .select();

  if (error) {
    console.error('Error updating user after subscription deletion:', error);
    throw error;
  }

  console.log('User updated after subscription deletion:', data);
}

async function handleInvoicePaid(invoice) {
  console.log('Invoice paid:', invoice.id);
  
  const user = await findUser(invoice.customer);
  if (!user) {
    console.error('User not found for paid invoice:', invoice.customer);
    return;
  }

  const updates = {
    subscription_status: 'active',
    last_payment_date: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // If this is the first payment after trial, update trial end
  if (user.trial_end && new Date(user.trial_end) > new Date()) {
    updates.trial_end = null;
  }

  const { data, error } = await supabase
    .from('submissions2')
    .update(updates)
    .eq('id', user.id)
    .select();

  if (error) {
    console.error('Error updating user after payment:', error);
    throw error;
  }

  console.log('User updated after payment:', data);
}

async function handleInvoiceFailed(invoice) {
  console.log('Invoice payment failed:', invoice.id);
  
  const user = await findUser(invoice.customer);
  if (!user) {
    console.error('User not found for failed invoice:', invoice.customer);
    return;
  }

  const updates = {
    subscription_status: 'past_due',
    last_payment_error: 'Payment failed',
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('submissions2')
    .update(updates)
    .eq('id', user.id)
    .select();

  if (error) {
    console.error('Error updating user after payment failure:', error);
    throw error;
  }

  console.log('User updated after payment failure:', data);
  
  // Send payment failure email
  await sendPaymentFailedEmail(user.email, user.name, invoice.hosted_invoice_url);
}

async function handleTrialEnding(subscription) {
  console.log('Trial ending for subscription:', subscription.id);
  
  const user = await findUser(subscription.customer);
  if (!user) {
    console.error('User not found for trial ending:', subscription.customer);
    return;
  }
  
  // Send trial ending email
  await sendTrialEndingEmail(user.email, user.name, new Date(subscription.trial_end * 1000));
}

// Email helper functions
async function sendPaymentFailedEmail(email, name, invoiceUrl) {
  try {
    // Implement your email sending logic here
    console.log(`Sending payment failed email to ${email}`);
    // Example using Brevo (formerly Sendinblue)
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Riva Support', email: 'support@rivaofficial.com' },
        to: [{ email, name }],
        subject: 'Payment Failed - Update Your Payment Method',
        htmlContent: `
          <p>Hello ${name},</p>
          <p>We were unable to process your payment. Please update your payment method to avoid service interruption.</p>
          <p><a href="${invoiceUrl}">Update Payment Method</a></p>
          <p>Thank you,<br>Riva Team</p>
        `,
      }),
    });
  } catch (error) {
    console.error('Error sending payment failed email:', error);
  }
}

async function sendTrialEndingEmail(email, name, trialEndDate) {
  try {
    console.log(`Sending trial ending email to ${email}`);
    // Implement your email sending logic here
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Riva Support', email: 'support@rivaofficial.com' },
        to: [{ email, name }],
        subject: 'Your Trial is Ending Soon',
        htmlContent: `
          <p>Hello ${name},</p>
          <p>Your trial period ends on ${trialEndDate.toLocaleDateString()}. Upgrade now to continue using our service without interruption.</p>
          <p><a href="https://rivaofficial.netlify.app/upgrade">Upgrade Now</a></p>
          <p>Thank you,<br>Riva Team</p>
        `,
      }),
    });
  } catch (error) {
    console.error('Error sending trial ending email:', error);
  }
}
