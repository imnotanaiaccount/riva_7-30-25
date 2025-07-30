const Stripe = require('stripe');

exports.handler = async function(event, context) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  const headers = {
    'Access-Control-Allow-Origin': 'https://rivaofficial.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { customerId, returnUrl } = JSON.parse(event.body);
    if (!customerId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing customerId' }) };
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || 'https://rivaofficial.netlify.app/',
    });
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Internal server error' })
    };
  }
}; 