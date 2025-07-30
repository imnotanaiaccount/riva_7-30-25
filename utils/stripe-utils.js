import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getOrCreateCustomer(userId, email) {
  // Check if customer already exists in Supabase
  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (user?.stripe_customer_id) {
    return user.stripe_customer_id;
  }

  // Create a new customer in Stripe
  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  // Save the customer ID to Supabase
  await supabase
    .from('users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  return customer.id;
}

export async function createCheckoutSession(userId, planId, isTrial = false) {
  const { data: user } = await supabase
    .from('users')
    .select('email, stripe_customer_id')
    .eq('id', userId)
    .single();

  if (!user) {
    throw new Error('User not found');
  }

  const customerId = await getOrCreateCustomer(userId, user.email);
  const plan = STRIPE_PLANS[planId];

  if (!plan) {
    throw new Error('Invalid plan');
  }

  const sessionParams = {
    customer: customerId,
    payment_method_types: ['card'],
    subscription_data: {
      metadata: { plan_id: planId, user_id: userId },
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    metadata: { plan_id: planId, user_id: userId },
  };

  if (isTrial || planId === 'trial') {
    sessionParams.subscription_data.trial_period_days = 14;
    sessionParams.payment_method_collection = 'if_required';
  } else if (plan.stripePriceId) {
    sessionParams.line_items = [{ price: plan.stripePriceId, quantity: 1 }];
    sessionParams.mode = 'subscription';
  } else {
    sessionParams.line_items = [{
      price_data: {
        currency: 'usd',
        product_data: { name: plan.name, description: plan.description },
        unit_amount: plan.price * 100,
      },
      quantity: 1,
    }];
    sessionParams.mode = 'payment';
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  
  // Update user's plan status
  await supabase
    .from('users')
    .update({
      plan: planId,
      subscription_status: isTrial ? 'trialing' : 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return session;
}

export async function createBillingPortalSession(customerId) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  });
}

export async function cancelSubscription(subscriptionId) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function reactivateSubscription(subscriptionId) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

export async function updateSubscription(subscriptionId, newPlanId) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const newPriceId = STRIPE_PLANS[newPlanId]?.stripePriceId;

  if (!newPriceId) {
    throw new Error('Invalid plan');
  }

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
    metadata: { ...subscription.metadata, plan_id: newPlanId },
  });
}
