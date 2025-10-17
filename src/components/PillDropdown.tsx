'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';

interface PillDropdownProps {
  value: string;
  onChange: (value: string) => void;
  type: 'plan' | 'design' | 'build';
  variant: 'filled' | 'text-only';
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

// Color mapping for each status
const getStatusColor = (value: string, type: 'design' | 'build' | 'plan') => {
  if (type === 'plan') {
    switch (value) {
      case 'Prime': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Free': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Pre-account': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  } else {
    // Design and Build status colors - shared between both columns
    switch (value) {
      case 'Not started': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'In progress': return 'bg-[#CBE0FC] text-[#224777]';
      case 'On hold': return 'bg-[#F4DD90] text-[#4D462F]';
      case 'Blocked': return 'bg-[#FFD1D2] text-[#732A33]';
      case 'Done': return 'bg-[#cce2e2] text-[#0B4F51]';
      case 'Future': return 'bg-[#DCDBDC] text-[#777680]';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }
};

export function PillDropdown({ value, onChange, type, variant }: PillDropdownProps) {
  const options = type === 'plan' ? planOptions : statusOptions;
  
  // Fixed width to accommodate "In progress" (longest text) + padding + chevron space
  const fixedWidth = 120; // Enough for "In progress" + padding + chevron

  return (
    <div className="group">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          className={`${variant === 'text-only' ? 'h-8' : 'h-5'} border-none shadow-none focus:ring-0 focus:outline-none focus:ring-offset-0 focus:border-transparent hover:border-transparent bg-transparent p-0 [&>svg]:opacity-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none`}
          style={{ width: `${fixedWidth}px` }}
        >
          {variant === 'filled' ? (
            <div className={`flex items-center justify-center w-full h-full rounded-full ${getStatusColor(value, type)} relative hover:opacity-90 transition-opacity group/pill`}>
              <span className="text-xs text-center group-hover/pill:truncate" style={{ 
                transform: 'translateX(0)',
                transition: 'transform 0.2s ease',
                textAlign: 'center',
                paddingLeft: '18px',
                paddingRight: '20px'
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
            <div className="flex items-center w-full h-full relative group/pill rounded transition-colors" style={{
              outline: '1px solid transparent',
              outlineOffset: '0px'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.outline = '1px solid rgb(226 232 240)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.outline = '1px solid transparent';
            }}>
              <span className="text-xs text-slate-900 dark:text-slate-100 group-hover/pill:truncate" style={{ 
                transform: 'translateX(0)',
                transition: 'transform 0.2s ease',
                textAlign: 'left',
                paddingLeft: '8px',
                paddingRight: '20px'
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
