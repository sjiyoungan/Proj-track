'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  textSize?: 'sm' | 'lg';
  multiline?: boolean;
  width?: 'hug' | 'fill';
}

export function InputField({ 
  value, 
  onChange, 
  placeholder = "Click to edit",
  className,
  textSize = 'sm',
  multiline = false,
  width = 'hug'
}: InputFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [inputWidth, setInputWidth] = useState<string>('auto');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

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

  const handleClick = () => {
    // Store the width before entering edit mode
    if (width === 'fill') {
      setInputWidth('100%');
    } else if (displayRef.current) {
      setInputWidth(`${displayRef.current.offsetWidth}px`);
    } else {
      setInputWidth('auto');
    }
    setIsEditing(true);
  };

  const handleBlur = () => {
    // Delay to allow for potential clicks on buttons
    setTimeout(() => {
      handleSave();
    }, 150);
  };

  const sizeStyles = textSize === 'lg' 
    ? "text-2xl font-semibold" 
    : "text-sm";

  return (
    <div
      className={cn(
        "rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors",
        isEditing && "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
        width === 'fill' ? "w-full" : "w-auto",
        className
      )}
      style={{
        padding: '2px'
      }}
    >
      {isEditing ? (
        multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={cn(
              "bg-transparent border-none outline-none text-slate-900 dark:text-slate-100"
            )}
            style={{
              paddingTop: '2px',
              paddingBottom: '2px',
              paddingLeft: '8px',
              paddingRight: '8px',
              height: textSize === 'lg' ? '40px' : '32px',
              minHeight: textSize === 'lg' ? '40px' : '32px',
              lineHeight: textSize === 'lg' ? '1.2' : 'normal',
              fontSize: textSize === 'lg' ? '24px' : '14px',
              boxSizing: 'border-box',
              width: width === 'fill' ? '100%' : 'auto',
              minWidth: width === 'fill' ? '100%' : '0',
              maxWidth: width === 'fill' ? '100%' : 'none'
            }}
            placeholder={placeholder.replace('...', '')}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={cn(
              "bg-transparent border-none outline-none text-slate-900 dark:text-slate-100"
            )}
            style={{
              paddingTop: '2px',
              paddingBottom: '2px',
              paddingLeft: '8px',
              paddingRight: '8px',
              height: textSize === 'lg' ? '40px' : '32px',
              lineHeight: textSize === 'lg' ? '1.2' : 'normal',
              fontSize: textSize === 'lg' ? '24px' : '14px',
              boxSizing: 'border-box',
              width: inputWidth
            }}
            placeholder={placeholder.replace('...', '')}
          />
        )
      ) : (
        <div
          ref={displayRef}
          onClick={handleClick}
          className={cn(
            "cursor-text w-fit",
            !value && "text-slate-400 dark:text-slate-500"
          )}
          style={{
            paddingTop: '2px',
            paddingBottom: '2px',
            paddingLeft: '8px',
            paddingRight: '8px',
            height: textSize === 'lg' ? '40px' : '32px',
            lineHeight: textSize === 'lg' ? '36px' : '28px',
            fontSize: textSize === 'lg' ? '24px' : '14px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {value || placeholder.replace('...', '')}
        </div>
      )}
    </div>
  );
}
