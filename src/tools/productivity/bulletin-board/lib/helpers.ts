// src/tools/productivity/bulletin-board/lib/helpers.ts
import { Task } from '../store/taskStore';

export const getOccurrenceDate = (
  startDate: Date,
  freqValue: number,
  freqUnit: 'day' | 'week' | 'month',
  index: number
): Date => {
  const date = new Date(startDate);
  if (freqUnit === 'day') date.setDate(date.getDate() + freqValue * index);
  else if (freqUnit === 'week') date.setDate(date.getDate() + freqValue * 7 * index);
  else if (freqUnit === 'month') date.setMonth(date.getMonth() + freqValue * index);
  return date;
};

export const getAnchorIndex = (task: Task, today: Date): number => {
  const start = new Date(task.startDate);
  if (isNaN(start.getTime())) {
    console.warn('Invalid startDate for task', task.id);
    return 0;
  }
  let index = 0;
  while (true) {
    const occDate = getOccurrenceDate(start, task.freqValue, task.freqUnit, index);
    if (isNaN(occDate.getTime())) return 0;
    if (occDate >= today) return index;
    index++;
    if (index > 10000) {
      console.error('getAnchorIndex exceeded iteration limit for task', task.id);
      return 0;
    }
  }
};

export const getTaskWindow = (task: Task, today: Date): { date: Date; index: number }[] => {
  const anchorIndex = getAnchorIndex(task, today);
  const start = new Date(task.startDate);
  const windowDates = [];
  for (let i = anchorIndex - 4; i <= anchorIndex + 4; i++) {
    const date = getOccurrenceDate(start, task.freqValue, task.freqUnit, i);
    windowDates.push({ date, index: i });
  }
  return windowDates;
};

export const shouldBeActive = (task: Task): boolean => {
  if (task.isTrash) return false;
  if (task.type === 'permanent') return true;
  if (task.type === 'temporary') {
    const now = new Date();
    const start = new Date(task.startDate);
    start.setHours(0, 0, 0, 0);
    if (now < start) return false;
    if (task.endDate) {
      const end = new Date(task.endDate);
      end.setHours(23, 59, 59, 999);
      return now <= end;
    }
    return true;
  }
  return false;
};