// src/tools/houseandhome/tenant-billing/modules/shared/FooterCard.tsx
import React from 'react';
import { Card } from '@/core/components/ui/Card';
import { IconButton } from '@/core/components/ui/IconButton';
import { Button } from '@/core/components/ui/Button';
import { MonthPicker } from './MonthPicker';
import { MdContentCopy, MdImage, MdSave } from 'react-icons/md';

interface FooterCardProps {
  /** From month for range (YYYY-MM) */
  fromMonth: string;
  /** To month for range (YYYY-MM) */
  toMonth: string;
  /** Callback when From month changes */
  onFromMonthChange: (year: string, month: string) => void;
  /** Callback when To month changes */
  onToMonthChange: (year: string, month: string) => void;
  /** Callback for Copy button (range-aware) */
  onCopy: () => void;
  /** Callback for Export Image button (range-aware) */
  onExport: () => void;
  /** Callback for Save button */
  onSave: () => void;
  /** Optional label for Save button */
  saveLabel?: string;
  /** Whether Save button is primary (blue) */
  isSavePrimary?: boolean;
}

export const FooterCard: React.FC<FooterCardProps> = ({
  fromMonth,
  toMonth,
  onFromMonthChange,
  onToMonthChange,
  onCopy,
  onExport,
  onSave,
  saveLabel = 'Save',
  isSavePrimary = false,
}) => {
  const [fromYear, fromMon] = fromMonth.split('-');
  const [toYear, toMon] = toMonth.split('-');

  return (
    <Card className="p-3 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* ─── LEFT: Range Pickers ────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">From</span>
            <MonthPicker
              year={fromYear}
              month={fromMon}
              onMonthChange={onFromMonthChange}
              align="left"
              placement="top"
            />
          </div>
          <span className="text-xs text-gray-400">→</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">To</span>
            <MonthPicker
              year={toYear}
              month={toMon}
              onMonthChange={onToMonthChange}
              align="left"
              placement="top"
            />
          </div>
        </div>

        {/* ─── RIGHT: Buttons ──────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onCopy}
              className="text-gray-500 hover:text-blue-500"
              title="Copy range summary"
            >
              <MdContentCopy size={18} />
            </IconButton>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="text-gray-500 hover:text-purple-500"
              title="Export range image"
            >
              <MdImage size={18} />
            </IconButton>
          </div>

          <span className="text-gray-300 dark:text-gray-600">|</span>

          {/* ─── 🔥 FIX: Blue primary button ────────────────────── */}
          <Button
            size="sm"
            onClick={onSave}
            variant={isSavePrimary ? 'primary' : 'outline'}
            className={isSavePrimary ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
          >
            <MdSave size={16} className="mr-1" />
            {saveLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
};