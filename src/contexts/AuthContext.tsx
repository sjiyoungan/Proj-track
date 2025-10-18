'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider: Starting auth initialization');
    
    // Set a timeout to prevent hanging indefinitely
    const timeoutId = setTimeout(() => {
      console.log('🔐 AuthProvider: Timeout reached, setting loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      console.log('🔐 AuthProvider: Initial session loaded:', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        userEmail: session?.user?.email 
      });
      clearTimeout(timeoutId);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      console.error('🔐 AuthProvider: Error getting initial session:', error);
      clearTimeout(timeoutId);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log('🔐 Auth state changed:', { event, session: !!session, user: !!session?.user });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    console.log('🔐 Attempting sign up for:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    console.log('🔐 Sign up result:', { data, error });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('🔐 Sign in result:', { data, error });
    return { error };
  };

  const signOut = async () => {
    console.log('🔐 Attempting to sign out...');
    
    // Skip Supabase logout entirely due to 403 errors
    // Instead, clear all local state and force redirect
    try {
      console.log('🧹 Clearing local storage...');
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any Supabase session cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      console.log('🔄 Redirecting to login...');
      // Force redirect to login page
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ Failed to clear local state:', error);
      // Last resort: reload the page
      window.location.reload();
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
