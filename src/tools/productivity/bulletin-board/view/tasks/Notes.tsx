// src/tools/productivity/bulletin-board/view/tasks/Notes.tsx
import React from 'react';
import { Textarea } from '@/core/components/ui/Textarea';

interface NotesProps {
  notes: string;
}

export function Notes({ notes }: NotesProps) {
  return (
    <div className="mb-2">
      <Textarea
        value={notes || ''}
        readOnly
        rows={3}
        placeholder="No notes"
        className="text-xs text-gray-700 dark:text-gray-300 rounded-lg resize-none p-2 w-full"
      />
    </div>
  );
}