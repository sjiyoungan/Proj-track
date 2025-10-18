'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { shareTracker } from '@/lib/supabaseService';

interface ShareTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackerId: string;
  trackerName: string;
}

export function ShareTrackerModal({ isOpen, onClose, trackerId, trackerName }: ShareTrackerModalProps) {
  const [sharedWithName, setSharedWithName] = useState('');
  const [sharedWithEmail, setSharedWithEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState<'view' | 'edit'>('edit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleShare = async () => {
    if (!sharedWithName.trim() || !sharedWithEmail.trim()) {
      setError('Please fill in both name and email');
      return;
    }

    if (!sharedWithEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await shareTracker(trackerId, sharedWithEmail.trim(), sharedWithName.trim(), accessLevel);
      
      // Reset form
      setSharedWithName('');
      setSharedWithEmail('');
      setAccessLevel('edit');
      
      // Close modal
      onClose();
      
      // Show success message (you could add a toast notification here)
      alert(`Successfully shared "${trackerName}" with ${sharedWithName}!`);
      
    } catch (error) {
      console.error('❌ Error sharing tracker:', error);
      setError('Failed to share tracker. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSharedWithName('');
    setSharedWithEmail('');
    setAccessLevel('edit');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Share Tracker
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tracker Info */}
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Sharing: <span className="font-medium text-slate-900 dark:text-slate-100">{trackerName}</span>
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="sharedWithName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Name
            </Label>
            <Input
              id="sharedWithName"
              value={sharedWithName}
              onChange={(e) => setSharedWithName(e.target.value)}
              placeholder="Enter their name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="sharedWithEmail" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Address
            </Label>
            <Input
              id="sharedWithEmail"
              type="email"
              value={sharedWithEmail}
              onChange={(e) => setSharedWithEmail(e.target.value)}
              placeholder="Enter their email address"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Access Level
            </Label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="accessLevel"
                  value="edit"
                  checked={accessLevel === 'edit'}
                  onChange={(e) => setAccessLevel(e.target.value as 'view' | 'edit')}
                  className="mr-2"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Edit - Can view and modify the tracker
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="accessLevel"
                  value="view"
                  checked={accessLevel === 'view'}
                  onChange={(e) => setAccessLevel(e.target.value as 'view' | 'edit')}
                  className="mr-2"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  View Only - Can only view the tracker
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={loading || !sharedWithName.trim() || !sharedWithEmail.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Sharing...' : 'Share'}
          </Button>
        </div>
      </div>
    </div>
  );
}
