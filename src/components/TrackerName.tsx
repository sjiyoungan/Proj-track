'use client';

import React from 'react';
import { InputField } from '@/components/InputField';
import { UserProfile } from '@/components/UserProfile';
import { BoardSelector } from '@/components/TrackerSelector';

interface BoardNameProps {
  boardName: string;
  onBoardNameChange: (boardName: string) => void;
  currentBoardId: string;
  onBoardChange: (boardId: string, accessLevel: string) => void;
  refreshTrigger?: number;
}

export function BoardName({ 
  boardName, 
  onBoardNameChange, 
  currentBoardId,
  onBoardChange,
  refreshTrigger
}: BoardNameProps) {
  const hasName = boardName.trim().length > 0;

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-0">
          <div className="w-fit">
            <InputField
              value={boardName}
              onChange={onBoardNameChange}
              placeholder={hasName ? "Enter board name..." : "Board name"}
              textSize="lg"
              width="hug"
              className={hasName ? "text-slate-900 dark:text-slate-100" : ""}
            />
          </div>
                <BoardSelector
                  currentBoardId={currentBoardId}
                  onBoardChange={onBoardChange}
                  boardName={boardName}
                  refreshTrigger={refreshTrigger}
                />
        </div>
      </div>
      <UserProfile />
    </div>
  );
}

// Legacy export for backward compatibility
export const TrackerName = BoardName;