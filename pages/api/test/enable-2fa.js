import { supabase } from '../../../utils/supabase';
import { generateTwoFactorSecret, generateBackupCodes } from '../../../utils/twoFactorAuth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Get user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate 2FA secret and backup codes
    const { secret, qrCode } = await generateTwoFactorSecret(email);
    const backupCodes = generateBackupCodes();
    const backupCodesHashed = backupCodes.map(code => 
      createHash('sha256').update(code).digest('hex')
    );

    // Save 2FA data to database
    const { data, error } = await supabase
      .from('user_two_factor_auth')
      .upsert({
        user_id: userData.id,
        secret,
        backup_codes: backupCodesHashed,
        is_enabled: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error enabling 2FA:', error);
      return res.status(500).json({ error: 'Failed to enable 2FA' });
    }

    // Return the backup codes (in a real app, show these to the user only once)
    return res.status(200).json({
      success: true,
      qrCode,
      backupCodes, // In production, show these to the user in a secure way
      secret // In production, don't return the secret to the client
    });

  } catch (error) {
    console.error('Error in enable-2fa:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
