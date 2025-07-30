const Stripe = require('stripe');
const crypto = require('crypto');
const fs = require('fs').promises;
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// trigger redeploy for Netlify debugging

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  maxNetworkRetries: 3,
});

// Initialize Supabase
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY?.slice(0, 8));
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Storage for signups
const SIGNUPS_FILE = '/tmp/signups.json';

// Optimized pricing strategy
const STRIPE_PLANS = {
  trial: {
    id: 'trial',
    name: 'Free Trial',
    price: 0,
    leads: 5,
    duration: '1 month',
    taxRate: 0,
    stripePriceId: null
  },
  starter: {
    id: 'starter',
    name: 'Starter Plan',
    price: 79,
    leads: 15,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: 159,
    leads: 35,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID
  },
  payperlead: {
    id: 'payperlead',
    name: 'Pay-Per-Lead',
    price: 25,
    leads: 1,
    duration: 'per lead',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_PAYPERLEAD_PRICE_ID
  },
  seo: {
    id: 'seo',
    name: 'SEO',
    price: 399,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_SEO_STANDALONE_PRICE_ID
  },
  seo_addon: {
    id: 'seo_addon',
    name: 'SEO (Add-On)',
    price: 319,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_SEO_ADDON_PRICE_ID
  },
  ppc: {
    id: 'ppc',
    name: 'PPC',
    price: 299,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_PPC_STANDALONE_PRICE_ID
  },
  ppc_addon: {
    id: 'ppc_addon',
    name: 'PPC (Add-On)',
    price: 229,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_PPC_ADDON_PRICE_ID
  },
  social: {
    id: 'social',
    name: 'Social Media',
    price: 199,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_SOCIAL_STANDALONE_PRICE_ID
  },
  social_addon: {
    id: 'social_addon',
    name: 'Social Media (Add-On)',
    price: 149,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_SOCIAL_ADDON_PRICE_ID
  },
  content: {
    id: 'content',
    name: 'Content Marketing',
    price: 299,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_CONTENT_STANDALONE_PRICE_ID
  },
  content_addon: {
    id: 'content_addon',
    name: 'Content Marketing (Add-On)',
    price: 229,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_CONTENT_ADDON_PRICE_ID
  },
  email: {
    id: 'email',
    name: 'Email Marketing',
    price: 149,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_EMAIL_STANDALONE_PRICE_ID
  },
  email_addon: {
    id: 'email_addon',
    name: 'Email Marketing (Add-On)',
    price: 99,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_EMAIL_ADDON_PRICE_ID
  },
  reputation: {
    id: 'reputation',
    name: 'Reputation Management',
    price: 119,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_REPUTATION_STANDALONE_PRICE_ID
  },
  reputation_addon: {
    id: 'reputation_addon',
    name: 'Reputation Management (Add-On)',
    price: 89,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_REPUTATION_ADDON_PRICE_ID
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics & Reporting',
    price: 99,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_ANALYTICS_STANDALONE_PRICE_ID
  },
  analytics_addon: {
    id: 'analytics_addon',
    name: 'Analytics & Reporting (Add-On)',
    price: 69,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_ANALYTICS_ADDON_PRICE_ID
  },
  webdesign: {
    id: 'webdesign',
    name: 'Web Design & Development',
    price: 1999,
    duration: 'one-time',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_WEBDESIGN_PRICE_ID
  },
  growth_bundle: {
    id: 'growth_bundle',
    name: 'Growth Bundle',
    price: 799,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_GROWTH_BUNDLE_PRICE_ID
  },
  brand_bundle: {
    id: 'brand_bundle',
    name: 'Brand Builder Bundle',
    price: 599,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_BRAND_BUNDLE_PRICE_ID
  },
  ultimate_bundle: {
    id: 'ultimate_bundle',
    name: 'Ultimate Bundle',
    price: 999,
    duration: 'per month',
    taxRate: 0.08,
    stripePriceId: process.env.STRIPE_ULTIMATE_BUNDLE_PRICE_ID
  }
};

// Security configuration
const SECURITY_CONFIG = {
  MAX_REQUESTS_PER_IP: 10, // was 3, now more relaxed
  RATE_LIMIT_WINDOW: 60 * 60 * 1000, // was 15 * 60 * 1000 (15 min), now 1 hour
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 254,
  MAX_BUSINESS_LENGTH: 100,
  MAX_PHONE_LENGTH: 20,
  MAX_WEBSITE_LENGTH: 200,
  MAX_IDEAL_CLIENT_LENGTH: 500
};

// Rate limiting storage
const rateLimitStore = new Map();

// Rate limiting function
function checkRateLimit(clientIP) {
  const now = Date.now();
  const windowStart = now - SECURITY_CONFIG.RATE_LIMIT_WINDOW;
  
  if (!rateLimitStore.has(clientIP)) {
    rateLimitStore.set(clientIP, []);
  }
  
  const requests = rateLimitStore.get(clientIP);
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  rateLimitStore.set(clientIP, validRequests);
  
  if (validRequests.length >= SECURITY_CONFIG.MAX_REQUESTS_PER_IP) {
    return false;
  }
  
  validRequests.push(now);
  return true;
}

// Input sanitization
function sanitizeInput(input, maxLength = 100) {
  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  sanitized = sanitized.trim();
  
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

// Validate email format
function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= SECURITY_CONFIG.MAX_EMAIL_LENGTH;
}

// Calculate totals with profit analysis
function calculateTotals(plan) {
  const subtotal = plan.price;
  const taxRate = plan.taxRate;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  
  // Profit analysis
  const stripeFee = total * 0.029 + 0.30;
  const netProfit = total - stripeFee;
  const profitMargin = (netProfit / total) * 100;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxRate: taxRate,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    stripeFee: Math.round(stripeFee * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    profitMargin: Math.round(profitMargin * 100) / 100
  };
}

// Generate order confirmation
function generateOrderConfirmation(signup, plan, totals, stripeData = null) {
  const orderId = crypto.randomBytes(8).toString('hex').toUpperCase();
  const confirmationNumber = `RIVA-${Date.now().toString().slice(-8)}`;
  
  return {
    orderId,
    confirmationNumber,
    customerName: signup.name,
    customerEmail: signup.email,
    plan: plan.name,
    leads: plan.leads,
    duration: plan.duration,
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    total: totals.total,
    currency: 'USD',
    date: new Date().toISOString(),
    status: signup.isTrial ? 'trial_active' : 'payment_completed',
    stripeCustomerId: stripeData?.customerId,
    stripeSubscriptionId: stripeData?.subscriptionId,
    profitMargin: totals.profitMargin,
    netProfit: totals.netProfit
  };
}

// Store signup securely
async function storeSignup(data, clientIP, event, orderConfirmation) {
  const signup = {
    id: crypto.randomBytes(8).toString('hex'),
    timestamp: new Date().toISOString(),
    name: data.name,
    business: data.business,
    email: data.email,
    phone: data.phone,
    website: data.website,
    idealclient: data.idealclient,
    leadGoal: data.leadGoal,
    selectedPlan: data.selectedPlan,
    isTrial: data.isTrial,
    clientIP,
    userAgent: event.headers['user-agent'] || 'Unknown',
    status: data.isTrial ? 'trial_active' : 'payment_completed',
    orderConfirmation,
    stripeData: {
      customerId: orderConfirmation.stripeCustomerId,
      subscriptionId: orderConfirmation.stripeSubscriptionId
    }
  };
  
  try {
    // Ensure the file exists
    try {
      await fs.access(SIGNUPS_FILE);
    } catch {
      await fs.writeFile(SIGNUPS_FILE, '[]');
    }
    
    // Read existing signups
    const fileContent = await fs.readFile(SIGNUPS_FILE, 'utf8');
    let signups = [];
    
    try {
      signups = JSON.parse(fileContent);
    } catch (parseError) {
      console.error('Error parsing signups file, starting fresh:', parseError);
      signups = [];
    }
    
    // Add new signup to the beginning
    signups.unshift(signup);
    
    // Write back to file
    await fs.writeFile(SIGNUPS_FILE, JSON.stringify(signups, null, 2));
    
    console.log(`Signup stored successfully. Total signups: ${signups.length}`);
    return signup;
  } catch (error) {
    console.error('Error storing signup:', error);
    throw error;
  }
}

// Create Stripe customer
async function createStripeCustomer(customerData) {
  try {
    const customer = await stripe.customers.create({
      email: customerData.email,
      name: customerData.name,
      phone: customerData.phone || undefined,
      metadata: {
        business_name: customerData.business || 'N/A',
        website: customerData.website || 'N/A',
        lead_goal: customerData.leadGoal || 'N/A',
        ideal_client: customerData.idealclient || 'N/A',
        signup_source: 'riva_website',
        signup_date: new Date().toISOString()
      }
    });
    
    console.log('Stripe customer created:', customer.id);
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

// Create Stripe subscription
async function createStripeSubscription(customer, plan, paymentMethodId) {
  try {
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: plan.stripePriceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        plan_type: plan.id,
        leads_per_month: plan.leads,
        customer_name: customer.name,
        customer_email: customer.email,
        business_name: customer.metadata.business_name,
        subscription_start: new Date().toISOString()
      }
    });

    console.log('Stripe subscription created:', subscription.id);
    return subscription;
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    throw error;
  }
}

// Process trial signup
async function processTrialSignup(customerData, clientIP, event) {
  const plan = STRIPE_PLANS.trial;
  const totals = calculateTotals(plan);
  
  // Create Stripe customer for trial
  const customer = await createStripeCustomer(customerData);
  
  // Generate order confirmation
  const orderConfirmation = generateOrderConfirmation(
    customerData, 
    plan, 
    totals, 
    { customerId: customer.id }
  );
  
  // Store signup
  const signup = await storeSignup(customerData, clientIP, event, orderConfirmation);
  
  return {
    success: true,
    customer,
    orderConfirmation,
    signup
  };
}

// Process paid signup
async function processPaidSignup(customerData, paymentMethodId, clientIP, event) {
  const plan = STRIPE_PLANS[customerData.selectedPlan];
  const totals = calculateTotals(plan);
  
  // Create Stripe customer
  const customer = await createStripeCustomer(customerData);
  
  // Create subscription
  const subscription = await createStripeSubscription(customer, plan, paymentMethodId);
  
  // Generate order confirmation
  const orderConfirmation = generateOrderConfirmation(
    customerData, 
    plan, 
    totals, 
    { 
      customerId: customer.id,
      subscriptionId: subscription.id
    }
  );
  
  // Store signup
  const signup = await storeSignup(customerData, clientIP, event, orderConfirmation);
  
  return {
    success: true,
    customer,
    subscription,
    orderConfirmation,
    signup
  };
}

// List of known disposable email domains (partial, can be expanded)
const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'yopmail.com', 'trashmail.com', 'getnada.com', 'dispostable.com', 'maildrop.cc', 'fakeinbox.com', 'sharklasers.com', 'spamgourmet.com', 'mintemail.com', 'mailnesia.com', 'temp-mail.org', 'emailondeck.com', 'throwawaymail.com', 'moakt.com', 'mytemp.email', 'mailcatch.com', 'mailnull.com', 'openmailbox.org', 'spam4.me', 'mail-temp.com', 'tempinbox.com', 'temp-mail.io', 'mailpoof.com', 'instantemailaddress.com', 'mailbox52.ga', 'mailbox92.biz', 'mailboxy.fun', 'mailboxy.info', 'mailboxy.me', 'mailboxy.net', 'mailboxy.org', 'mailboxy.xyz', 'mailboxy.top', 'mailboxy.site', 'mailboxy.store', 'mailboxy.tech', 'mailboxy.space', 'mailboxy.club', 'mailboxy.online', 'mailboxy.email', 'mailboxy.pro', 'mailboxy.biz', 'mailboxy.co', 'mailboxy.us', 'mailboxy.uk', 'mailboxy.eu', 'mailboxy.ca', 'mailboxy.au', 'mailboxy.nz', 'mailboxy.in', 'mailboxy.cn', 'mailboxy.ru', 'mailboxy.jp', 'mailboxy.kr', 'mailboxy.tw', 'mailboxy.hk', 'mailboxy.sg', 'mailboxy.my', 'mailboxy.ph', 'mailboxy.id', 'mailboxy.vn', 'mailboxy.th', 'mailboxy.la', 'mailboxy.kh', 'mailboxy.mm', 'mailboxy.lk', 'mailboxy.bd', 'mailboxy.pk', 'mailboxy.af', 'mailboxy.ir', 'mailboxy.tr', 'mailboxy.sa', 'mailboxy.ae', 'mailboxy.qa', 'mailboxy.om', 'mailboxy.bh', 'mailboxy.kw', 'mailboxy.eg', 'mailboxy.ma', 'mailboxy.tn', 'mailboxy.dz', 'mailboxy.ng', 'mailboxy.za', 'mailboxy.ke', 'mailboxy.ug', 'mailboxy.tz', 'mailboxy.rw', 'mailboxy.bi', 'mailboxy.mw', 'mailboxy.mz', 'mailboxy.zm', 'mailboxy.zw', 'mailboxy.bw', 'mailboxy.na', 'mailboxy.sz', 'mailboxy.ls', 'mailboxy.cm', 'mailboxy.ga', 'mailboxy.cg', 'mailboxy.cd', 'mailboxy.ao', 'mailboxy.mg', 'mailboxy.mu', 'mailboxy.sc', 'mailboxy.re', 'mailboxy.yt', 'mailboxy.pm', 'mailboxy.gp', 'mailboxy.mq', 'mailboxy.gf', 'mailboxy.sr', 'mailboxy.aw', 'mailboxy.cw', 'mailboxy.sx', 'mailboxy.bq', 'mailboxy.saba', 'mailboxy.eh', 'mailboxy.ps', 'mailboxy.lb', 'mailboxy.sy', 'mailboxy.jo', 'mailboxy.iq', 'mailboxy.ye', 'mailboxy.om', 'mailboxy.kw', 'mailboxy.bh', 'mailboxy.qa', 'mailboxy.ae', 'mailboxy.sa', 'mailboxy.ir', 'mailboxy.tr', 'mailboxy.cy', 'mailboxy.gr', 'mailboxy.bg', 'mailboxy.ro', 'mailboxy.md', 'mailboxy.ua', 'mailboxy.by', 'mailboxy.lt', 'mailboxy.lv', 'mailboxy.ee', 'mailboxy.fi', 'mailboxy.se', 'mailboxy.no', 'mailboxy.dk', 'mailboxy.is', 'mailboxy.ie', 'mailboxy.uk', 'mailboxy.be', 'mailboxy.nl', 'mailboxy.lu', 'mailboxy.fr', 'mailboxy.de', 'mailboxy.ch', 'mailboxy.at', 'mailboxy.it', 'mailboxy.es', 'mailboxy.pt', 'mailboxy.ad', 'mailboxy.mc', 'mailboxy.sm', 'mailboxy.va', 'mailboxy.mt', 'mailboxy.al', 'mailboxy.mk', 'mailboxy.rs', 'mailboxy.me', 'mailboxy.si', 'mailboxy.hr', 'mailboxy.ba', 'mailboxy.xk', 'mailboxy.md', 'mailboxy.ua', 'mailboxy.by', 'mailboxy.ru', 'mailboxy.kg', 'mailboxy.tj', 'mailboxy.tm', 'mailboxy.uz', 'mailboxy.kz', 'mailboxy.mn', 'mailboxy.cn', 'mailboxy.hk', 'mailboxy.mo', 'mailboxy.tw', 'mailboxy.jp', 'mailboxy.kr', 'mailboxy.kp', 'mailboxy.vn', 'mailboxy.la', 'mailboxy.kh', 'mailboxy.th', 'mailboxy.mm', 'mailboxy.lk', 'mailboxy.bd', 'mailboxy.bt', 'mailboxy.np', 'mailboxy.pk', 'mailboxy.af', 'mailboxy.in', 'mailboxy.ir', 'mailboxy.tr', 'mailboxy.sy', 'mailboxy.iq', 'mailboxy.jo', 'mailboxy.lb', 'mailboxy.ps', 'mailboxy.ye', 'mailboxy.om', 'mailboxy.kw', 'mailboxy.bh', 'mailboxy.qa', 'mailboxy.ae', 'mailboxy.sa', 'mailboxy.ir', 'mailboxy.tr', 'mailboxy.cy', 'mailboxy.gr', 'mailboxy.bg', 'mailboxy.ro', 'mailboxy.md', 'mailboxy.ua', 'mailboxy.by', 'mailboxy.lt', 'mailboxy.lv', 'mailboxy.ee', 'mailboxy.fi', 'mailboxy.se', 'mailboxy.no', 'mailboxy.dk', 'mailboxy.is', 'mailboxy.ie', 'mailboxy.uk', 'mailboxy.be', 'mailboxy.nl', 'mailboxy.lu', 'mailboxy.fr', 'mailboxy.de', 'mailboxy.ch', 'mailboxy.at', 'mailboxy.it', 'mailboxy.es', 'mailboxy.pt', 'mailboxy.ad', 'mailboxy.mc', 'mailboxy.sm', 'mailboxy.va', 'mailboxy.mt', 'mailboxy.al', 'mailboxy.mk', 'mailboxy.rs', 'mailboxy.me', 'mailboxy.si', 'mailboxy.hr', 'mailboxy.ba', 'mailboxy.xk'];

function isDisposableEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function sendVerificationEmail(email, name, token, planType = 'trial') {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const siteUrl = process.env.SITE_URL || 'https://rivaofficial.netlify.app';
  const verifyUrl = `${siteUrl}/.netlify/functions/verify?token=${token}`;
  const isTrial = planType === 'trial';
  const planName = isTrial ? 'Free Trial' : 'Paid Plan';
  
  // Set token expiration to 24 hours from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  const payload = {
    sender: { email: senderEmail, name: 'Riva' },
    to: [{ email, name }],
    subject: `Verify your Riva ${planName} account`,
    htmlContent: `
      <h1>Welcome to Riva!</h1>
      <p>Thank you for signing up for our ${planName.toLowerCase()}.</p>
      <p>Please verify your email address by clicking the link below. This link will expire in 24 hours.</p>
      <p><a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${verifyUrl}</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `
  };

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Brevo API error:', errorData);
      throw new Error(`Failed to send verification email: ${res.status} ${res.statusText}`);
    }
    
    // Store token expiration in the database
    await supabase
      .from('submissions2')
      .update({ 
        verification_token_expires: expiresAt.toISOString() 
      })
      .eq('verification_token', token);
      
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
    throw error;
  }
}

// Replace any hardcoded tax logic with:
function calculateTaxAmount(amount, state) {
  if (typeof state === 'string' && state.trim().toLowerCase() === 'michigan') {
    return Math.round(amount * 0.06 * 100) / 100; // 6% tax, rounded to cents
  }
  return 0;
}

exports.handler = async (event, context) => {
  // Security headers
  const headers = {
    'Access-Control-Allow-Origin': 'https://rivaofficial.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get client IP for rate limiting
  const clientIP = event.headers['client-ip'] || 
                  event.headers['x-forwarded-for']?.split(',')[0] || 
                  event.headers['x-real-ip'] || 
                  'unknown';

  try {
    // Rate limiting check
    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ 
          error: 'Too many signup attempts. Please try again later.',
          message: 'Rate limit exceeded'
        })
      };
    }

    // Validate Content-Type
    const contentType = event.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid content type' })
      };
    }

    // Parse and validate JSON
    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON format' })
      };
    }

    // Extract and sanitize data
    const data = {
      name: sanitizeInput(parsedBody.name, SECURITY_CONFIG.MAX_NAME_LENGTH),
      business: sanitizeInput(parsedBody.business, SECURITY_CONFIG.MAX_BUSINESS_LENGTH),
      email: sanitizeInput(parsedBody.email, SECURITY_CONFIG.MAX_EMAIL_LENGTH).toLowerCase(),
      phone: sanitizeInput(parsedBody.phone, SECURITY_CONFIG.MAX_PHONE_LENGTH),
      website: sanitizeInput(parsedBody.website, SECURITY_CONFIG.MAX_WEBSITE_LENGTH),
      idealclient: sanitizeInput(parsedBody.idealClient, SECURITY_CONFIG.MAX_IDEAL_CLIENT_LENGTH),
      serviceType: sanitizeInput(parsedBody.serviceType, 50),
      selectedPlan: parsedBody.selectedPlan, // legacy, for compatibility
      selectedCore: parsedBody.selectedCore,
      selectedAddons: Array.isArray(parsedBody.selectedAddons) ? parsedBody.selectedAddons : [],
      isTrial: parsedBody.isTrial,
      paymentMethodId: parsedBody.paymentMethodId,
      state: parsedBody.state
    };

    // Validate required fields
    if (!data.name || !data.email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name and email are required' })
      };
    }

    // Validate email format
    if (!validateEmail(data.email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    // Validate core plan
    const corePlan = STRIPE_PLANS[data.selectedCore];
    if (!corePlan) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid core plan selected' })
      };
    }
    // Validate add-ons
    const addonPlans = (data.selectedAddons || []).map(id => STRIPE_PLANS[id]).filter(Boolean);

    // Calculate total price
    const subtotal = corePlan.price + addonPlans.reduce((sum, p) => sum + p.price, 0);
    const effectiveTaxRate = data.state === 'MI' ? 0.06 : corePlan.taxRate;
    const taxAmount = subtotal * effectiveTaxRate;
    const totalAmount = subtotal + taxAmount;

    // Use totalAmount for Stripe payment intent or subscription
    let result;
    if (data.isTrial) {
      // Block disposable/temporary email domains
      if (isDisposableEmail(data.email)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Disposable or temporary email addresses are not allowed for free trials.' })
        };
      }
      // Efficient anti-abuse: combine all checks into one query
      let abuseError = null;
      try {
        const res = await supabase
          .from('submissions2')
          .select('id, email, clientip, created_at')
          .or(`email.eq.${data.email},clientip.eq.${clientIP}`)
          .eq('plan', 'trial');
        // Very relaxed limits for testing
        const now = Date.now();
        const oneDayAgo = now - (24 * 60 * 60 * 1000); // Last 24 hours
        
        // Only check for very excessive IP usage (e.g., > 50 signups per day)
        const recentTrialsFromIP = res.data.filter(row => 
          row.clientip === clientIP && 
          new Date(row.created_at).getTime() > oneDayAgo
        );
        
        if (recentTrialsFromIP.length >= 50) {
          abuseError = 'Too many free trial signups from this IP address recently. Please try again later or contact support.';
        }
        
        // Allow multiple trials per email/IP with a reasonable limit
        const maxTrialsPerEmail = 10; // Increased from 3
        const recentTrialsForEmail = res.data.filter(row => 
          row.email === data.email &&
          new Date(row.created_at).getTime() > oneDayAgo
        );
        
        if (recentTrialsForEmail.length >= maxTrialsPerEmail) {
          abuseError = 'You have reached the daily free trial limit for this email address. Please try again tomorrow or contact support.';
        }
      } catch (err) {
        console.error('Supabase query error (anti-abuse):', err);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error checking for abuse', details: err.message || err })
        };
      }
      if (abuseError) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: abuseError })
        };
      }
      // Generate verification token
      const verificationToken = generateVerificationToken();
      // Remove fields not in the schema before insert and map to correct column names
      const { isTrial, paymentMethodId, selectedPlan, state, selectedAddons, selectedCore, ...dataForInsert } = data;
      if (selectedCore !== undefined) dataForInsert.selectedcore = selectedCore;
      if (selectedAddons !== undefined) dataForInsert.selectedaddons = selectedAddons;
      if (data.serviceType) dataForInsert.servicetype = data.serviceType;
      // Insert into Supabase (store all selected plans)
      const { data: inserted, error: insertError } = await supabase
        .from('submissions2')
        .insert([
          {
            ...dataForInsert,
            plan: 'trial',
            status: 'trial_pending',
            verified: false,
            verification_token: verificationToken,
            clientip: clientIP,
          },
        ])
        .select('id, email, name, verification_token')
        .single();
      console.log('Insert result:', inserted);
      console.error('Insert error:', insertError);
      if (insertError) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error saving trial signup', details: insertError.message || insertError })
        };
      }
      // Send verification email synchronously
      try {
        await sendVerificationEmail(data.email, data.name, verificationToken);
        console.log('Verification email sent successfully');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Check your email to verify your account and activate your free trial.' })
        };
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Still return success since the user was created, but log the error
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            message: 'Account created! However, we encountered an issue sending the verification email. Please contact support to verify your account.',
            warning: 'verification_email_failed'
          })
        };
      }
    } else {
      // Only require payment method for paid plans
      if (!data.paymentMethodId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Payment method is required for paid plans' })
        };
      }
      // Only require payment method for paid plans
      const verificationToken = generateVerificationToken();
      // Create Stripe customer
      const customer = await createStripeCustomer(data);
      // Create Stripe subscription with multiple items
      const items = [
        { price: corePlan.stripePriceId }
      ];
      for (const addon of addonPlans) {
        items.push({ price: addon.stripePriceId });
      }
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          plan_type: corePlan.id,
          add_ons: addonPlans.map(a => a.id).join(','),
          customer_name: customer.name,
          customer_email: customer.email,
          business_name: customer.metadata.business_name,
          subscription_start: new Date().toISOString()
        }
      });
      // Store submission with verified: false and token
      // Remove fields not in the schema before insert and map to correct column names
      const { selectedAddons, selectedCore, ...paidDataForInsert } = data;
      paidDataForInsert.selectedcore = selectedCore;
      paidDataForInsert.selectedaddons = selectedAddons;
      if (data.serviceType) paidDataForInsert.servicetype = data.serviceType;
      const { data: paidInserted, error: paidInsertError } = await supabase
        .from('submissions2')
        .insert([
          {
            ...paidDataForInsert,
            plan: corePlan.id,
            status: 'pending',
            verified: false,
            verification_token: verificationToken,
            clientip: clientIP,
            stripe_customer_id: customer.id,
            stripe_subscription_id: subscription.id
          },
        ])
        .select()
        .single();
      if (paidInsertError) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error saving signup' })
        };
      }
      // Send verification email
      await sendVerificationEmail(data.email, data.name, verificationToken);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Check your email to verify your account and activate your plan.' })
      };
    }

  } catch (error) {
    console.error('Function error:', error);
    
    // Handle Stripe-specific errors
    if (error.type === 'StripeCardError') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Payment failed',
          message: error.message
        })
      };
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid payment information',
          message: 'Please check your payment details and try again.'
        })
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message || error,
        stack: error.stack || null
      })
    };
  }
}; 