import { createClient } from '@supabase/supabase-js';

// Hardcoded values for testing
const supabaseUrl = 'https://rjiopacjvarhfwjifktm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaW9wYWNqdmFyaGZ3amlma3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjI3NTcsImV4cCI6MjA2ODU5ODc1N30.r8i-qOhHXIqbMYotR6ldU3gUcjoju3SlCoi1Cia7Gs0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
    storageKey: 'sb-auth-token',
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('Error setting auth token:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing auth token:', error);
        }
      },
    },
  },
});

export const auth = supabase.auth;
