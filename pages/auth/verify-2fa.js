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
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (!email) {
      router.push('/login');
    } else {
      // Get user ID from email
      const fetchUserId = async () => {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();

        if (userData) {
          setUserId(userData.id);
        } else {
          setError('User not found');
        }
      };
      fetchUserId();
    }
  }, [email, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!userId) {
        throw new Error('User not found');
      }

      // Call the API endpoint for 2FA verification
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          code,
          isBackupCode,
          rememberMe: rememberMe === 'true',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify 2FA code');
      }

      // Store the session
      const { error: authError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      if (authError) throw authError;

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
              disabled={loading || !userId}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading || !userId ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => {
                setIsBackupCode(!isBackupCode);
                setCode('');
                setError('');
              }}
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
