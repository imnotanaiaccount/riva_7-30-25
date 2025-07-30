import { supabase } from '../../../utils/supabase';
import rateLimit from '../../../utils/rate-limit';
import { isTwoFactorEnabled } from '../../../utils/twoFactorAuth';

// Rate limiting: 5 attempts per 15 minutes per IP
const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, rememberMe = true } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';

  try {
    // Apply rate limiting
    await limiter.check(res, 5, ip); // 5 requests per 15 minutes

    // Check if account is locked
    const { data: lockData } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('ip', ip)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lockData?.is_locked) {
      const lockTime = new Date(lockData.locked_until).getTime();
      const now = new Date().getTime();
      if (lockTime > now) {
        return res.status(429).json({ 
          error: 'Account temporarily locked. Please try again later.' 
        });
      } else {
        // Unlock the account if lock has expired
        await supabase
          .from('login_attempts')
          .update({ is_locked: false, attempts: 0 })
          .eq('id', lockData.id);
      }
    }

    // First, verify the password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Record failed attempt
      await handleFailedLogin(ip, email, res);
      return;
    }

    // Check if 2FA is enabled for this user
    const twoFactorEnabled = await isTwoFactorEnabled(authData.user.id);

    if (twoFactorEnabled) {
      // Return early with 2FA required flag
      return res.status(200).json({
        requires2FA: true,
        userId: authData.user.id,
        email: authData.user.email,
        rememberMe,
        message: '2FA verification required',
      });
    }

    // If we get here, 2FA is not required - complete the login
    await handleSuccessfulLogin(ip, email, rememberMe, res);

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'An error occurred during login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

async function handleFailedLogin(ip, email, res) {
  const { data: attemptData } = await supabase
    .from('login_attempts')
    .select('*')
    .eq('ip', ip)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const failedAttempts = (attemptData?.attempts || 0) + 1;
  const maxAttempts = 5;
  const lockDuration = 15 * 60 * 1000; // 15 minutes

  if (failedAttempts >= maxAttempts) {
    // Lock the account
    await supabase.from('login_attempts').upsert({
      ip,
      email,
      attempts: failedAttempts,
      is_locked: true,
      locked_until: new Date(Date.now() + lockDuration).toISOString(),
      last_attempt: new Date().toISOString(),
    });

    return res.status(429).json({ 
      error: `Too many failed attempts. Account locked for 15 minutes.` 
    });
  } else {
    // Update attempt count
    await supabase.from('login_attempts').upsert({
      ip,
      email,
      attempts: failedAttempts,
      last_attempt: new Date().toISOString(),
      is_locked: false,
    });

    return res.status(401).json({ 
      error: 'Invalid login credentials',
      remainingAttempts: maxAttempts - failedAttempts
    });
  }
}

async function handleSuccessfulLogin(ip, email, rememberMe, res) {
  // Reset attempt count on successful login
  await supabase
    .from('login_attempts')
    .delete()
    .eq('ip', ip);

  // Set session persistence
  await supabase.auth.setPersistence(rememberMe ? 'local' : 'session');

  // Get the user session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.error('Session error:', sessionError);
    return res.status(500).json({ error: 'Failed to create session' });
  }

  // Update last login time
  await supabase
    .from('profiles')
    .update({ last_login: new Date().toISOString() })
    .eq('id', session.user.id);

  // Return success with session
  return res.status(200).json({
    user: {
      id: session.user.id,
      email: session.user.email,
      // Add any other user fields you want to expose
    },
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    token_type: session.token_type,
  });
}
