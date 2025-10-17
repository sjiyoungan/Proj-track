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
  const [displayWidth, setDisplayWidth] = useState<number | null>(null);
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
    // Measure the display element width before switching to edit mode
    if (displayRef.current && width === 'hug') {
      const width = displayRef.current.offsetWidth;
      setDisplayWidth(width);
    }
    setIsEditing(true);
  };

  const handleBlur = () => {
    // Delay to allow for potential clicks on buttons
    setTimeout(() => {
      handleSave();
    }, 150);
  };

  const baseStyles = "bg-white dark:bg-slate-900 border-0 focus:ring-0 focus:outline-none rounded";
  const sizeStyles = textSize === 'lg' 
    ? "text-2xl font-semibold" 
    : "text-sm";
  
  const widthStyles = width === 'fill' 
    ? "w-full" 
    : "w-auto";
  
  const paddingStyles = ""; // Padding set in inline styles
  
  // Apply width to inline styles for both input and display
  const inputWidthStyles = width === 'fill' 
    ? { width: '100%' }
    : displayWidth && width === 'hug'
    ? { width: `${displayWidth}px` }
    : { 
        width: 'fit-content', 
        minWidth: 'fit-content',
        maxWidth: 'fit-content'
      };

  const displayWidthStyles = width === 'fill' 
    ? { width: '100%' }
    : { 
        width: 'fit-content', 
        minWidth: 'fit-content',
        maxWidth: 'fit-content'
      };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={cn(
            "min-h-[60px] px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:ring-0 focus:border-blue-500 resize-none bg-white dark:bg-slate-900 flex items-center",
            className
          )}
          style={{
            ...inputWidthStyles
          }}
          placeholder={placeholder}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={cn(
          baseStyles,
          sizeStyles,
          widthStyles,
          paddingStyles,
          "flex items-center placeholder:text-slate-400",
          className
        )}
        style={{
          outline: '1px solid transparent',
          outlineOffset: '0px',
          lineHeight: textSize === 'lg' ? '1.2' : 'normal',
          paddingTop: '2px',
          paddingBottom: '2px',
          paddingLeft: '8px',
          paddingRight: '8px',
          height: textSize === 'lg' ? 'auto' : '32px',
          minHeight: textSize === 'lg' ? '40px' : '32px',
          maxWidth: width === 'hug' ? 'fit-content' : 'none',
          boxSizing: 'border-box',
          margin: '0',
          border: 'none',
          ...inputWidthStyles
        } as React.CSSProperties}
        onFocus={(e) => {
          e.target.style.outline = '1px solid rgb(226 232 240)';
        }}
        placeholder={placeholder}
      />
    );
  }

  const displayMinHeight = textSize === 'lg' ? "min-h-[40px]" : "min-h-[32px]";
  
  return (
    <div
      ref={displayRef}
      onClick={handleClick}
      className={cn(
        "cursor-text hover:bg-slate-50 dark:hover:bg-slate-800 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-center",
        displayMinHeight,
        sizeStyles,
        widthStyles,
        !value && "text-slate-400 dark:text-slate-500", // Blue-Mid color for empty state (lighter)
        className
      )}
      style={{
        lineHeight: textSize === 'lg' ? '1.2' : 'normal',
        paddingTop: '2px',
        paddingBottom: '2px',
        paddingLeft: '8px',
        paddingRight: '8px',
        height: textSize === 'lg' ? 'auto' : '32px',
        minHeight: textSize === 'lg' ? '40px' : '32px',
        maxWidth: width === 'hug' ? 'fit-content' : 'none',
        boxSizing: 'border-box',
        ...displayWidthStyles
      } as React.CSSProperties}
    >
      {value || placeholder}
    </div>
  );
}
