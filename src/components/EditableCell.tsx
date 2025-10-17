'use client';

import React from 'react';
import { InputField } from '@/components/InputField';

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export function EditableCell({ 
  value, 
  onChange, 
  className, 
  placeholder = "Click to edit",
  multiline = false 
}: EditableCellProps) {
  return (
    <InputField
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      textSize="sm"
      multiline={multiline}
      width="fill"
      className={className}
    />
  );
}