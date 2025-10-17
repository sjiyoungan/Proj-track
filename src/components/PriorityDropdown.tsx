'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GripVertical } from 'lucide-react';

interface PriorityDropdownProps {
  currentPriority: number;
  maxPriority: number;
  onPriorityChange: (newPriority: number) => void;
  showDragHandle?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

export function PriorityDropdown({ 
  currentPriority, 
  maxPriority, 
  onPriorityChange, 
  showDragHandle = false,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging = false
}: PriorityDropdownProps) {
  const priorities = Array.from({ length: maxPriority }, (_, i) => i + 1);

  return (
    <div 
      className={`flex items-center gap-1 group ${isDragging ? 'opacity-50' : ''}`}
      draggable={showDragHandle}
      onDragStart={onDragStart}
    >
      {showDragHandle && (
        <div className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity w-3.5 h-3.5 flex items-center justify-center">
          <GripVertical className="h-3.5 w-3.5 text-slate-500" />
        </div>
      )}
      <div className="group/priority">
        <Select
          value={currentPriority.toString()}
          onValueChange={(value) => onPriorityChange(parseInt(value))}
        >
          <SelectTrigger className="w-16 border-none shadow-none focus:ring-0 hover:border-slate-200 dark:hover:border-slate-700 hover:outline hover:outline-slate-200 dark:hover:outline-slate-700 bg-transparent transition-colors [&>svg]:opacity-0 group-hover/priority:[&>svg]:opacity-50" style={{ height: '32px', borderRadius: '4px' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((priority) => (
              <SelectItem key={priority} value={priority.toString()}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}