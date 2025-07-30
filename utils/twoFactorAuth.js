// utils/twoFactorAuth.js
import { authenticator } from 'otplib';
import { createHash, randomBytes } from 'crypto';
import QRCode from 'qrcode';
import { supabase } from './supabase';

// Set window size for OTP generation
authenticator.options = { window: 1 };

/**
 * Generate a new 2FA secret for a user
 */
export const generateTwoFactorSecret = async (email) => {
  const secret = authenticator.generateSecret();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'YourApp';
  
  const otpauth = authenticator.keyuri(email, appName, secret);
  const qrCode = await QRCode.toDataURL(otpauth);
  
  return { secret, qrCode, otpauth };
};

/**
 * Verify a 2FA token
 */
export const verifyTwoFactorToken = (token, secret) => {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    return false;
  }
};

/**
 * Generate backup codes for 2FA
 */
export const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(randomBytes(4).toString('hex').toUpperCase().match(/.{1,4}/g).join('-'));
  }
  return codes;
};

/**
 * Verify a backup code
 */
export const verifyBackupCode = async (userId, code) => {
  try {
    const { data, error } = await supabase
      .from('user_two_factor_auth')
      .select('backup_codes')
      .eq('user_id', userId)
      .single();

    if (error || !data) return false;

    const { backup_codes } = data;
    const codeIndex = backup_codes.indexOf(code);

    if (codeIndex === -1) return false;

    // Remove the used backup code
    const updatedCodes = [...backup_codes];
    updatedCodes.splice(codeIndex, 1);

    await supabase
      .from('user_two_factor_auth')
      .update({ backup_codes: updatedCodes })
      .eq('user_id', userId);

    return true;
  } catch (error) {
    console.error('Error verifying backup code:', error);
    return false;
  }
};

/**
 * Log a 2FA attempt
 */
export const logTwoFactorAttempt = async (userId, ip, userAgent) => {
  try {
    await supabase
      .from('two_factor_attempts')
      .insert([
        { 
          user_id: userId,
          ip_address: ip,
          user_agent: userAgent
        }
      ]);
  } catch (error) {
    console.error('Error logging 2FA attempt:', error);
  }
};

/**
 * Check if user has 2FA enabled
 */
export const isTwoFactorEnabled = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_two_factor_auth')
      .select('is_enabled')
      .eq('user_id', userId)
      .single();

    return !error && data?.is_enabled;
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return false;
  }
};