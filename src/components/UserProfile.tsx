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
    await signOut();
    setIsOpen(false);
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
      alert('Failed to create share link. Please try again.');
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
        >
          <img 
            src="/Profile-icon-Blue.svg"
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
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
