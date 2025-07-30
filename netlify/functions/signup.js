// Signup and payment processing for Riva
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Storage for signups
const SIGNUPS_FILE = '/tmp/signups.json';

// Plans configuration
const PLANS = {
  trial: {
    id: 'trial',
    name: 'Free Trial',
    price: 0,
    leads: 5,
    duration: '1 month',
    taxRate: 0
  },
  starter: {
    id: 'starter',
    name: 'Starter Plan',
    price: 497,
    leads: 15,
    duration: '1 month',
    taxRate: 0.08 // 8% tax rate - adjust for your location
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: 997,
    leads: 35,
    duration: '1 month',
    taxRate: 0.08 // 8% tax rate - adjust for your location
  }
};

// Security configuration
const SECURITY_CONFIG = {
  MAX_REQUESTS_PER_IP: 3,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
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

// Calculate tax and totals
function calculateTotals(plan, state = null) {
  const subtotal = plan.price;
  const taxRate = plan.taxRate;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxRate: taxRate,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

// Generate order confirmation
function generateOrderConfirmation(signup, plan, totals) {
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
    status: signup.isTrial ? 'trial_active' : 'payment_pending'
  };
}

// Store signup securely
async function storeSignup(data, clientIP, event, orderConfirmation = null) {
  const signup = {
    id: crypto.randomBytes(8).toString('hex'),
    timestamp: new Date().toISOString(),
    name: data.name,
    business: data.business,
    email: data.email,
    phone: data.phone,
    website: data.website,
    idealClient: data.idealClient,
    leadGoal: data.leadGoal,
    selectedPlan: data.selectedPlan,
    isTrial: data.isTrial,
    clientIP,
    userAgent: event.headers['user-agent'] || 'Unknown',
    status: data.isTrial ? 'trial_active' : 'payment_pending',
    orderConfirmation
  };
  
  // Remove sensitive payment data before storage
  delete signup.cardNumber;
  delete signup.cardExpiry;
  delete signup.cardCvc;
  delete signup.cardName;
  
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

// Process payment securely (placeholder for real payment processor)
async function processPayment(paymentData, plan, totals) {
  // ⚠️ IMPORTANT: This is a placeholder implementation
  // In production, integrate with Stripe, PayPal, or your preferred payment processor
  
  console.log('Processing payment:', {
    plan: plan.name,
    amount: totals.total,
    currency: 'USD',
    customerEmail: paymentData.email,
    // DO NOT log card details in production
    cardLast4: '****' + paymentData.cardNumber.slice(-4)
  });
  
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo purposes, always succeed
  // In production, handle payment failures appropriately
  return {
    success: true,
    transactionId: crypto.randomBytes(8).toString('hex'),
    amount: totals.total,
    currency: 'USD',
    status: 'completed'
  };
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
      idealClient: sanitizeInput(parsedBody.idealClient, SECURITY_CONFIG.MAX_IDEAL_CLIENT_LENGTH),
      leadGoal: sanitizeInput(parsedBody.leadGoal, 10),
      selectedPlan: parsedBody.selectedPlan,
      isTrial: parsedBody.isTrial,
      plan: parsedBody.plan
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

    // Validate plan
    const plan = PLANS[data.selectedPlan];
    if (!plan) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid plan selected' })
      };
    }

    // Calculate totals
    const totals = calculateTotals(plan);

    // Process payment for paid plans
    if (!data.isTrial) {
      const paymentData = {
        cardNumber: parsedBody.cardNumber?.replace(/\s/g, ''),
        cardExpiry: parsedBody.cardExpiry,
        cardCvc: parsedBody.cardCvc,
        cardName: parsedBody.cardName,
        email: data.email
      };

      // Basic payment validation (in production, use payment processor validation)
      if (!paymentData.cardNumber || paymentData.cardNumber.length < 13) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid card number' })
        };
      }

      if (!paymentData.cardExpiry || !/^\d{2}\/\d{2}$/.test(paymentData.cardExpiry)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid expiry date format (MM/YY)' })
        };
      }

      if (!paymentData.cardCvc || paymentData.cardCvc.length < 3) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid CVC' })
        };
      }

      if (!paymentData.cardName?.trim()) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Cardholder name is required' })
        };
      }

      // Process payment
      try {
        const paymentResult = await processPayment(paymentData, plan, totals);
        if (!paymentResult.success) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Payment failed. Please try again.' })
          };
        }
        
        // Add payment info to data (without sensitive card details)
        data.payment = {
          transactionId: paymentResult.transactionId,
          amount: paymentResult.amount,
          currency: paymentResult.currency,
          status: paymentResult.status
        };
      } catch (paymentError) {
        console.error('Payment processing error:', paymentError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Payment processing failed. Please try again.' })
        };
      }
    }

    // Generate order confirmation
    const orderConfirmation = generateOrderConfirmation(data, plan, totals);

    // Store the signup securely
    const signup = await storeSignup(data, clientIP, event, orderConfirmation);

    // Log the signup details (without sensitive data)
    console.log('Signup successful:', {
      name: data.name,
      email: data.email,
      plan: plan.name,
      isTrial: data.isTrial,
      orderId: orderConfirmation.orderId,
      total: totals.total,
      clientIP,
      signupId: signup.id
    });

    // Success response with order confirmation
    const message = data.isTrial 
      ? `Welcome to Riva! Your free trial is now active. You'll receive up to ${plan.leads} qualified leads in your first month. Check your email for next steps.`
      : `Welcome to Riva! Your ${plan.name} is now active. You'll receive up to ${plan.leads} qualified leads monthly. Check your email for next steps.`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message,
        success: true,
        signupId: signup.id,
        orderConfirmation,
        plan: plan.name,
        isTrial: data.isTrial,
        leads: plan.leads,
        totals
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: 'Something went wrong. Please try again later.'
      })
    };
  }
}; 