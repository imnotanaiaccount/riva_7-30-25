import { supabase } from '../../utils/supabase';
import rateLimit from '../../utils/rate-limit';

// Rate limiting: 10 requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max users per second
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      code: 'method_not_allowed'
    });
  }

  // Get client IP address
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(/, /)[0] : req.socket.remoteAddress;

  try {
    // Apply rate limiting
    await limiter.check(res, 10, ip); // 10 requests per minute

    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: 'Email is required',
        code: 'missing_email'
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format',
        code: 'invalid_email_format'
      });
    }

    // Check in the leads table
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('email, created_at')
      .eq('email', email)
      .single();

    if (leadError && leadError.code !== 'PGRST116') {
      console.error('Error checking leads table:', leadError);
      throw leadError;
    }

    // Check in the lead_magnets_downloads table
    const { data: downloadData, error: downloadError } = await supabase
      .from('lead_magnets_downloads')
      .select('email, created_at, lead_magnet_name')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (downloadError && downloadError.code !== 'PGRST116') {
      console.error('Error checking lead_magnets_downloads:', downloadError);
      throw downloadError;
    }

    // If email exists in either table
    const exists = !!(leadData || (downloadData && downloadData.length > 0));
    
    // Log the check (for security monitoring)
    await supabase
      .from('security_logs')
      .insert([{
        action: 'email_check',
        ip_address: ip,
        user_agent: req.headers['user-agent'],
        metadata: { email, exists }
      }]);

    return res.status(200).json({ 
      success: true,
      exists,
      lastDownload: downloadData?.[0]?.created_at || null,
      leadMagnetName: downloadData?.[0]?.lead_magnet_name || null
    });

  } catch (error) {
    console.error('Error in check-email:', error);
    
    // Handle rate limit errors
    if (error.message === 'Rate limit exceeded') {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.',
        code: 'rate_limit_exceeded'
      });
    }
    
    return res.status(500).json({ 
      success: false,
      error: 'An error occurred while processing your request',
      code: 'server_error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
