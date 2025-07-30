import { v4 as uuidv4 } from 'uuid';

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5,
    IP_WHITELIST: []
  },
  
  // Honeypot field names
  HONEYPOT_FIELDS: ['website', 'url', 'name2', 'email2', 'phone2'],
  
  // Spam keywords
  SPAM_KEYWORDS: [
    'http://', 'https://', 'www.', '.com', '.net', '.org',
    'viagra', 'cialis', 'casino', 'porn', 'xxx', 'sex',
    'loan', 'debt', 'money', 'profit', 'earn', 'income',
    'click here', 'buy now', 'order now', 'limited time'
  ],
  
  // Email validation
  EMAIL_DOMAINS_BLACKLIST: [
    'mailinator.com', 'tempmail.com', 'guerrillamail.com',
    'sharklasers.com', 'maildrop.cc', '10minutemail.com',
    'yopmail.com', 'temp-mail.org', 'dispostable.com'
  ],
  
  // Admin notification settings - Using environment variables
  ADMIN_EMAIL: process.env.ADMIN_EMAILS || 'joshhawleyofficial@gmail.com',
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || 'noreply@riva-agency.com',
  
  NOTIFY_ON: {
    SUBMISSION: true,
    SUSPICIOUS: true,
    ERROR: true
  }
};

// In-memory rate limiting (for serverless functions)
const rateLimitStore = new Map();

/**
 * Check if a request is rate limited
 * @param {string} ip - Client IP address
 * @returns {Object} - { isRateLimited: boolean, retryAfter: number }
 */
export function checkRateLimit(ip) {
  if (SECURITY_CONFIG.RATE_LIMIT.IP_WHITELIST.includes(ip)) {
    return { isRateLimited: false, retryAfter: 0 };
  }

  const now = Date.now();
  const windowMs = SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS;
  const requestTimestamps = rateLimitStore.get(ip) || [];
  
  // Remove timestamps older than the window
  const recentTimestamps = requestTimestamps.filter(timestamp => {
    return now - timestamp < windowMs;
  });

  // Check if we've exceeded the rate limit
  const isRateLimited = recentTimestamps.length >= SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS;
  
  // Update the store
  recentTimestamps.push(now);
  rateLimitStore.set(ip, recentTimestamps);

  // Calculate retry after time
  const retryAfter = isRateLimited 
    ? Math.ceil((recentTimestamps[0] + windowMs - now) / 1000)
    : 0;

  return { isRateLimited, retryAfter };
}

/**
 * Detect spam in form data
 * @param {Object} formData - Form submission data
 * @returns {Object} - { isSpam: boolean, reason: string, score: number }
 */
export function detectSpam(formData) {
  let score = 0;
  const reasons = [];
  const fields = Object.entries(formData);
  
  // 1. Check honeypot fields
  const honeypotFields = fields.filter(([field]) => 
    SECURITY_CONFIG.HONEYPOT_FIELDS.includes(field.toLowerCase())
  );
  
  if (honeypotFields.some(([_, value]) => value)) {
    score += 100; // Immediate fail
    reasons.push('Honeypot field filled');
  }
  
  // 2. Check for spam keywords in all fields
  fields.forEach(([field, value]) => {
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      SECURITY_CONFIG.SPAM_KEYWORDS.forEach(keyword => {
        if (lowerValue.includes(keyword)) {
          score += 5;
          reasons.push(`Spam keyword "${keyword}" in ${field}`);
        }
      });
      
      // Check for suspicious patterns
      if (/(?:https?:\/\/|www\.)/.test(lowerValue) && !field.toLowerCase().includes('website')) {
        score += 20;
        reasons.push(`Suspicious URL in ${field}`);
      }
    }
  });
  
  // 3. Validate email
  if (formData.email) {
    const email = formData.email.toLowerCase();
    
    // Check for disposable/temp email domains
    const domain = email.split('@')[1];
    if (SECURITY_CONFIG.EMAIL_DOMAINS_BLACKLIST.some(d => domain.endsWith(d))) {
      score += 30;
      reasons.push('Disposable/temp email detected');
    }
    
    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      score += 50;
      reasons.push('Invalid email format');
    }
  }
  
  const isSpam = score >= 20; // Threshold for considering it spam
  return { isSpam, reasons, score };
}

/**
 * Log form submission for admin dashboard
 * @param {Object} submission - Form submission data
 * @param {Object} metadata - Additional metadata (ip, userAgent, etc.)
 * @param {boolean} isSpam - Whether the submission was marked as spam
 */
export async function logSubmission(submission, metadata, isSpam = false) {
  const logEntry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    submission,
    metadata: {
      ...metadata,
      userAgent: metadata.userAgent || '',
      referrer: metadata.referrer || '',
      ip: metadata.ip || 'unknown',
    },
    isSpam,
    flagged: isSpam ? 'auto' : 'no'
  };
  
  try {
    // In a real implementation, this would save to a database
    // For now, we'll log to console and send email if needed
    console.log('Form submission logged:', logEntry);
    
    // Send email notification for spam or important submissions
    if (isSpam || SECURITY_CONFIG.NOTIFY_ON.SUBMISSION) {
      await sendAdminNotification(logEntry);
    }
    
    return logEntry;
  } catch (error) {
    console.error('Error logging submission:', error);
    throw error;
  }
}

/**
 * Send admin notification email using Brevo
 * @private
 */
async function sendAdminNotification(logEntry) {
  const emailContent = `
    New Form Submission ${logEntry.isSpam ? '(POTENTIAL SPAM)' : ''}
    ----------------------------------------
    ID: ${logEntry.id}
    Time: ${new Date(logEntry.timestamp).toLocaleString()}
    IP: ${logEntry.metadata.ip || 'unknown'}
    User Agent: ${logEntry.metadata.userAgent || 'unknown'}
    Referrer: ${logEntry.metadata.referrer || 'direct'}
    
    Form Data:
    ${JSON.stringify(logEntry.submission, null, 2)}
    
    ${logEntry.isSpam ? `\nSpam Detection Score: ${logEntry.score}\nReasons: ${logEntry.reasons?.join(', ') || 'None'}` : ''}
  `;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': SECURITY_CONFIG.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Riva Agency Form',
          email: SECURITY_CONFIG.BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: SECURITY_CONFIG.ADMIN_EMAIL,
            name: 'Admin',
          },
        ],
        subject: `[Riva Agency] New ${logEntry.submission.formType || 'Form'} Submission ${logEntry.isSpam ? '(SPAM)' : ''}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New ${logEntry.submission.formType || 'Form'} Submission ${logEntry.isSpam ? '<span style="color: #dc2626;">(POTENTIAL SPAM)</span>' : ''}</h2>
            <div style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
              <p><strong>Time:</strong> ${new Date(logEntry.timestamp).toLocaleString()}</p>
              <p><strong>IP:</strong> ${logEntry.metadata.ip || 'unknown'}</p>
              <p><strong>User Agent:</strong> ${logEntry.metadata.userAgent || 'unknown'}</p>
              <p><strong>Referrer:</strong> ${logEntry.metadata.referrer || 'direct'}</p>
              ${logEntry.isSpam ? `<p><strong>Spam Score:</strong> ${logEntry.score}</p>` : ''}
              ${logEntry.isSpam && logEntry.reasons?.length ? `<p><strong>Spam Reasons:</strong> ${logEntry.reasons.join(', ')}</p>` : ''}
            </div>
            
            <h3 style="color: #2563eb; margin-top: 1.5rem;">Submission Details:</h3>
            <div style="background: #f9fafb; padding: 1rem; border-radius: 0.5rem;">
              <pre style="white-space: pre-wrap; font-family: monospace; margin: 0;">
${JSON.stringify(logEntry.submission, null, 2)}
              </pre>
            </div>
            
            <div style="margin-top: 2rem; font-size: 0.875rem; color: #6b7280; text-align: center;">
              <p>This is an automated message from Riva Agency's form submission system.</p>
              <p>IP: ${logEntry.metadata.ip || 'unknown'} | ${new Date().toISOString()}</p>
            </div>
          </div>
        `,
        textContent: emailContent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Brevo API error: ${JSON.stringify(error)}`);
    }

    console.log('Admin notification email sent to', SECURITY_CONFIG.ADMIN_EMAIL);
    
  } catch (error) {
    console.error('Failed to send admin notification via Brevo:', error);
    
    // Fallback to console logging if email fails
    console.error('Failed to send email. Here is the notification that would have been sent:');
    console.log('To:', SECURITY_CONFIG.ADMIN_EMAIL);
    console.log('Subject:', `[Riva Agency] New ${logEntry.submission.formType || 'Form'} Submission ${logEntry.isSpam ? '(SPAM)' : ''}`);
    
    // Only re-throw if it's not a Brevo API error
    if (!error.message.includes('Brevo API error')) {
      throw error;
    }
  }
}

/**
 * Middleware for Express/Next.js API routes
 */
export function formSecurityMiddleware(handler) {
  return async (req, res) => {
    try {
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                req.connection?.remoteAddress;
      
      // Check rate limit
      const { isRateLimited, retryAfter } = checkRateLimit(ip);
      if (isRateLimited) {
        await logSubmission(
          { error: 'Rate limit exceeded' },
          { ip, userAgent: req.headers['user-agent'] },
          true
        );
        
        return res.status(429).json({
          success: false,
          error: 'Too many requests. Please try again later.',
          retryAfter
        });
      }
      
      // Process form data
      const formData = req.body || {};
      
      // Detect spam
      const { isSpam, reasons, score } = detectSpam(formData);
      
      // Log the submission
      await logSubmission(
        formData,
        {
          ip,
          userAgent: req.headers['user-agent'],
          referrer: req.headers['referer'],
          isSpam,
          score,
          reasons
        },
        isSpam
      );
      
      if (isSpam) {
        return res.status(400).json({
          success: false,
          error: 'Your submission was flagged as potential spam.',
          details: reasons
        });
      }
      
      // Call the actual handler if not spam
      return handler(req, res);
      
    } catch (error) {
      console.error('Form security middleware error:', error);
      
      if (SECURITY_CONFIG.NOTIFY_ON.ERROR) {
        await sendAdminNotification(
          { error: error.message },
          { 
            ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown',
            userAgent: req.headers['user-agent'],
            stack: error.stack
          },
          true
        );
      }
      
      return res.status(500).json({
        success: false,
        error: 'An error occurred while processing your request.'
      });
    }
  };
}

export default {
  checkRateLimit,
  detectSpam,
  logSubmission,
  formSecurityMiddleware,
  config: SECURITY_CONFIG
};
