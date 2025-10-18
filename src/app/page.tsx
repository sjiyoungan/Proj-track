'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect authenticated users to their tracker page
        console.log('🔄 Redirecting authenticated user to tracker:', user.id);
        router.push(`/tracker/${user.id}`);
      } else {
        // Show login/signup page for unauthenticated users
        console.log('👤 User not authenticated, showing auth page');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // This will be replaced by the redirect, but shows briefly
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your tracker...</p>
        </div>
      </div>
    );
  }

  // Show authentication page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Proj-track</h1>
          <p className="text-gray-600">Track your projects and initiatives</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/auth')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In / Sign Up
          </button>
          
          <p className="text-center text-sm text-gray-500">
            Each user gets their own private tracker page
          </p>
        </div>
      </div>
    </div>
  );
}