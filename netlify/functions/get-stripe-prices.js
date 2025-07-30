const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

// Map your plan IDs to Stripe Price IDs
const PLAN_PRICE_IDS = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
  payperlead: process.env.STRIPE_PAYPERLEAD_PRICE_ID,
};

exports.handler = async function(event, context) {
  try {
    const prices = {};
    for (const [plan, priceId] of Object.entries(PLAN_PRICE_IDS)) {
      if (!priceId) continue;
      const price = await stripe.prices.retrieve(priceId);
      prices[plan] = {
        amount: price.unit_amount / 100,
        currency: price.currency,
        recurring: price.recurring || null,
        id: price.id
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(prices)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}; 