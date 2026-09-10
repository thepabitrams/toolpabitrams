// src/tools/productivity/infinite-type/Controls.tsx
import React from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { Button } from '@/core/components/ui/Button';
import { Input } from '@/core/components/ui/Input';
import { FiPlay, FiSquare, FiCopy } from 'react-icons/fi';

interface ControlsProps {
  pool: string;
  isRunning: boolean;
  onPoolChange: (val: string) => void;
  onStart: () => void;
  onStop: () => void;
  onCopy: () => void;
  stats: {
    cpm: number;
    acc: string;
    keys: number;
    errors: number;
    time: string;
  };
}

export const Controls: React.FC<ControlsProps> = ({
  pool,
  isRunning,
  onPoolChange,
  onStart,
  onStop,
  onCopy,
  stats,
}) => {
  return (
    <Container className="px-0 py-0 max-w-full">
      <Card className="overflow-hidden p-4 min-h-[200px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[140px]">
              <Input
                label="Character Pool"
                value={pool}
                onChange={(e) => onPoolChange(e.target.value)}
                disabled={isRunning}
                spellCheck={false}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-2 pb-0.5">
              {!isRunning ? (
                <Button onClick={onStart} variant="primary" className="px-5">
                  <FiPlay className="mr-1.5" /> Start
                </Button>
              ) : (
                <Button onClick={onStop} variant="danger" className="px-5">
                  <FiSquare className="mr-1.5" /> Stop
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 pt-2 text-sm border-t border-gray-100 dark:border-gray-800">
            <span className="text-gray-500 dark:text-gray-400">
              CPM <strong className="text-gray-900 dark:text-white font-mono ml-1">{stats.cpm}</strong>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Acc <strong className="text-gray-900 dark:text-white font-mono ml-1">{stats.acc}%</strong>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Keys <strong className="text-gray-900 dark:text-white font-mono ml-1">{stats.keys}</strong>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Errors <strong className="text-gray-900 dark:text-white font-mono ml-1">{stats.errors}</strong>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Time <strong className="text-gray-900 dark:text-white font-mono ml-1">{stats.time}</strong>
            </span>
            <button
              onClick={onCopy}
              className="ml-auto flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Copy stats"
              type="button"
            >
              <FiCopy size={14} />
            </button>
          </div>
        </div>
      </Card>
    </Container>
  );
};