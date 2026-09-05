// src/tools/productivity/bulletin-board/controls/useAddTask.ts
import { useState, useCallback } from 'react';

export function useAddTask() {
  const getToday = () => new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState<'permanent' | 'temporary'>('temporary');
  const [freqValue, setFreqValue] = useState<number>(1);
  const [freqUnit, setFreqUnit] = useState<'day' | 'week' | 'month'>('day');
  const [startDate, setStartDate] = useState(getToday);
  const [endDate, setEndDate] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = useCallback(() => {
    setTitle('');
    setTaskType('temporary');
    setFreqValue(1);
    setFreqUnit('day');
    setStartDate(getToday());
    setEndDate('');
    setNotes('');
    setIsSubmitting(false);
  }, []);

  return {
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
    isSubmitting,
    setIsSubmitting,
    reset,
  };
}