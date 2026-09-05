// src/tools/productivity/bulletin-board/view/tasks/Priority.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/core/components/ui/Input';
import { useTaskStore } from '../../store/taskStore';

interface PriorityProps {
  taskId: string;
  index: number;
}

export function Priority({ taskId, index }: PriorityProps) {
  const { taskOrder, moveTask } = useTaskStore();
  const [value, setValue] = useState(String(index + 1));
  const saving = useRef(false);

  useEffect(() => {
    setValue(String(index + 1));
  }, [index]);

  const save = async () => {
    if (saving.current) return;
    let num = parseInt(value);
    if (isNaN(num) || value === '') {
      setValue(String(index + 1));
      return;
    }
    if (num < 1) num = 1;
    const max = taskOrder.length;
    if (num > max) num = max;
    if (num !== index + 1) {
      saving.current = true;
      try {
        await moveTask(taskId, num - 1);
      } catch (error) {
        console.error('Failed to move task:', error);
      } finally {
        saving.current = false;
      }
    } else {
      setValue(String(index + 1));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    }
  };

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <span className="text-xs text-gray-400 font-medium">#</span>
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        className="w-16 text-center text-sm"
      />
    </div>
  );
}