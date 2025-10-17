'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Plus, X } from 'lucide-react';
import { colors } from '@/lib/colors';
import { KRModal } from '@/components/KRModal';
import { KRItem } from '@/types/project';

interface KRDropdownProps {
  globalKRs: KRItem[];
  selectedKRIds: string[];
  onKRSelect: (krId: string) => void;
  onKRRemove: (krId: string) => void;
  onGlobalKRChange: (krs: KRItem[]) => void;
}

export function KRDropdown({ globalKRs, selectedKRIds, onKRSelect, onKRRemove, onGlobalKRChange }: KRDropdownProps) {
  const handleKRChange = (newKRs: KRItem[]) => {
    onGlobalKRChange(newKRs);
  };

  // Get selected KRs for display
  const selectedKRs = globalKRs.filter(kr => selectedKRIds.includes(kr.id));
  
  // Get available KRs (not selected)
  const availableKRs = globalKRs.filter(kr => !selectedKRIds.includes(kr.id));

  return (
    <div className="flex items-center gap-1">
      {/* Display selected KRs */}
      {selectedKRs.map((kr) => (
            <div
              key={kr.id}
              className="group/kr flex items-center text-xs text-slate-900 dark:text-slate-100 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              style={{ 
                height: '32px',
                paddingTop: '2px',
                paddingBottom: '2px',
                paddingLeft: '8px',
                paddingRight: '8px',
                width: 'fit-content',
                boxSizing: 'border-box'
              }}
            >
              <span style={{ textAlign: 'left' }}>
                {kr.text}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onKRRemove(kr.id);
                }}
                className="opacity-0 group-hover/kr:opacity-100 transition-opacity ml-1 flex-shrink-0"
                style={{ paddingTop: '2px' }}
              >
                <X className="w-3 h-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" />
              </button>
            </div>
      ))}
      
      {/* Dropdown for adding new KRs */}
      <div className="group">
        <Select onValueChange={onKRSelect} value="" modal={false}>
          <SelectTrigger 
            className="border-none shadow-none focus:ring-0 focus:outline-none focus:ring-offset-0 focus:border-transparent hover:border-transparent bg-transparent p-0 [&>svg]:opacity-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none w-[32px]"
            style={{ height: '32px' }}
          >
            <div className="flex items-center justify-center w-full h-full relative group/kr rounded transition-colors" style={{
              outline: '1px solid transparent',
              outlineOffset: '0px'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.outline = '1px solid rgb(226 232 240)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.outline = '1px solid transparent';
            }}>
              <div className={`${colors.container.blue} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`} style={{ width: '32px', height: '12px' }}>
                <Plus className="w-4 h-3" />
              </div>
            </div>
          </SelectTrigger>
          <SelectContent>
            {availableKRs.map((kr) => (
              <SelectItem key={kr.id} value={kr.id} className="pl-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: kr.color }}
                  />
                  <span>{kr.text}</span>
                </div>
              </SelectItem>
            ))}
            <div className={`${availableKRs.length > 0 ? 'border-t border-slate-200 dark:border-slate-700 mt-1 pt-1' : ''}`}>
              <KRModal
                krItems={globalKRs}
                onKRChange={handleKRChange}
              >
                <div className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                  <div className={`${colors.container.blue} flex items-center justify-center`} style={{ width: '16px', height: '12px' }}>
                    <Plus className="w-4 h-3" />
                  </div>
                  <span className={colors.container.blue}>Add KR</span>
                </div>
              </KRModal>
            </div>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}