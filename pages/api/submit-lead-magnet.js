import { supabase } from '../../utils/supabase';
import { sendLeadMagnet } from '../../utils/emailService';
import rateLimit from '../../utils/rate-limit';

// Rate limiting: 5 submissions per hour per IP
const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
});

// Lead magnet configuration
const LEAD_MAGNET = {
  name: '2025 Lead Gen Audit',
  url: 'https://your-domain.com/2025-Lead-Gen-Audit.pdf', // Update with your actual PDF URL
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      code: 'method_not_allowed',
    });
  }

  // Get client IP for rate limiting
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(/, /)[0] : req.socket.remoteAddress;

  try {
    // Apply rate limiting
    await limiter.check(res, 5, ip); // 5 submissions per hour

    const { email, name = '', honeypot = '' } = req.body;

    // Honeypot check
    if (honeypot) {
      console.log('Bot detected via honeypot');
      return res.status(200).json({ success: true }); // Pretend success
    }

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        code: 'missing_email',
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'invalid_email_format',
      });
    }

    // Check if email already exists in either table
    const [leadsCheck, downloadsCheck] = await Promise.all([
      supabase
        .from('leads')
        .select('email')
        .eq('email', email)
        .single(),
      supabase
        .from('lead_magnets_downloads')
        .select('email, created_at')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1),
    ]);

    const hasExistingLead = !leadsCheck.error && leadsCheck.data;
    const hasExistingDownload = !downloadsCheck.error && downloadsCheck.data?.length > 0;

    // If this is a new download request
    if (!hasExistingDownload) {
      // Send the lead magnet email
      await sendLeadMagnet(email, LEAD_MAGNET);

      // Log the download in the database
      const { error: insertError } = await supabase
        .from('lead_magnets_downloads')
        .insert([
          {
            email,
            name: name || null,
            lead_magnet_name: LEAD_MAGNET.name,
            lead_magnet_url: LEAD_MAGNET.url,
            ip_address: ip,
            user_agent: req.headers['user-agent'],
          },
        ]);

      if (insertError) {
        console.error('Error logging download:', insertError);
      }
    }

    // Update or create lead if it doesn't exist
    if (!hasExistingLead) {
      const { error: leadError } = await supabase.from('leads').upsert(
        {
          email,
          name: name || null,
          source: 'lead_magnet',
          metadata: {
            lead_magnet: LEAD_MAGNET.name,
            first_download: new Date().toISOString(),
          },
        },
        { onConflict: 'email' }
      );

      if (leadError) {
        console.error('Error updating lead:', leadError);
      }
    }

    // Log the submission for security
    await supabase.from('security_logs').insert([
      {
        action: 'lead_magnet_download',
        ip_address: ip,
        user_agent: req.headers['user-agent'],
        metadata: {
          email,
          name,
          lead_magnet: LEAD_MAGNET.name,
          is_new_download: !hasExistingDownload,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Lead magnet sent successfully',
      isNewDownload: !hasExistingDownload,
    });
  } catch (error) {
    console.error('Error in submit-lead-magnet:', error);

    // Handle rate limit errors
    if (error.message === 'Rate limit exceeded') {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.',
        code: 'rate_limit_exceeded',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'An error occurred while processing your request',
      code: 'server_error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
