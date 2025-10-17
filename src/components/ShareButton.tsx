'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check } from 'lucide-react';
import { generateShareableUrl, copyToClipboard } from '@/lib/shareUtils';

interface ShareButtonProps {
  data: {
    projects: any[];
    headerTitle: string;
    headerSubtitle: string;
  };
}

export function ShareButton({ data }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareableUrl = generateShareableUrl(data);
    const success = await copyToClipboard(shareableUrl);
    
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      // Fallback: show the URL in an alert
      alert(`Share this URL: ${shareableUrl}`);
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Share
        </>
      )}
    </Button>
  );
}
