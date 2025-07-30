// Security and spam protection for contact form
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variable.');
}

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map();
const adminRateLimitStore = new Map();

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting
  MAX_REQUESTS_PER_IP: 5,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  
  // Admin rate limiting
  MAX_ADMIN_REQUESTS_PER_IP: 10,
  ADMIN_RATE_LIMIT_WINDOW: 5 * 60 * 1000, // 5 minutes
  
  // Input validation
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 254,
  MAX_MESSAGE_LENGTH: 2000,
  MAX_BUSINESS_LENGTH: 100,
  MAX_PHONE_LENGTH: 20,
  MAX_WEBSITE_LENGTH: 200,
  MAX_IDEAL_CLIENT_LENGTH: 500,
  
  // Spam detection - more lenient for business inquiries
  SUSPICIOUS_KEYWORDS: [
    'viagra', 'casino', 'loan', 'debt consolidation', 'credit repair',
    'make money fast', 'work from home', 'earn money online', 'get rich quick',
    'lottery winner', 'click here', 'buy now', 'limited time offer',
    'act now', 'urgent', '100% free', 'no obligation', 'guaranteed income'
  ],
  
  // Allowed project types
  ALLOWED_PROJECT_TYPES: [
    'Website', 'Web App', 'Mobile App', 'E-commerce', 
    'Branding', 'Marketing', 'Other'
  ],
  
  // Allowed lead goals
  ALLOWED_LEAD_GOALS: ['1-5', '6-15', '16-30', '31+'],
  
  // Allowed hear about sources
  ALLOWED_HEAR_ABOUT: [
    'Referral', 'Google Search', 'Social Media', 'Ad', 'Other'
  ]
};

// Timing-safe string comparison to prevent timing attacks
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// Rate limiting function
function checkRateLimit(clientIP, isAdmin = false) {
  const store = isAdmin ? adminRateLimitStore : rateLimitStore;
  const maxRequests = isAdmin ? SECURITY_CONFIG.MAX_ADMIN_REQUESTS_PER_IP : SECURITY_CONFIG.MAX_REQUESTS_PER_IP;
  const window = isAdmin ? SECURITY_CONFIG.ADMIN_RATE_LIMIT_WINDOW : SECURITY_CONFIG.RATE_LIMIT_WINDOW;
  
  const now = Date.now();
  const windowStart = now - window;
  
  if (!store.has(clientIP)) {
    store.set(clientIP, []);
  }
  
  const requests = store.get(clientIP);
  
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  store.set(clientIP, validRequests);
  
  if (validRequests.length >= maxRequests) {
    return false;
  }
  
  validRequests.push(now);
  return true;
}

// Input sanitization
function sanitizeInput(input, maxLength = 100) {
  if (!input || typeof input !== 'string') return '';
  
  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

// Spam detection - more lenient for business inquiries
function detectSpam(data) {
  const text = `${data.name} ${data.email} ${data.message} ${data.business} ${data.idealClient}`.toLowerCase();
  
  // Check for suspicious keywords - increased threshold for business context
  const suspiciousCount = SECURITY_CONFIG.SUSPICIOUS_KEYWORDS.filter(keyword => 
    text.includes(keyword.toLowerCase())
  ).length;
  
  // Increased threshold from 3 to 5 for business inquiries
  if (suspiciousCount >= 5) {
    return { isSpam: true, reason: 'Too many suspicious keywords' };
  }
  
  // Check for excessive caps - more lenient threshold
  const capsRatio = (data.message.match(/[A-Z]/g) || []).length / data.message.length;
  if (capsRatio > 0.8 && data.message.length > 100) { // Increased from 0.7 to 0.8 and 50 to 100
    return { isSpam: true, reason: 'Excessive capitalization' };
  }
  
  // Check for repeated characters - more lenient
  const repeatedChars = /(.)\1{6,}/g; // Increased from 4 to 6
  if (repeatedChars.test(data.message)) {
    return { isSpam: true, reason: 'Repeated characters detected' };
  }
  
  // Check for suspicious email patterns - more specific
  const suspiciousEmails = [
    'test@test.com', 'admin@admin.com', 'user@example.com', 
    'spam@spam.com', 'bot@bot.com', 'fake@fake.com'
  ];
  if (suspiciousEmails.includes(data.email.toLowerCase())) {
    return { isSpam: true, reason: 'Suspicious email address' };
  }
  
  // Check for very short messages that might be spam
  if (data.message.length < 10) {
    return { isSpam: true, reason: 'Message too short' };
  }
  
  // Check for excessive links in message
  const linkCount = (data.message.match(/https?:\/\/[^\s]+/g) || []).length;
  if (linkCount > 3) {
    return { isSpam: true, reason: 'Too many links in message' };
  }
  
  return { isSpam: false };
}

// Validate email format more strictly
function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= SECURITY_CONFIG.MAX_EMAIL_LENGTH;
}

// Validate URL format
function validateURL(url) {
  if (!url) return true; // Optional field
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

// Validate phone format
function validatePhone(phone) {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Store submission permanently in file with security validation
async function storeSubmission(data, clientIP, event) {
  // Validate file path security
  // Remove all file system write logic and references to /tmp/submissions.json. Only use Supabase for storing submissions. Clean up any leftover file system code.
  // The original code had fs.access(SUBMISSIONS_FILE) and fs.writeFile(SUBMISSIONS_FILE, '[]')
  // which are removed as per the edit hint.

  const submission = {
    id: crypto.randomBytes(8).toString('hex'),
    timestamp: new Date().toISOString(),
    ...data,
    clientIP,
    userAgent: event.headers['user-agent'] || 'Unknown'
  };
  
  try {
    // Supabase insert
    const { data: insertedData, error } = await supabase
      .from('submissions')
      .insert([submission])
      .select()
      .single();

    if (error) {
      console.error('Error inserting submission into Supabase:', error);
      throw error;
    }
    
    console.log(`Submission stored successfully in Supabase. Submission ID: ${insertedData.id}`);
    return insertedData;
  } catch (error) {
    console.error('Error storing submission:', error);
    throw error;
  }
}

// Verify admin access with timing-safe comparison
function verifyAdminAccess(adminKey) {
  // Use environment variable for admin key
  const expectedKey = process.env.ADMIN_SECRET_KEY;
  
  if (!expectedKey) {
    console.error('ADMIN_SECRET_KEY environment variable not set');
    return false;
  }
  
  if (!adminKey) {
    console.error('No admin key provided');
    return false;
  }
  
  // Use timing-safe comparison to prevent timing attacks
  const isValid = timingSafeEqual(adminKey, expectedKey);
  
  // Only log success/failure, not details
  if (isValid) {
    console.log('Admin access granted');
  } else {
    console.log('Admin access denied - invalid credentials');
  }
  
  return isValid;
}

exports.handler = async (event, context) => {
  // Security headers
  const headers = {
    'Access-Control-Allow-Origin': 'https://rivaofficial.netlify.app', // Restrict to your domain
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
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

  // Get client IP for rate limiting
  const clientIP = event.headers['client-ip'] || 
                  event.headers['x-forwarded-for']?.split(',')[0] || 
                  event.headers['x-real-ip'] || 
                  'unknown';

  // Handle GET requests for admin view
  if (event.httpMethod === 'GET') {
    // Simple test endpoint
    if (event.queryStringParameters?.test === 'true') {
      console.log('Test endpoint accessed');
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Function is working',
          timestamp: new Date().toISOString(),
          envVarSet: !!process.env.ADMIN_SECRET_KEY
        })
      };
    }
    
    // Admin rate limiting
    if (!checkRateLimit(clientIP, true)) {
      console.log(`Admin rate limit exceeded for IP: ${clientIP}`);
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ 
          error: 'Too many admin requests. Please try again later.',
          message: 'Admin rate limit exceeded'
        })
      };
    }

    // Get admin key from query parameters or Authorization header
    const adminKey = event.queryStringParameters?.key || 
                    event.headers.authorization?.replace('Bearer ', '') ||
                    event.headers['x-admin-key'];

    // Verify admin access
    if (!verifyAdminAccess(adminKey)) {
      console.log(`Unauthorized admin access attempt from IP: ${clientIP}`);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'Unauthorized',
          message: 'Invalid admin credentials'
        })
      };
    }

    // Log successful admin access
    console.log(`Successful admin access from IP: ${clientIP}`);

    // Read submissions from Supabase
    let submissions = [];
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error reading submissions from Supabase:', error);
        throw error;
      }
      submissions = data;
    } catch (error) {
      console.error('Error reading submissions from Supabase:', error);
      submissions = [];
    }
    return {
      statusCode: 200,
      body: JSON.stringify(submissions),
    };
  }

  // Only allow POST requests for form submissions
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Rate limiting check for form submissions
    if (!checkRateLimit(clientIP, false)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
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

    // Extract and sanitize all fields
    const data = {
      name: sanitizeInput(parsedBody.name, SECURITY_CONFIG.MAX_NAME_LENGTH),
      email: sanitizeInput(parsedBody.email, SECURITY_CONFIG.MAX_EMAIL_LENGTH).toLowerCase(),
      projectType: sanitizeInput(parsedBody.projectType, 50),
      message: sanitizeInput(parsedBody.message, SECURITY_CONFIG.MAX_MESSAGE_LENGTH),
      business: sanitizeInput(parsedBody.business, SECURITY_CONFIG.MAX_BUSINESS_LENGTH),
      phone: sanitizeInput(parsedBody.phone, SECURITY_CONFIG.MAX_PHONE_LENGTH),
      website: sanitizeInput(parsedBody.website, SECURITY_CONFIG.MAX_WEBSITE_LENGTH),
      idealClient: sanitizeInput(parsedBody.idealClient, SECURITY_CONFIG.MAX_IDEAL_CLIENT_LENGTH),
      hearAbout: sanitizeInput(parsedBody.hearAbout, 50),
      leadGoal: sanitizeInput(parsedBody.leadGoal, 10),
      budget: sanitizeInput(parsedBody.budget, 100), // Sanitize budget field
      status: parsedBody.status // Extract status from parsed body
    };

    // Validate required fields
    if (!data.name || !data.email || !data.projectType || !data.message) {
      console.log('Missing required fields:', { 
        name: !!data.name, 
        email: !!data.email, 
        projectType: !!data.projectType, 
        message: !!data.message 
      });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Validate email format
    if (!validateEmail(data.email)) {
      console.log('Invalid email format:', data.email);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    // Validate project type
    if (!SECURITY_CONFIG.ALLOWED_PROJECT_TYPES.includes(data.projectType)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid project type' })
      };
    }

    // Validate lead goal if provided
    if (data.leadGoal && !SECURITY_CONFIG.ALLOWED_LEAD_GOALS.includes(data.leadGoal)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid lead goal' })
      };
    }

    // Validate hear about if provided
    if (data.hearAbout && !SECURITY_CONFIG.ALLOWED_HEAR_ABOUT.includes(data.hearAbout)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid source selection' })
      };
    }

    // Validate phone if provided
    if (data.phone && !validatePhone(data.phone)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid phone format' })
      };
    }

    // Validate website if provided
    if (data.website && !validateURL(data.website)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid website URL' })
      };
    }

    // Spam detection
    const spamCheck = detectSpam(data);
    if (spamCheck.isSpam) {
      console.log(`Spam detected from IP ${clientIP}:`, {
        reason: spamCheck.reason,
        name: data.name,
        email: data.email,
        messageLength: data.message.length,
        messagePreview: data.message.substring(0, 100)
      });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Message flagged as spam',
          message: 'Your message appears to be spam. Please revise and try again.',
          debug: process.env.NODE_ENV === 'development' ? spamCheck.reason : undefined
        })
      };
    }

    // Create submission hash for deduplication
    const submissionHash = crypto.createHash('sha256')
      .update(`${data.email}-${data.name}-${data.message.substring(0, 100)}`)
      .digest('hex');

    // Extract known fields
    const { name, email, message, plan, phone, budget, status, ...rest } = data;

    // Determine status
    let submissionStatus = status;
    if (!submissionStatus) {
      if (plan === 'trial') {
        submissionStatus = 'trial_active';
      } else {
        submissionStatus = 'pending';
      }
    }

    // Insert into Supabase
    const { data: insertedData, error } = await supabase
      .from('submissions')
      .insert([
        {
          name,
          email,
          message,
          plan,
          phone,
          budget,
          status: submissionStatus,
          metadata: rest,
        },
      ])
      .select()
      .single();

    // Log the submission details (sanitized)
    console.log('Form submission details:', {
      name: data.name,
      email: data.email,
      projectType: data.projectType,
      messageLength: data.message.length,
      business: data.business || 'Not provided',
      phone: data.phone || 'Not provided',
      website: data.website || 'Not provided',
      idealClient: data.idealClient || 'Not provided',
      hearAbout: data.hearAbout || 'Not provided',
      leadGoal: data.leadGoal || 'Not provided',
      budget: data.budget || 'Not provided',
      status: submissionStatus,
      clientIP,
      submissionHash,
      timestamp: new Date().toISOString(),
      userAgent: event.headers['user-agent'] || 'Unknown'
    });

    // Success response
    console.log('Form submission successful');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Thank you! Your message has been received. We\'ll get back to you soon.',
        success: true,
        submissionId: insertedData ? insertedData.id : undefined
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