// pages/auth/callback.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log('Full URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search params:', window.location.search);
        
        // First try to extract from hash (PKCE flow)
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        
        // Then try to extract from query params (implicit flow)
        const searchParams = new URLSearchParams(window.location.search);
        
        // Combine both sources of parameters
        const params = new URLSearchParams();
        
        // Add hash params first
        for (const [key, value] of hashParams.entries()) {
          params.set(key, value);
        }
        
        // Then add search params (will override any duplicates from hash)
        for (const [key, value] of searchParams.entries()) {
          params.set(key, value);
        }
        
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        console.log('All auth params:', {
          accessToken,
          refreshToken,
          type,
          error,
          errorDescription,
          allParams: Object.fromEntries(params.entries())
        });

        if (error) {
          throw new Error(errorDescription || `Authentication error: ${error}`);
        }

        if (!accessToken) {
          throw new Error('No access token found in the URL');
        }

        // Store the tokens in localStorage for the update-password page
        localStorage.setItem('sb-auth-token', accessToken);
        if (refreshToken) {
          localStorage.setItem('sb-refresh-token', refreshToken);
        }
        
        // Set the session with the tokens
        const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
        
        if (userError) {
          console.error('Error getting user:', userError);
          throw new Error('Failed to verify user session');
        }

        if (!user) {
          throw new Error('No user found in session');
        }

        console.log('User authenticated:', user.email);
        
        // Redirect to update password page with token as a query parameter
        router.push({
          pathname: '/auth/update-password',
          query: { 
            access_token: accessToken,
            email: user.email 
          }
        });
        
      } catch (error) {
        console.error('Auth callback error:', error);
        // Clear any existing tokens on error
        localStorage.removeItem('sb-auth-token');
        localStorage.removeItem('sb-refresh-token');
        
        // Redirect to forgot-password with error
        router.push({
          pathname: '/auth/forgot-password',
          query: { 
            error: 'auth_error',
            error_description: error.message
          }
        });
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-white text-center">
        <p>Processing your request...</p>
      </div>
    </div>
  );
}
