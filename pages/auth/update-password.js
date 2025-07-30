import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';
import Head from 'next/head';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);
  const [email, setEmail] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to validate JWT token format
  const isValidToken = (token) => {
    if (!token) return false;
    try {
      // Try to parse the token to ensure it's a valid JWT
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Try to decode the payload to check if it's a valid JWT
      const payload = JSON.parse(atob(parts[1]));
      return payload && typeof payload === 'object' && 'exp' in payload;
    } catch (e) {
      console.error('Token validation error:', e);
      return false;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing update password page...');
        console.log('Full URL:', window.location.href);
        
        // Get the full URL
        const url = new URL(window.location.href);
        
        // Check for token in different possible locations
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        // Try to get the token from different possible parameter names
        const token = 
          hashParams.get('access_token') ||  // Standard Supabase format
          searchParams.get('access_token') ||
          searchParams.get('token') ||       // Our custom token
          searchParams.get('code');          // Some providers use 'code'
        
        console.log('Token from hash:', hashParams.get('access_token') ? 'found' : 'not found');
        console.log('Token from search (access_token):', searchParams.get('access_token') ? 'found' : 'not found');
        console.log('Token from search (token):', searchParams.get('token') ? 'found' : 'not found');
        console.log('Token from search (code):', searchParams.get('code') ? 'found' : 'not found');
        console.log('Using token:', !!token);
        
        if (!token) {
          throw new Error('No valid token found. Please use the link from your email.');
        }
        
        // Store the token for later use
        setAccessToken(token);
        
        // Clear the URL to remove sensitive data
        window.history.replaceState({}, document.title, window.location.pathname);
        
      } catch (error) {
        console.error('Initialization error:', error);
        setMessage({
          type: 'error',
          content: error.message || 'Unable to process password reset. Please request a new link.'
        });
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        content: 'Passwords do not match.'
      });
      return;
    }
    
    if (password.length < 6) {
      setMessage({
        type: 'error',
        content: 'Password must be at least 6 characters long.'
      });
      return;
    }
    
    setLoading(true);
    setMessage({});
    
    try {
      console.log('Attempting to update password with token...');
      
      // Use the correct Supabase v2 method to update the password
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error('Password update error:', error);
        throw error;
      }
      
      console.log('Password updated successfully');
      setMessage({
        type: 'success',
        content: 'Your password has been updated successfully. Redirecting to login...'
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setMessage({
        type: 'error',
        content: error.message || 'Failed to update password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      {/* Space Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black opacity-80"></div>
        <div className="absolute inset-0 bg-space-pattern opacity-20"></div>
      </div>
      
      <Head>
        <title>Update Password | Riva</title>
      </Head>

      <div className="relative z-10 max-w-md w-full space-y-8 p-8 bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Set a new password
          </h2>
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
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !accessToken}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                (loading || !accessToken) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <button
            onClick={() => router.push('/auth/forgot-password')}
            className="font-medium text-purple-400 hover:text-purple-300"
          >
            Request a new reset link
          </button>
        </div>
      </div>
    </div>
  );
}