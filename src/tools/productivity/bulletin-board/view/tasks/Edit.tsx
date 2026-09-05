// src/tools/productivity/bulletin-board/view/tasks/Edit.tsx
import React, { useState } from 'react';
import { Overlay } from '@/core/components/ui/Overlay';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { TaskForm } from '../../shared';
import { Task } from '../../store/taskStore';

interface EditProps {
  isOpen: boolean;
  onClose: () => void;
  task: Pick<Task, 'id' | 'title' | 'type' | 'freqValue' | 'freqUnit' | 'startDate' | 'endDate' | 'notes'>;
  onSave: (id: string, data: Partial<Task>) => Promise<void>;
}

type FormData = {
  title: string;
  taskType: 'permanent' | 'temporary';
  freqValue: number;
  freqUnit: 'day' | 'week' | 'month';
  startDate: string;
  endDate: string;
  notes: string;
};

export function Edit({ isOpen, onClose, task, onSave }: EditProps) {
  const [title, setTitle] = useState(task.title);
  const [taskType, setTaskType] = useState(task.type);
  const [freqValue, setFreqValue] = useState(task.freqValue);
  const [freqUnit, setFreqUnit] = useState(task.freqUnit);
  const [startDate, setStartDate] = useState(task.startDate);
  const [endDate, setEndDate] = useState(task.endDate || '');
  const [notes, setNotes] = useState(task.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave(task.id, {
        title: title.trim(),
        type: taskType,
        freqValue,
        freqUnit,
        startDate,
        endDate: taskType === 'temporary' && endDate ? endDate : null,
        notes,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const data: FormData = {
    title,
    taskType,
    freqValue,
    freqUnit,
    startDate,
    endDate,
    notes,
  };

  const handleChange = (field: keyof FormData, value: string | number) => {
    const setters: Record<keyof FormData, (v: any) => void> = {
      title: setTitle,
      taskType: setTaskType,
      freqValue: setFreqValue,
      freqUnit: setFreqUnit,
      startDate: setStartDate,
      endDate: setEndDate,
      notes: setNotes,
    };
    setters[field]?.(value);
  };

  return (
    <Overlay isOpen={isOpen} onClose={onClose}>
      <Container className="px-0 max-w-2xl mx-auto py-8">
        <Card className="p-6 shadow-xl">
          <TaskForm
            data={data}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onClose={onClose}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
            titleLabel="Edit Task"
          />
        </Card>
      </Container>
    </Overlay>
  );
}