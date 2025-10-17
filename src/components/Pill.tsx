'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';

interface PillProps {
  value: string;
  onChange: (value: string) => void;
  type: 'plan' | 'design' | 'build';
  variant: 'grey' | 'on-hold' | 'done' | 'blocked' | 'dark-grey' | 'no-fill';
}

const planOptions = [
  { value: 'Prime', label: 'Prime' },
  { value: 'Free', label: 'Free' },
  { value: 'Pre-account', label: 'Pre-account' },
];

const statusOptions = [
  { value: 'Not started', label: 'Not started' },
  { value: 'In progress', label: 'In progress' },
  { value: 'On hold', label: 'On hold' },
  { value: 'Blocked', label: 'Blocked' },
  { value: 'Done', label: 'Done' },
  { value: 'Future', label: 'Future' },
];

// Color mapping for each variant
const getVariantColor = (variant: string) => {
  switch (variant) {
    case 'grey': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    case 'on-hold': return 'bg-[#F4DD90] text-[#4D462F]';
    case 'done': return 'bg-[#cce2e2] text-[#0B4F51]';
    case 'blocked': return 'bg-[#FFD1D2] text-[#732A33]';
    case 'dark-grey': return 'bg-[#DCDBDC] text-[#777680]';
    case 'no-fill': return 'text-slate-900 dark:text-slate-100';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export function Pill({ value, onChange, type, variant }: PillProps) {
  const options = type === 'plan' ? planOptions : statusOptions;
  
  // Fix width to "In progress" length (11 characters) for all pills - text only, no chevron space
  // Add 16px padding (8px left + 8px right) for better text spacing
  const estimatedWidth = Math.max(11 * 7 + 16, 100);

  return (
    <div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          className={`w-[${estimatedWidth}px] h-5 border-none shadow-none focus:ring-0 focus:outline-none focus:ring-offset-0 focus:border-transparent hover:border-transparent bg-transparent p-0 [&>svg]:opacity-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none`}
          style={{ width: `${estimatedWidth}px` }}
        >
          {variant === 'no-fill' ? (
            <div className="flex items-center justify-center w-full h-full px-2 relative hover:outline hover:outline-blue-500 hover:outline-1 hover:rounded-full group/pill">
              <span className="text-xs text-center group-hover/pill:truncate" style={{ 
                width: '100%',
                maxWidth: 'calc(100% - 20px)',
                transform: 'translateX(0)',
                transition: 'transform 0.2s ease'
              }}>
                {value}
              </span>
              <ChevronDown className="h-3 w-3 opacity-0 group-hover/pill:opacity-100 transition-opacity absolute right-1 flex-shrink-0" style={{ 
                marginRight: '2px',
                paddingTop: '2px',
                transform: 'translateY(0)'
              }} />
            </div>
          ) : (
            <div className={`flex items-center justify-center w-full h-full px-2 rounded-full ${getVariantColor(variant)} relative hover:opacity-90 transition-opacity group/pill`}>
              <span className="text-xs text-center group-hover/pill:truncate" style={{ 
                width: '100%',
                maxWidth: 'calc(100% - 20px)',
                transform: 'translateX(0)',
                transition: 'transform 0.2s ease'
              }}>
                {value}
              </span>
              <ChevronDown className="h-3 w-3 opacity-0 group-hover/pill:opacity-100 transition-opacity absolute right-1 flex-shrink-0" style={{ 
                marginRight: '2px',
                paddingTop: '2px',
                transform: 'translateY(0)'
              }} />
            </div>
          )}
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
