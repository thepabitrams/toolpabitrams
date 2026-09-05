// src/tools/productivity/bulletin-board/view/tasks/CheckIn.tsx
import React from 'react';
import { useTaskStore } from '../../store/taskStore';
import { getTaskWindow } from '../../lib/helpers';
import { Task } from '../../store/taskStore';

interface CheckInProps {
  taskId: string;
  checkedDates: string[];
  startDate: string;
  endDate?: string | null;
  freqValue: number;
  freqUnit: 'day' | 'week' | 'month';
}

export function CheckIn({ taskId, checkedDates, startDate, endDate, freqValue, freqUnit }: CheckInProps) {
  const { updateTask } = useTaskStore();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const task: Task = {
    id: taskId,
    title: '',
    type: endDate ? 'temporary' : 'permanent',
    freqValue,
    freqUnit,
    startDate,
    endDate: endDate || null,
    checkedDates: [],
    notes: '',
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
    isTrash: false,
    trashDays: null,
  };

  let window = getTaskWindow(task, today);

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    window = window.filter(({ date }) => date <= end);
  }

  const toggleCheck = async (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    const isChecked = checkedDates.includes(dateKey);
    const newChecked = isChecked
      ? checkedDates.filter((d) => d !== dateKey)
      : [...checkedDates, dateKey];

    await updateTask(taskId, { checkedDates: newChecked });
  };

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {window.map(({ date }, idx) => {
        const dateKey = date.toISOString().split('T')[0];
        const checked = checkedDates.includes(dateKey);
        const isToday = date.toDateString() === today.toDateString();

        let className =
          'w-10 h-12 rounded-lg text-xs font-bold flex flex-col items-center justify-center transition-all duration-200 cursor-pointer';
        if (checked) {
          className += ' bg-green-500 text-white shadow-sm';
        } else if (isToday) {
          className += ' bg-blue-500 text-white shadow-md ring-2 ring-blue-300 ring-offset-2';
        } else {
          className += ' bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600';
        }

        return (
          <button key={idx} onClick={() => toggleCheck(date)} className={className}>
            <span>{date.getDate()}</span>
            <span className="text-[8px] opacity-80 uppercase">
              {date.toLocaleString('default', { month: 'short' })}
            </span>
          </button>
        );
      })}
    </div>
  );
}