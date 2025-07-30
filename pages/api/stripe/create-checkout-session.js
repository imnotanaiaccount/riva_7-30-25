import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { planId, userId, userEmail, isTrial = false } = req.body;

  if (!planId || !userId || !userEmail) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Get the plan details from your configuration
    const plan = Object.values(STRIPE_PLANS).find(p => p.id === planId);
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Check if user already has a subscription
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id, subscription_status')
      .eq('id', userId)
      .single();

    let customerId = user?.stripe_customer_id;

    // Create a new Stripe customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;

      // Save the customer ID to the user's record
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session parameters
    const sessionParams = {
      customer: customerId,
      payment_method_types: ['card'],
      subscription_data: {
        metadata: {
          plan_id: planId,
          user_id: userId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      metadata: {
        plan_id: planId,
        user_id: userId,
      },
    };

    // For trial plans
    if (isTrial || planId === 'trial') {
      sessionParams.subscription_data.trial_period_days = 14; // 14-day trial
      sessionParams.payment_method_collection = 'if_required';
    } else if (plan.stripePriceId) {
      // For paid plans with a price ID
      sessionParams.line_items = [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ];
      sessionParams.mode = 'subscription';
    } else {
      // For one-time payments
      sessionParams.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.price * 100, // Convert to cents
            recurring: null, // One-time payment
          },
          quantity: 1,
        },
      ];
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

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
}
