'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';

interface StatusDropdownProps {
  value: string;
  onChange: (value: string) => void;
  type: 'design' | 'build' | 'plan';
  usePillStyle?: boolean;
}

const planOptions = [
  { value: 'Prime', label: 'Prime' },
  { value: 'Free', label: 'Free' },
  { value: 'Pre-account', label: 'Pre-account' },
];

const statusOptions = [
  { value: '', label: 'Select' },
  { value: 'Not started', label: 'Not started' },
  { value: 'In progress', label: 'In progress' },
  { value: 'On hold', label: 'On hold' },
  { value: 'Blocked', label: 'Blocked' },
  { value: 'Done', label: 'Done' },
  { value: 'Future', label: 'Future' },
];

// Color mapping for each status
const getStatusColor = (value: string, type: 'design' | 'build' | 'plan') => {
  // Handle empty/select state with transparent background and InputField empty state text color
  if (!value || value === '') {
    return 'bg-transparent text-slate-400 dark:text-slate-500';
  }
  
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

export function StatusDropdown({ value, onChange, type, usePillStyle = true }: StatusDropdownProps) {
  const options = type === 'plan' ? planOptions : statusOptions;
  
  // Calculate the width needed for the longest option
  const longestOption = options.reduce((longest, option) => 
    option.label.length > longest.length ? option.label : longest, ''
  );
  
  // Estimate width based on character count (roughly 7px per character + padding)
  // Use the longest option width for all pills to ensure consistency
  // Add extra space for chevron (12px) + 4px spacing + 16px padding
  const estimatedWidth = Math.max(longestOption.length * 7 + 52, 110);

  return (
    <div className="group">
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger 
          className={`w-[${estimatedWidth}px] h-5 border-none shadow-none focus:ring-0 focus:outline-none focus:ring-offset-0 focus:border-transparent hover:border-transparent bg-transparent p-0 [&>svg]:opacity-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none`}
          style={{ width: `${estimatedWidth}px` }}
        >
          {usePillStyle ? (
            <div className={`flex items-center justify-center w-full h-full px-2 rounded-full ${getStatusColor(value, type)} relative hover:opacity-90 transition-opacity`}>
              <span className="text-xs">{(!value || value === '') ? 'Select' : value}</span>
              <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2" />
            </div>
          ) : (
            <div className="flex items-center justify-start w-full h-full px-2 relative">
              <span className="text-xs text-slate-900 dark:text-slate-100">{(!value || value === '') ? 'Select' : value}</span>
              <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2" />
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
