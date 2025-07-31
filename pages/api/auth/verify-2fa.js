// pages/api/auth/verify-2fa.js
import { supabase } from '../../../utils/supabase';
import rateLimit from '../../../utils/rate-limit';
import { verifyTwoFactorToken, verifyBackupCode, logTwoFactorAttempt } from '../../../utils/twoFactorAuth';

// Rate limiting: 10 attempts per 15 minutes per IP
const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, code, isBackupCode = false, rememberMe = true } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';

  try {
    // Apply rate limiting
    await limiter.check(res, 10, ip); // 10 requests per 15 minutes

    if (!userId || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    let isValid = false;

    if (isBackupCode) {
      // Verify backup code
      isValid = await verifyBackupCode(userId, code);
    } else {
      // Get user's 2FA secret
      const { data: twoFactorData, error: twoFactorError } = await supabase
        .from('user_two_factor_auth')
        .select('secret')
        .eq('user_id', userId)
        .single();

      if (twoFactorError || !twoFactorData) {
        return res.status(400).json({ error: '2FA not set up for this account' });
      }

      // Verify 2FA token
      isValid = verifyTwoFactorToken(code, twoFactorData.secret);
    }

    if (!isValid) {
      // Log failed attempt
      await logTwoFactorAttempt(userId, ip, userAgent, false);
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // Log successful attempt
    await logTwoFactorAttempt(userId, ip, userAgent, true);

    // Sign in the user
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: 'dummy-password', // This should be handled by a custom token in production
    });

    if (signInError) {
      console.error('Sign in after 2FA failed:', signInError);
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Set session persistence
    await supabase.auth.setPersistence(rememberMe ? 'local' : 'session');

    // Get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session error after 2FA:', sessionError);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    // Update last login time
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);

    // Return success with session
    return res.status(200).json({
      user: {
        id: session.user.id,
        email: session.user.email,
      },
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
      token_type: session.token_type,
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    return res.status(500).json({ 
      error: 'An error occurred during 2FA verification',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}