import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';

// Create a service role client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req, res) {
  // Only allow this in development or with a secret key
  if (process.env.NODE_ENV === 'production' && req.headers['x-secret-key'] !== process.env.API_SECRET_KEY) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Generate a random password
    const password = `Test@${randomBytes(4).toString('hex')}!`;
    
    // Create the user in Supabase Auth using the admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: { name: 'Test User' }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // Create user profile using the admin client to bypass RLS
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: email,
        full_name: 'Test User',
        role: 'user',
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      // Clean up the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    // Return the test user credentials
    // In production, you might want to send this securely instead of returning it
    return res.status(200).json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: userId,
        email: email,
        password: password, // Only for testing purposes
      },
      note: 'Please change this password after testing and never expose it in production.'
    });

  } catch (error) {
    console.error('Error creating test user:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
