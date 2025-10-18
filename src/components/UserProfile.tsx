'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Share2 } from 'lucide-react';
import { createShare } from '@/lib/supabaseService';

export function UserProfile() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    console.log('Sign out button clicked');
    try {
      await signOut();
      console.log('Sign out successful');
      setIsOpen(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleShare = async () => {
    try {
      // Create a share in Supabase
      const shareId = await createShare();
      
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('share', shareId);
      const shareUrl = currentUrl.toString();
      
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Shareable link copied to clipboard! Anyone with an account can now edit your data.');
      }).catch(() => {
        // Fallback if clipboard API fails
        prompt('Copy this link to share:', shareUrl);
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create share:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to create share link: ${errorMessage}`);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild className="focus:outline-none focus:ring-0 focus:ring-offset-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-12 w-12 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 p-0 overflow-hidden mr-1 focus:outline-none focus:ring-0 focus:ring-offset-0"
          style={{ outline: 'none', boxShadow: 'none' }}
          onClick={() => console.log('Profile button clicked')}
        >
          <img 
            src="/Profile-icon-Blue.svg"
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
            onError={(e) => {
              console.log('Profile icon failed to load, using fallback');
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling.style.display = 'flex';
            }}
            onLoad={() => console.log('Profile icon loaded successfully')}
          />
          <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg" style={{ display: 'none' }}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-fit">
        <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-black dark:text-white">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
