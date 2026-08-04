// src/tools/image/background-remove/components/BRProgressStats.tsx

import React from 'react';
import { FiDownload, FiClock } from 'react-icons/fi';

interface BRProgressStatsProps {
  progress: number;
  speed: number;
  loaded: number;
  total: number;
  status: 'idle' | 'downloading' | 'processing' | 'complete' | 'error';
  className?: string;
}

export const BRProgressStats: React.FC<BRProgressStatsProps> = ({
  progress,
  speed,
  loaded,
  total,
  status,
  className = '',
}) => {
  // ✅ ONLY show when downloading or loading the model
  // NOT during processing (handled by top-right badge + button)
  if (status !== 'downloading') {
    return null;
  }

  // If total is 0, it means no download is happening (cached load)
  if (total === 0) {
    return null;
  }

  // Calculate time remaining
  const remainingMB = total - loaded;
  const timeRemaining = speed > 0 ? remainingMB / speed : 0;
  const timeString = timeRemaining > 0
    ? timeRemaining < 60
      ? `${Math.ceil(timeRemaining)}s`
      : `${Math.ceil(timeRemaining / 60)}m`
    : '...';

  return (
    <div className={`px-4 pb-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
        <span className="font-medium">📥 Downloading model...</span>
        <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
          {Math.round(progress)}%
        </span>
      </div>

      {/* ✅ Google-style BLUE progress bar (not purple) */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
        <span className="flex items-center gap-1">
          <FiDownload className="w-3 h-3" />
          {loaded.toFixed(1)} MB / {total.toFixed(1)} MB
        </span>
        <span className="flex items-center gap-1">
          ⚡ {speed.toFixed(1)} MB/s
        </span>
        <span className="flex items-center gap-1">
          <FiClock className="w-3 h-3" />
          {timeString} remaining
        </span>
      </div>
    </div>
  );
};

export default BRProgressStats;