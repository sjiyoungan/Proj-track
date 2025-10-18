'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { getUserTrackers, createTracker } from '@/lib/supabaseService';

interface Tracker {
  tracker_id: string;
  tracker_name: string;
  tracker_display_name: string;
  is_owner: boolean;
  access_level: string;
  owner_email: string;
  owner_name: string;
}

interface TrackerSelectorProps {
  currentTrackerId: string;
  onTrackerChange: (trackerId: string, accessLevel: string) => void;
  trackerName: string;
}

export function TrackerSelector({ currentTrackerId, onTrackerChange, trackerName }: TrackerSelectorProps) {
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuWidth, setMenuWidth] = useState(192); // Default width in pixels

  const calculateMenuWidth = () => {
    const strings = [
      trackerName || 'My tracker',
      'Your Trackers',
      'Trackers shared with you',
      'Add tracker',
      'No shared trackers yet'
    ];
    
    // Add other tracker names
    trackers.forEach(tracker => {
      strings.push(tracker.tracker_display_name);
      strings.push(`by ${tracker.owner_name || tracker.owner_email}`);
    });
    
    // Calculate approximate width based on character count
    // Roughly 8px per character for small text, plus padding
    const maxLength = Math.max(...strings.map(s => s.length));
    const calculatedWidth = Math.max(160, (maxLength * 8) + 40); // Min 160px, add 40px for padding/icons
    
    setMenuWidth(Math.min(calculatedWidth, 320)); // Cap at 320px max
  };

  const loadTrackers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading trackers...');
      const userTrackers = await getUserTrackers();
      console.log('✅ Loaded trackers:', userTrackers);
      setTrackers(userTrackers);
    } catch (error) {
      console.error('❌ Error loading trackers:', error);
      // If the database functions don't exist yet, show empty state
      setTrackers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrackers();
  }, []);

  useEffect(() => {
    calculateMenuWidth();
  }, [trackers, trackerName]);

  const handleCreateTracker = async () => {
    try {
      const trackerCount = trackers.filter(t => t.is_owner).length + 1;
      const displayName = `Tracker ${trackerCount}`;
      
      console.log('🔄 Creating new tracker:', displayName);
      const newTracker = await createTracker(displayName);
      console.log('✅ New tracker created:', newTracker);
      
      // Reload trackers to include the new one
      console.log('🔄 Reloading trackers...');
      await loadTrackers();
      console.log('✅ Trackers reloaded');
      
      // Switch to the new tracker
      console.log('🔄 Switching to new tracker:', newTracker.tracker_id);
      onTrackerChange(newTracker.tracker_id, 'edit');
      setIsOpen(false);
    } catch (error) {
      console.error('❌ Error creating tracker:', error);
      alert('Failed to create tracker. Please run the database setup first.');
    }
  };

  const ownedTrackers = trackers.filter(t => t.is_owner);
  const sharedTrackers = trackers.filter(t => !t.is_owner);
  const currentTracker = trackers.find(t => t.tracker_id === currentTrackerId);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-pulse h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="animate-pulse h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none flex items-center justify-center" 
          style={{ 
            marginTop: '6px',
            outline: 'none',
            boxShadow: 'none',
            border: 'none'
          }}
        >
          <div 
            className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[7px] border-l-transparent border-r-transparent border-t-slate-400 dark:border-t-slate-500"
            style={{ 
              borderRadius: '2px'
            }}
          />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" style={{ width: `${menuWidth}px` }} className="p-2">
        {/* Owned Trackers Section */}
        <div className="px-0 py-1">
          <div className="font-medium text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wide px-2 pb-2" style={{ fontSize: '10px' }}>
            Your Trackers
          </div>
          
          {/* Show "My tracker" as the first option */}
          <div className={`flex items-center justify-between py-1 px-2 rounded-md ${currentTrackerId === currentTrackerId ? 'bg-slate-100 dark:bg-slate-800' : ''}`}>
            <DropdownMenuItem 
              onClick={() => {
                onTrackerChange(currentTrackerId, 'edit');
                setIsOpen(false);
              }}
              className="flex-1 cursor-pointer bg-transparent hover:bg-transparent p-0"
            >
              <span className="text-sm">{trackerName || 'My tracker'}</span>
            </DropdownMenuItem>
            
          </div>
          
          {/* Show other owned trackers if any */}
          {ownedTrackers.filter(t => t.tracker_id !== currentTrackerId).map((tracker) => (
            <div key={tracker.tracker_id} className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <DropdownMenuItem 
                onClick={() => {
                  onTrackerChange(tracker.tracker_id, tracker.access_level);
                  setIsOpen(false);
                }}
                className="flex-1 cursor-pointer"
              >
                <span className="text-sm">{tracker.tracker_display_name}</span>
              </DropdownMenuItem>
              
            </div>
          ))}
          
          {/* Add Another Tracker Button */}
          <DropdownMenuItem 
            onClick={handleCreateTracker}
            className="cursor-pointer text-black dark:text-white hover:text-black dark:hover:text-white text-xs py-2 px-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add tracker
          </DropdownMenuItem>
        </div>
        
        {/* Separator */}
        <DropdownMenuSeparator />
        
        {/* Shared Trackers Section */}
        <div className="px-0 py-1">
          <div className="font-medium text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wide px-2 pb-2" style={{ fontSize: '10px' }}>
            Trackers shared with you
          </div>
          
          {sharedTrackers.length === 0 ? (
            <div className="text-slate-500 dark:text-slate-400 py-2 px-2" style={{ fontSize: '12px' }}>
              No shared trackers yet
            </div>
          ) : (
            sharedTrackers.map((tracker) => (
              <DropdownMenuItem 
                key={tracker.tracker_id}
                onClick={() => {
                  onTrackerChange(tracker.tracker_id, tracker.access_level);
                  setIsOpen(false);
                }}
                className="cursor-pointer px-2"
              >
                <div className="flex flex-col">
                  <span className="text-sm">{tracker.tracker_display_name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    by {tracker.owner_name || tracker.owner_email}
                  </span>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
