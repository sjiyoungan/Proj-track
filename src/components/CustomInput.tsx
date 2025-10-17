'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  multiline?: boolean;
  placeholderClassName?: string;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, multiline, placeholderClassName, ...props }, ref) => {
    if (multiline) {
      return (
        <textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          className={cn(
            "w-full min-h-[60px] px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:ring-0 focus:border-slate-200 dark:focus:border-slate-700 resize-none bg-white dark:bg-slate-900",
            className
          )}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      );
    }

    return (
      <input
        ref={ref}
        className={cn(
          "h-8 px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 focus:border-slate-200 dark:focus:border-slate-700 focus:ring-0 focus:outline-none bg-white dark:bg-slate-900",
          className
        )}
        {...props}
      />
    );
  }
);

CustomInput.displayName = 'CustomInput';
