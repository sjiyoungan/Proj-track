'use client';

import React from 'react';
import { InputField } from '@/components/InputField';
import { UserProfile } from '@/components/UserProfile';

interface EditableHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
}

export function EditableHeader({ title, onTitleChange }: EditableHeaderProps) {
  const hasTitle = title.trim().length > 0;

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="w-fit">
        <InputField
          value={title}
          onChange={onTitleChange}
          placeholder={hasTitle ? "Enter project title..." : "Proj-tracker (rename)"}
          textSize="lg"
          width="hug"
          className={hasTitle ? "text-slate-900 dark:text-slate-100" : ""}
        />
      </div>
      <UserProfile />
    </div>
  );
}