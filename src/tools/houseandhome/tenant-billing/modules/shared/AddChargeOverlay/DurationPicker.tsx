// src/tools/houseandhome/tenant-billing/modules/shared/AddChargeOverlay/DurationPicker.tsx
import React from 'react';
import { MonthPicker } from '../MonthPicker';

interface DurationPickerProps {
  durationType: 'permanent' | 'custom' | 'one-time';
  setDurationType: (val: 'permanent' | 'custom' | 'one-time') => void;
  startMonth: string;
  setStartMonth: (val: string) => void;
  endMonth: string;
  setEndMonth: (val: string) => void;
  selectedMonth: string;
}

export const DurationPicker: React.FC<DurationPickerProps> = ({
  durationType,
  setDurationType,
  startMonth,
  setStartMonth,
  endMonth,
  setEndMonth,
  selectedMonth,
}) => {
  const getMonthLabel = (month: string) => {
    const [year, m] = month.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(m) - 1]} ${year}`;
  };

  const handleStartMonthChange = (year: string, month: string) => {
    const newMonth = `${year}-${month}`;
    setStartMonth(newMonth);
    if (endMonth < newMonth) {
      setEndMonth(newMonth);
    }
  };

  const handleEndMonthChange = (year: string, month: string) => {
    setEndMonth(`${year}-${month}`);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Duration
      </label>

      <div className="flex flex-wrap gap-3 mb-3">
        <label className="flex items-center gap-1 text-sm">
          <input
            type="radio"
            checked={durationType === 'permanent'}
            onChange={() => setDurationType('permanent')}
          />
          Permanent
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="radio"
            checked={durationType === 'custom'}
            onChange={() => setDurationType('custom')}
          />
          Custom
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="radio"
            checked={durationType === 'one-time'}
            onChange={() => setDurationType('one-time')}
          />
          One-Time
        </label>
      </div>

      {durationType === 'custom' && (
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Start Month
            </label>
            <MonthPicker
              year={startMonth.split('-')[0]}
              month={startMonth.split('-')[1]}
              onMonthChange={handleStartMonthChange}
              align="left"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              End Month
            </label>
            <MonthPicker
              year={endMonth.split('-')[0]}
              month={endMonth.split('-')[1]}
              onMonthChange={handleEndMonthChange}
              align="left"
            />
          </div>
          <div className="col-span-2 text-xs text-gray-500">
            Range: {getMonthLabel(startMonth)} → {getMonthLabel(endMonth)}
            &nbsp;({Math.ceil((new Date(endMonth + '-01').getTime() - new Date(startMonth + '-01').getTime()) / (1000 * 60 * 60 * 24 * 30))} months)
          </div>
        </div>
      )}

      {durationType === 'permanent' && (
        <div className="text-sm text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          This charge will appear in every month indefinitely.
        </div>
      )}

      {durationType === 'one-time' && (
        <div className="text-sm text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          This charge will appear only for {getMonthLabel(selectedMonth)}.
        </div>
      )}
    </div>
  );
};