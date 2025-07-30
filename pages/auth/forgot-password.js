// pages/auth/forgot-password.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';
import Head from 'next/head';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const router = useRouter();
  const { error, error_description } = router.query;

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({});
  
    try {
      // Generate a random token to include in the redirect URL
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Use the update-password page with the token as a query parameter
      const redirectTo = `${window.location.origin}/auth/update-password?token=${token}`;
      
      console.log('Sending password reset email to:', email);
      console.log('Redirect URL:', redirectTo);
      
      // Use the correct method for sending password reset email in v2
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo
      });
    
      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }

      setMessage({
        type: 'success',
        content: `Password reset link sent to ${email}. Please check your email (including spam folder).`,
      });
      
      // Clear the email field
      setEmail('');
    } catch (error) {
      console.error('Error in handleReset:', error);
      setMessage({ 
        type: 'error', 
        content: error.message || 'Failed to send reset email. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Show any errors from the URL query parameters
  useEffect(() => {
    if (error || error_description) {
      setMessage({
        type: 'error',
        content: error_description || 'An error occurred. Please try again.'
      });
      // Clear the error from the URL
      router.replace('/auth/forgot-password', undefined, { shallow: true });
    }
  }, [error, error_description, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      {/* Space Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black opacity-80"></div>
        <div className="absolute inset-0 bg-space-pattern opacity-20"></div>
      </div>
      
      <Head>
        <title>Forgot Password | Riva</title>
      </Head>

      <div className="relative z-10 max-w-md w-full space-y-8 p-8 bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email and we'll send you a link to reset your password
          </p>
        </div>
        
        {message.content && (
          <div
            className={`p-4 rounded-md ${
              message.type === 'error' ? 'bg-red-900 bg-opacity-50' : 'bg-green-900 bg-opacity-50'
            }`}
          >
            <p className={`text-sm ${message.type === 'error' ? 'text-red-300' : 'text-green-300'}`}>
              {message.content}
            </p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleReset}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="font-medium text-purple-400 hover:text-purple-300"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}