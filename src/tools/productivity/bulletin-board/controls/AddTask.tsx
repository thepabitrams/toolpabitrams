// src/tools/productivity/bulletin-board/controls/AddTask.tsx
import React from 'react';
import { Overlay } from '@/core/components/ui/Overlay';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { useTaskStore } from '../store/taskStore';
import { useAddTask } from './useAddTask';
import { TaskForm } from '../shared';

interface AddTaskProps {
  isOpen: boolean;
  onClose: () => void;
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

export function AddTask({ isOpen, onClose }: AddTaskProps) {
  const { addTask } = useTaskStore();
  const {
    title,
    setTitle,
    taskType,
    setTaskType,
    freqValue,
    setFreqValue,
    freqUnit,
    setFreqUnit,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    notes,
    setNotes,
    reset,
    isSubmitting,
    setIsSubmitting,
  } = useAddTask();

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await addTask({
        title: title.trim(),
        type: taskType,
        freqValue,
        freqUnit,
        startDate,
        endDate: taskType === 'temporary' && endDate ? endDate : null,
        notes,
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to add task:', error);
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
            submitLabel="Add Task"
            titleLabel="Add New Task"
          />
        </Card>
      </Container>
    </Overlay>
  );
}