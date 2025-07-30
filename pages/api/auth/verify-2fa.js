// pages/auth/verify-2fa.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';
import { verifyTwoFactorToken, logTwoFactorAttempt, verifyBackupCode } from '../../utils/twoFactorAuth';

export default function VerifyTwoFactor() {
  const router = useRouter();
  const { email, rememberMe } = router.query;
  const [code, setCode] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get user ID from email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      const userId = userData.id;
      const ip = ''; // Get IP from request headers in production
      const userAgent = navigator.userAgent;

      if (isBackupCode) {
        const isValidBackupCode = await verifyBackupCode(userId, code);
        if (!isValidBackupCode) {
          throw new Error('Invalid backup code');
        }
      } else {
        // Get user's 2FA secret
        const { data: twoFactorData, error: twoFactorError } = await supabase
          .from('user_two_factor_auth')
          .select('secret')
          .eq('user_id', userId)
          .single();

        if (twoFactorError || !twoFactorData) {
          throw new Error('2FA not set up for this account');
        }

        const isValidToken = verifyTwoFactorToken(code, twoFactorData.secret);
        if (!isValidToken) {
          throw new Error('Invalid verification code');
        }
      }

      // Log the successful attempt
      await logTwoFactorAttempt(userId, ip, userAgent);

      // Sign in the user
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: '', // Password is already verified
      });

      if (signInError) throw signInError;

      // Set session persistence
      await supabase.auth.setPersistence(rememberMe === 'true' ? 'local' : 'session');

      // Redirect to dashboard
      window.location.href = '/dashboard';

    } catch (error) {
      console.error('2FA verification error:', error);
      setError(error.message || 'Failed to verify 2FA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#181c30] to-[#1a223f] px-4">
      <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl max-w-md w-full mx-4">
        <h1 className="text-3xl font-extrabold text-white mb-8 text-center">
          Two-Factor Authentication
        </h1>

        <p className="text-gray-300 mb-6 text-center">
          {isBackupCode
            ? 'Enter one of your backup codes'
            : 'Enter the 6-digit code from your authenticator app'}
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-gray-300 mb-2 text-sm font-medium">
              {isBackupCode ? 'Backup Code' : 'Verification Code'}
            </label>
            <input
              id="code"
              type="text"
              className="w-full px-4 py-3 rounded-lg bg-gray-900/50 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-xl tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, isBackupCode ? 9 : 6))}
              placeholder={isBackupCode ? 'XXXX-XXXX' : '000000'}
              required
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setIsBackupCode(!isBackupCode)}
              className="text-sm text-blue-400 hover:underline"
            >
              {isBackupCode
                ? 'Use authenticator app instead'
                : 'Use a backup code instead'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}