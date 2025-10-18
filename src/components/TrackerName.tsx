'use client';

import React from 'react';
import { InputField } from '@/components/InputField';
import { UserProfile } from '@/components/UserProfile';
import { TrackerSelector } from '@/components/TrackerSelector';

interface TrackerNameProps {
  trackerName: string;
  onTrackerNameChange: (trackerName: string) => void;
  currentTrackerId: string;
  onTrackerChange: (trackerId: string, accessLevel: string) => void;
}

export function TrackerName({ 
  trackerName, 
  onTrackerNameChange, 
  currentTrackerId,
  onTrackerChange
}: TrackerNameProps) {
  const hasName = trackerName.trim().length > 0;

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-0">
          <div className="w-fit">
            <InputField
              value={trackerName}
              onChange={onTrackerNameChange}
              placeholder={hasName ? "Enter tracker name..." : "Tracker name"}
              textSize="lg"
              width="hug"
              className={hasName ? "text-slate-900 dark:text-slate-100" : ""}
            />
          </div>
          <TrackerSelector
            currentTrackerId={currentTrackerId}
            onTrackerChange={onTrackerChange}
            trackerName={trackerName}
          />
        </div>
      </div>
      <UserProfile />
    </div>
  );
}