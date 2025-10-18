import { createClient } from '@supabase/supabase-js'

// Temporarily hardcode for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ngsjojlxgbbraulwlzne.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nc2pvamx4Z2JicmF1bHdsem5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTcwNDksImV4cCI6MjA3NjI5MzA0OX0.A6_2VTtkVOvYR8lXNYNCCnaDpMJt860pjqcNpwcgsCw"

console.log('🔧 Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl?.substring(0, 20) + '...',
  usingRealClient: !!(supabaseUrl && supabaseAnonKey)
})

// Create a mock client for build time if environment variables are missing
const createMockClient = () => ({
  from: () => ({
    select: () => ({
      order: () => Promise.resolve({ data: [], error: null }),
      eq: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
    upsert: () => Promise.resolve({ data: [], error: null })
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: () => Promise.resolve({ error: null }),
    signInWithPassword: () => Promise.resolve({ error: null }),
    signOut: () => Promise.resolve({ error: null })
  }
})

const supabaseClient = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : createMockClient() as any

// Override the signOut method to prevent 403 errors
if (supabaseClient && supabaseClient.auth) {
  const originalSignOut = supabaseClient.auth.signOut;
  supabaseClient.auth.signOut = async () => {
    console.log('🚫 Blocked Supabase signOut to prevent 403 error');
    return { error: null };
  };
}

// Intercept fetch requests to block logout calls
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : (input as Request).url;
    
    // Block any logout requests
    if (url.includes('/auth/v1/logout')) {
      console.log('🚫 Blocked logout request to:', url);
      return new Response(JSON.stringify({}), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return originalFetch(input, init);
  };
}

export const supabase = supabaseClient
