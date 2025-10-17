'use client';

import React, { useState } from 'react';
import { SortOption } from '@/types/project';

interface SortableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSort: SortOption;
  onSortChange: (sortOption: SortOption) => void;
  className?: string;
}

export function SortableHeader({ 
  children, 
  sortKey, 
  currentSort, 
  onSortChange, 
  className = "" 
}: SortableHeaderProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const isCurrentSort = currentSort.startsWith(sortKey);
  const isAscending = currentSort.endsWith('-asc');
  
  const handleClick = () => {
    if (isCurrentSort) {
      // Toggle direction
      const newDirection = isAscending ? '-desc' : '-asc';
      onSortChange(`${sortKey}${newDirection}` as SortOption);
    } else {
      // Set new sort key with default ascending
      onSortChange(`${sortKey}-asc` as SortOption);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Determine which arrow to show
  const getArrow = () => {
    if (isHovered) {
      // On hover, show what the next click would do
      if (isCurrentSort) {
        // If currently sorted, show opposite direction (what next click would do)
        return isAscending ? '↑' : '↓';
      } else {
        // If not currently sorted, show default ascending direction
        return '↓';
      }
    } else {
      // When not hovered, show current sort state
      if (isCurrentSort) {
        return isAscending ? '↓' : '↑';
      }
      return null;
    }
  };

  const arrow = getArrow();

  return (
    <th 
      className={`pl-2 pr-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center min-w-0 w-full">
        <span className="truncate">
          {children}
        </span>
        {arrow && (
          <span className="text-slate-400 dark:text-slate-500 flex-shrink-0 ml-2">
            {arrow}
          </span>
        )}
      </div>
    </th>
  );
}
