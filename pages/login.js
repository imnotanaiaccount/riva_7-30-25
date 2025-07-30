import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.push('/dashboard');
      }
    };
    
    checkSession();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Clear any existing sessions
      await supabase.auth.signOut();
      
      // Set persistence based on remember me
      await supabase.auth.setPersistence(rememberMe ? 'local' : 'session');
      
      // Sign in with email and password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (signInError) throw signInError;
      
      // Force a full page reload to ensure all auth state is properly set
      window.location.href = '/dashboard';
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#181c30] to-[#1a223f] px-4">
      <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl max-w-md w-full">
        <h1 className="text-3xl font-extrabold text-white mb-8 text-center">Sign In</h1>
        <label className="block text-gray-300 mb-2">Email</label>
        <input
          type="email"
          className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <label className="block text-gray-300 mb-2">Password</label>
        <input
          type="password"
          className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="rememberMe" className="text-gray-300 text-sm">Remember Me</label>
          </div>
          <a 
            href="/auth/forgot-password" 
            className="text-blue-400 text-sm hover:underline"
            onClick={(e) => {
              e.preventDefault();
              router.push('/auth/forgot-password');
            }}
          >
            Forgot Password?
          </a>
        </div>
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-full transition-all duration-200 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing In...
            </>
          ) : 'Sign In'}
        </button>
        <p className="text-center text-gray-400 text-sm mt-4">
          Don't have an account?{' '}
          <a 
            href="/signup" 
            className="text-blue-400 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              router.push('/signup');
            }}
          >
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}