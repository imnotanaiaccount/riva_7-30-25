const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting
  MAX_DOWNLOADS_PER_IP: 3,
  RATE_LIMIT_WINDOW: 60 * 60 * 1000, // 1 hour
  
  // Email validation
  MAX_EMAIL_LENGTH: 254,
  
  // Download tracking
  MAX_TRACKED_DOWNLOADS: 100,
  
  // Bot protection
  MIN_TIME_BETWEEN_REQUESTS: 2000, // 2 seconds
};

// Rate limiting storage
const downloadRateLimitStore = new Map();
const emailRateLimitStore = new Map();

// Track downloads (in production, use a database)
const downloadHistory = [];

// Rate limiting function
function checkRateLimit(clientIP, isEmail = false) {
  const store = isEmail ? emailRateLimitStore : downloadRateLimitStore;
  const maxRequests = isEmail ? 5 : SECURITY_CONFIG.MAX_DOWNLOADS_PER_IP;
  const window = isEmail ? 15 * 60 * 1000 : SECURITY_CONFIG.RATE_LIMIT_WINDOW;
  
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

// Validate email format
function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= SECURITY_CONFIG.MAX_EMAIL_LENGTH;
}

// Sanitize input
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

// Track download
function trackDownload(email, clientIP, userAgent) {
  // Check if email already exists in download history
  const existingDownload = downloadHistory.find(d => d.email === email.toLowerCase());
  
  if (existingDownload) {
    // If email exists, return the existing download token
    console.log(`Email ${email} already requested download, returning existing token`);
    return existingDownload;
  }
  
  const download = {
    id: crypto.randomBytes(8).toString('hex'),
    email: email.toLowerCase(),
    clientIP,
    userAgent: userAgent || 'Unknown',
    timestamp: new Date().toISOString(),
    downloadToken: crypto.randomBytes(16).toString('hex')
  };
  
  downloadHistory.unshift(download);
  
  // Keep only the most recent downloads
  if (downloadHistory.length > SECURITY_CONFIG.MAX_TRACKED_DOWNLOADS) {
    downloadHistory.pop();
  }
  
  return download;
}

// Get PDF file path
function getPDFPath() {
  // The PDF is now stored in the public directory for Netlify compatibility
  const pdfPath = path.join(__dirname, '..', '..', 'public', '2025-Lead-Gen-Audit.pdf');

  // Check if file exists
  if (!fs.existsSync(pdfPath)) {
    console.error('Lead magnet PDF not found at:', pdfPath);
    return null;
  }

  return pdfPath;
}

exports.handler = async (event, context) => {
  // Security headers
  const headers = {
    'Access-Control-Allow-Origin': 'https://rivaofficial.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Get client IP
  const clientIP = event.headers['client-ip'] || 
                  event.headers['x-forwarded-for']?.split(',')[0] || 
                  event.headers['x-real-ip'] || 
                  'unknown';

  // Handle GET requests for download
  if (event.httpMethod === 'GET') {
    const downloadToken = event.queryStringParameters?.token;
    
    if (!downloadToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing download token' })
      };
    }
    
    // Find the download record
    const download = downloadHistory.find(d => d.downloadToken === downloadToken);
    
    if (!download) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired download token' })
      };
    }
    
    // Check if download is recent (within 1 hour)
    const downloadTime = new Date(download.timestamp);
    const now = new Date();
    const timeDiff = now - downloadTime;
    
    if (timeDiff > 60 * 60 * 1000) { // 1 hour
      return {
        statusCode: 410,
        headers,
        body: JSON.stringify({ error: 'Download link has expired' })
      };
    }
    
    // Rate limiting for downloads
    if (!checkRateLimit(clientIP, false)) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ error: 'Too many download attempts' })
      };
    }
    
    // Get PDF file
    const pdfPath = getPDFPath();
    
    if (!pdfPath) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Lead magnet not available' })
      };
    }
    
    try {
      const pdfBuffer = fs.readFileSync(pdfPath);
      
      console.log(`Lead magnet downloaded by ${download.email} from IP ${clientIP}`);
      
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="2025-Lead-Gen-Audit.pdf"',
          'Content-Length': pdfBuffer.length.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: pdfBuffer.toString('base64'),
        isBase64Encoded: true
      };
    } catch (error) {
      console.error('Error reading PDF:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Error serving lead magnet' })
      };
    }
  }

  // Handle POST requests for email collection
  if (event.httpMethod === 'POST') {
    // Rate limiting for email submissions
    if (!checkRateLimit(clientIP, true)) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ error: 'Too many email submissions' })
      };
    }

    try {
      // Validate Content-Type
      const contentType = event.headers['content-type'] || '';
      if (!contentType.includes('application/json')) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid content type' })
        };
      }

      // Parse JSON
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

      // Extract and validate email
      const email = sanitizeInput(parsedBody.email, SECURITY_CONFIG.MAX_EMAIL_LENGTH);
      
      if (!email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email is required' })
        };
      }

      if (!validateEmail(email)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid email format' })
        };
      }

      // Track the download request
      const download = trackDownload(email, clientIP, event.headers['user-agent']);

      console.log(`Lead magnet requested by ${email} from IP ${clientIP}`);

      // Check if this is a new email or existing email
      const isNewEmail = !downloadHistory.find(d => d.email === email.toLowerCase() && d.id !== download.id);

      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: isNewEmail 
            ? 'Thank you! Your lead magnet is ready for download.'
            : 'Welcome back! Here\'s your download link again.',
          downloadUrl: `/.netlify/functions/lead-magnet?token=${download.downloadToken}`,
          downloadToken: download.downloadToken,
          isNewEmail: isNewEmail
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
  }

  // Method not allowed
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
}; 