'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DynamicInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  textSize?: 'sm' | 'lg';
  maxWidth?: string;
}

export function DynamicInputField({ 
  value, 
  onChange, 
  placeholder = "Click to edit",
  className,
  textSize = 'sm',
  maxWidth = '100%'
}: DynamicInputFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Auto-resize textarea when content changes
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      // Reset height to auto to get the natural height
      textarea.style.height = 'auto';
      // Get the scroll height but subtract any extra padding/borders
      const scrollHeight = textarea.scrollHeight;
      // Only resize if content actually needs more space than the minimum
      const minHeight = textSize === 'lg' ? 36 : 28;
      if (scrollHeight > minHeight) {
        textarea.style.height = `${scrollHeight}px`;
      } else {
        textarea.style.height = `${minHeight}px`;
      }
    }
  }, [editValue, isEditing, textSize]);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      handleSave();
    }, 100);
  };

  const handleClick = () => {
    setIsEditing(true);
  };

  const sizeStyles = textSize === 'lg' ? 'text-base' : 'text-sm';

  return (
    <div
      className={cn(
        "rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors w-full",
        isEditing && "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
        className
      )}
      style={{
        padding: '2px',
        maxWidth: maxWidth,
        width: '100%'
      }}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={cn(
            "w-full bg-transparent border-none outline-none resize-none text-slate-900 dark:text-slate-100 overflow-hidden"
          )}
          style={{
            lineHeight: '1.5',
            paddingTop: '4px',
            paddingBottom: '5px',
            paddingLeft: '6px',
            paddingRight: '6px',
            height: textSize === 'lg' ? '36px' : '28px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            fontSize: '13px',
            boxSizing: 'border-box',
            verticalAlign: 'top'
          }}
          placeholder={placeholder.replace('...', '')}
          rows={1}
        />
      ) : (
        <div
          onClick={handleClick}
          className={cn(
            "cursor-text w-full",
            sizeStyles
          )}
          style={{
            lineHeight: '1.5',
            paddingTop: '4px',
            paddingBottom: '5px',
            paddingLeft: '6px',
            paddingRight: '6px',
            minHeight: textSize === 'lg' ? '36px' : '28px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            fontSize: '13px',
            boxSizing: 'border-box',
            maxWidth: maxWidth
          }}
        >
          <span className={value ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}>
            {value || placeholder.replace('...', '')}
          </span>
        </div>
      )}
    </div>
  );
}
