import { loadStripe } from '@stripe/stripe-js';

// Stripe configuration
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Optimized pricing strategy for maximum profit
export const STRIPE_PLANS = {
  trial: {
    id: 'trial',
    name: 'Free Trial',
    price: 0,
    leads: 5,
    duration: '1 month',
    taxRate: 0.06,
    stripePriceId: null,
    description: 'Up to 5 qualified leads (volume may vary)',
    features: [
      'Up to 5 pre-qualified leads (volume may vary)',
      'No credit card required',
      'Full lead details & contact info',
      'Email & phone support',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Start Free Trial'
  },
  starter: {
    id: 'starter',
    name: 'Starter Plan',
    price: 99,
    leads: 15,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
    description: 'Up to 15 qualified leads per month (volume may vary)',
    features: [
      'Up to 15 pre-qualified leads per month (volume may vary)',
      'Priority lead delivery',
      'Full lead details & contact info',
      'Email & phone support',
      'Lead scoring & filtering',
      'Cancel anytime'
    ],
    popular: true,
    buttonText: 'Start Starter Plan'
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: 179,
    leads: 35,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    description: 'Up to 35 qualified leads per month (volume may vary)',
    features: [
      'Up to 35 pre-qualified leads per month (volume may vary)',
      'Priority lead delivery',
      'Full lead details & contact info',
      'Dedicated account manager',
      'Advanced lead scoring',
      'Custom lead criteria',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Start Pro Plan'
  },
  payperlead: {
    id: 'payperlead',
    name: 'Pay-Per-Lead',
    price: 25,
    leads: 1,
    duration: 'per lead',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_PAYPERLEAD_PRICE_ID,
    description: 'Buy leads one at a time. No subscription required. Volume may vary.',
    features: [
      '1 pre-qualified lead (as available)',
      'Full lead details & contact info',
      'No subscription required',
      'Email & phone support',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Order Lead'
  },
  seo: {
    id: 'seo',
    name: 'SEO',
    price: 199,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_SEO_STANDALONE_PRICE_ID,
    description: 'Full SEO service, standalone',
    features: [
      'On-page & technical SEO',
      'Local & national ranking',
      'Monthly reporting',
      'Google Business Profile',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Get SEO'
  },
  seo_addon: {
    id: 'seo_addon',
    name: 'SEO (Add-On)',
    price: 149,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_SEO_ADDON_PRICE_ID,
    description: 'SEO as add-on to Lead Gen',
    features: [
      'All SEO features',
      'Discounted as add-on',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Add SEO'
  },
  ppc: {
    id: 'ppc',
    name: 'PPC',
    price: 299,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_PPC_STANDALONE_PRICE_ID,
    description: 'PPC management, standalone',
    features: [
      'Google Ads management',
      'Conversion tracking',
      'Monthly optimization',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Get PPC'
  },
  ppc_addon: {
    id: 'ppc_addon',
    name: 'PPC (Add-On)',
    price: 249,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_PPC_ADDON_PRICE_ID,
    description: 'PPC as add-on to Lead Gen',
    features: [
      'All PPC features',
      'Discounted as add-on',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Add PPC'
  },
  social: {
    id: 'social',
    name: 'Social Media',
    price: 199,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_SOCIAL_STANDALONE_PRICE_ID,
    description: 'Social media management, standalone',
    features: [
      'Content creation',
      'Posting & engagement',
      'Monthly reporting',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Get Social Media'
  },
  social_addon: {
    id: 'social_addon',
    name: 'Social Media (Add-On)',
    price: 149,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_SOCIAL_ADDON_PRICE_ID,
    description: 'Social as add-on to Lead Gen',
    features: [
      'All Social Media features',
      'Discounted as add-on',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Add Social Media'
  },
  content: {
    id: 'content',
    name: 'Content Marketing',
    price: 299,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_CONTENT_STANDALONE_PRICE_ID,
    description: 'Content marketing, standalone',
    features: [
      'Blog & article writing',
      'Content strategy',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Get Content Marketing'
  },
  content_addon: {
    id: 'content_addon',
    name: 'Content Marketing (Add-On)',
    price: 249,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_CONTENT_ADDON_PRICE_ID,
    description: 'Content as add-on to Lead Gen',
    features: [
      'All Content Marketing features',
      'Discounted as add-on',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Add Content Marketing'
  },
  email: {
    id: 'email',
    name: 'Email Marketing',
    price: 199,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_EMAIL_STANDALONE_PRICE_ID,
    description: 'Email marketing, standalone',
    features: [
      'Campaign setup',
      'List management',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Get Email Marketing'
  },
  email_addon: {
    id: 'email_addon',
    name: 'Email Marketing (Add-On)',
    price: 99,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_EMAIL_ADDON_PRICE_ID,
    description: 'Email as add-on to Lead Gen',
    features: [
      'All Email Marketing features',
      'Discounted as add-on',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Add Email Marketing'
  },
  reputation: {
    id: 'reputation',
    name: 'Reputation Management',
    price: 99,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_REPUTATION_STANDALONE_PRICE_ID,
    description: 'Reputation management, standalone',
    features: [
      'Review monitoring',
      'Response management',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Get Reputation Mgmt'
  },
  reputation_addon: {
    id: 'reputation_addon',
    name: 'Reputation Management (Add-On)',
    price: 79,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_REPUTATION_ADDON_PRICE_ID,
    description: 'Reputation as add-on to Lead Gen',
    features: [
      'All Reputation Mgmt features',
      'Discounted as add-on',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Add Reputation Mgmt'
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics & Reporting',
    price: 99,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_ANALYTICS_STANDALONE_PRICE_ID,
    description: 'Analytics & reporting, standalone',
    features: [
      'Custom dashboards',
      'Monthly insights',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Get Analytics'
  },
  analytics_addon: {
    id: 'analytics_addon',
    name: 'Analytics & Reporting (Add-On)',
    price: 79,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_ANALYTICS_ADDON_PRICE_ID,
    description: 'Analytics as add-on to Lead Gen',
    features: [
      'All Analytics features',
      'Discounted as add-on',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Add Analytics'
  },
  webdesign: {
    id: 'webdesign',
    name: 'Web Design & Development',
    price: 499,
    duration: 'one-time',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_WEBDESIGN_PRICE_ID,
    description: 'Custom website design (starting at)',
    features: [
      'Custom design',
      'Mobile responsive',
      'SEO optimized',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Get Web Design'
  },
  growth_bundle: {
    id: 'growth_bundle',
    name: 'Growth Bundle',
    price: 499,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_GROWTH_BUNDLE_PRICE_ID,
    description: 'Lead Gen Pro + SEO + PPC',
    features: [
      'Lead Gen Pro',
      'SEO',
      'PPC',
      'Bundle savings',
      'Cancel anytime'
    ],
    popular: true,
    buttonText: 'Get Growth Bundle'
  },
  brand_bundle: {
    id: 'brand_bundle',
    name: 'Brand Builder Bundle',
    price: 299,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_BRAND_BUNDLE_PRICE_ID,
    description: 'Lead Gen Starter + Social + Reputation',
    features: [
      'Lead Gen Starter',
      'Social Media',
      'Reputation Mgmt',
      'Bundle savings',
      'Cancel anytime'
    ],
    popular: false,
    buttonText: 'Get Brand Builder'
  },
  ultimate_bundle: {
    id: 'ultimate_bundle',
    name: 'Ultimate Bundle',
    price: 599,
    duration: 'per month',
    taxRate: 0.06,
    stripePriceId: process.env.STRIPE_ULTIMATE_BUNDLE_PRICE_ID,
    description: 'All services',
    features: [
      'All services included',
      'Best value',
      'Cancel anytime'
    ],
    popular: true,
    buttonText: 'Get Ultimate Bundle'
  }
};

// Calculate optimized totals with profit margins
export const calculateTotals = (plan, taxRate = null) => {
  const subtotal = plan.price;
  const effectiveTaxRate = taxRate !== null ? taxRate : plan.taxRate;
  const taxAmount = subtotal * effectiveTaxRate;
  const total = subtotal + taxAmount;
  
  // Profit analysis
  const stripeFee = total * 0.029 + 0.30; // 2.9% + 30¢
  const netProfit = total - stripeFee;
  const profitMargin = (netProfit / total) * 100;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxRate: effectiveTaxRate,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    stripeFee: Math.round(stripeFee * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    profitMargin: Math.round(profitMargin * 100) / 100
  };
};

// Security and validation functions
export const validateStripePayment = (paymentMethod) => {
  const errors = [];
  
  if (!paymentMethod) {
    errors.push('Payment method is required');
  }
  
  if (paymentMethod && paymentMethod.type !== 'card') {
    errors.push('Only card payments are accepted');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Customer metadata for tracking
export const createCustomerMetadata = (customerData) => ({
  business_name: customerData.business || 'N/A',
  website: customerData.website || 'N/A',
  lead_goal: customerData.leadGoal || 'N/A',
  ideal_client: customerData.idealClient || 'N/A',
  signup_source: 'riva_website',
  signup_date: new Date().toISOString()
});

// Subscription metadata
export const createSubscriptionMetadata = (plan, customerData) => ({
  plan_type: plan.id,
  leads_per_month: plan.leads,
  customer_name: customerData.name,
  customer_email: customerData.email,
  business_name: customerData.business || 'N/A',
  subscription_start: new Date().toISOString()
}); 