'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LinksProps {
  figmaLink: string;
  prdLink: string;
  onFigmaChange: (value: string) => void;
  onPRDChange: (value: string) => void;
}

export function Links({ figmaLink, prdLink, onFigmaChange, onPRDChange }: LinksProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const hasLinks = figmaLink || prdLink;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <Plus className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <span className="text-slate-700 dark:text-slate-300">
          Links {hasLinks && `(${[figmaLink, prdLink].filter(Boolean).length})`}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Figma Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={figmaLink}
                  onChange={(e) => onFigmaChange(e.target.value)}
                  placeholder="https://figma.com/..."
                  className="flex-1 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {figmaLink && (
                  <a
                    href={figmaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                PRD Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={prdLink}
                  onChange={(e) => onPRDChange(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {prdLink && (
                  <a
                    href={prdLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

