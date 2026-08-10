// src/tools/houseandhome/tenant-billing/modules/shared/StatusCard.tsx
import React from 'react';
import { Card } from '@/core/components/ui/Card';
import { MonthPicker } from './MonthPicker';
import { useUIStore } from '../../store/uiStore';
import { MdAccessTime } from 'react-icons/md';

interface StatusCardProps {
  bill?: any;
  updatedAt?: string; // ISO timestamp string (static)
}

export const StatusCard: React.FC<StatusCardProps> = ({
  bill,
  updatedAt,
}) => {
  const { selectedMonth, setSelectedMonth } = useUIStore();
  const [year, month] = selectedMonth.split('-');

  // ─── Format timestamp ──────────────────────────────────────
  const formatTimestamp = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayTime = updatedAt ? formatTimestamp(updatedAt) : '';

  return (
    <Card className="p-3 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* ─── LEFT: Static last updated time ───────────────────── */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <MdAccessTime className="w-4 h-4" />
          {displayTime ? (
            <span>Updated: {displayTime}</span>
          ) : (
            <span>No updates yet</span>
          )}
        </div>

        {/* ─── RIGHT: MonthPicker only ──────────────────────────── */}
        <div className="flex items-center gap-3">
          <MonthPicker
            year={year}
            month={month}
            onMonthChange={(y, m) => setSelectedMonth(`${y}-${m}`)}
          />
        </div>
      </div>
    </Card>
  );
};