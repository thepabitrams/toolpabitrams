// src/tools/productivity/bulletin-board/shared/TaskForm.tsx
import React from 'react';
import { Button } from '@/core/components/ui/Button';
import { Input } from '@/core/components/ui/Input';
import { Textarea } from '@/core/components/ui/Textarea';
import { Select } from '@/core/components/ui/Select';
import { DatePicker } from '@/core/components/ui/DatePicker';

interface TaskFormData {
  title: string;
  taskType: 'permanent' | 'temporary';
  freqValue: number;
  freqUnit: 'day' | 'week' | 'month';
  startDate: string;
  endDate: string | null;
  notes: string;
}

interface TaskFormProps {
  data: TaskFormData;
  onChange: (field: keyof TaskFormData, value: any) => void;
  onSubmit: () => void;
  onClose: () => void;
  isSubmitting?: boolean;
  submitLabel: string;
  titleLabel: string;
}

const typeOptions = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'temporary', label: 'Temporary' },
];

const unitOptions = [
  { value: 'day', label: 'Days' },
  { value: 'week', label: 'Weeks' },
  { value: 'month', label: 'Months' },
];

export function TaskForm({
  data,
  onChange,
  onSubmit,
  onClose,
  isSubmitting = false,
  submitLabel,
  titleLabel,
}: TaskFormProps) {
  const { title, taskType, freqValue, freqUnit, startDate, endDate, notes } = data;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && title.trim()) {
      e.preventDefault();
      onSubmit();
    }
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {titleLabel}
      </h2>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
          Title
        </label>
        <Input
          placeholder="Enter task title..."
          value={title}
          onChange={(e) => onChange('title', e.target.value)}
          autoFocus
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
            Card Type
          </label>
          <Select
            options={typeOptions}
            value={taskType}
            onChange={(v) => onChange('taskType', v)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
            Frequency
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              value={freqValue}
              onChange={(e) => onChange('freqValue', parseInt(e.target.value) || 1)}
              className="w-20 h-10"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Unit
            </span>
            <Select
              options={unitOptions}
              value={freqUnit}
              onChange={(v) => onChange('freqUnit', v)}
              className="flex-1 h-10"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
            Start Date
          </label>
          <DatePicker value={startDate} onChange={(v) => onChange('startDate', v)} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
            End Date
          </label>
          {taskType === 'temporary' ? (
            <DatePicker
              value={endDate || ''}
              onChange={(v) => onChange('endDate', v)}
              minDate={startDate}
            />
          ) : (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-600 text-sm text-gray-400 flex items-center w-full">
              Permanent – no end date
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
          Notes (optional)
        </label>
        <Textarea
          placeholder="Add notes..."
          value={notes}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="primary" onClick={onSubmit} disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </div>
  );
}