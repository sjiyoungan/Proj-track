'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface HyperlinkCellProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

// Function to convert text with URLs to JSX with clickable links
const renderTextWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

// Function to detect if pasted content is a URL and convert it to a link
const processPastedText = (text: string, currentText: string, selectionStart: number, selectionEnd: number) => {
  // If pasted text looks like a URL, wrap it in markdown-style link
  const urlRegex = /^https?:\/\/[^\s]+$/;
  if (urlRegex.test(text.trim())) {
    const before = currentText.substring(0, selectionStart);
    const after = currentText.substring(selectionEnd);
    return `${before}${text.trim()}${after}`;
  }
  
  // If current selection looks like a URL and we're pasting text, make it a link
  const selectedText = currentText.substring(selectionStart, selectionEnd);
  if (urlRegex.test(selectedText) && text.trim()) {
    const before = currentText.substring(0, selectionStart);
    const after = currentText.substring(selectionEnd);
    return `${before}${text.trim()}${after}`;
  }
  
  // Regular paste
  const before = currentText.substring(0, selectionStart);
  const after = currentText.substring(selectionEnd);
  return `${before}${text}${after}`;
};

export function HyperlinkCell({ 
  value, 
  onChange, 
  className, 
  placeholder = "Click to edit",
  multiline = false 
}: HyperlinkCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.metaKey && multiline) {
      handleSave();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    
    const newValue = processPastedText(
      pastedText, 
      editValue, 
      target.selectionStart || 0, 
      target.selectionEnd || 0
    );
    
    setEditValue(newValue);
  };

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    // Delay to allow for potential clicks on buttons
    setTimeout(() => {
      handleSave();
    }, 150);
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          className={cn(
            "w-full min-h-[60px] px-4 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:ring-0 focus:border-blue-500 resize-none bg-white dark:bg-slate-900",
            className
          )}
          placeholder={placeholder}
        />
      );
    }

    return (
      <Input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={handleBlur}
        className={cn(
          "h-8 px-4 py-1 text-sm border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-0 focus:outline-none bg-white dark:bg-slate-900 w-full",
          className
        )}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "w-full min-h-[32px] px-4 py-1 text-sm cursor-text hover:bg-slate-50 dark:hover:bg-slate-800 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors",
        !value && "text-slate-400 italic",
        className
      )}
    >
      {value ? renderTextWithLinks(value) : placeholder}
    </div>
  );
}
