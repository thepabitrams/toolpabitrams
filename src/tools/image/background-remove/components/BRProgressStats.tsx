// src/tools/image/background-remove/components/BRProgressStats.tsx

import React from 'react';
import { MdCloudDownload, MdSpeed, MdAccessTime } from 'react-icons/md';

interface BRProgressStatsProps {
  progress: number;
  speed: number;
  loaded: number;
  total: number;
  className?: string;
}

export const BRProgressStats: React.FC<BRProgressStatsProps> = ({
  progress,
  speed,
  loaded,
  total,
  className = '',
}) => {
  if (total === 0 || progress === 0) return null;

  const remainingMB = total - loaded;
  const timeRemaining = speed > 0 ? remainingMB / speed : 0;
  const timeString = timeRemaining > 0
    ? timeRemaining < 60
      ? `${Math.ceil(timeRemaining)}s`
      : `${Math.ceil(timeRemaining / 60)}m ${Math.ceil(timeRemaining % 60)}s`
    : '...';

  const speedString = speed > 0 ? speed.toFixed(1) : '0.0';

  return (
    <div className={`w-full ${className}`}>
      {/* Header - Google Chrome style */}
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
          <MdCloudDownload className="w-4 h-4 text-blue-500" />
          Downloading model
        </span>
        <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
          {Math.round(Math.min(progress, 100))}%
        </span>
      </div>

      {/* Blue progress bar - Chrome style */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Stats - Chrome style */}
      <div className="flex items-center gap-4 mt-1 text-[11px] text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <MdCloudDownload className="w-3.5 h-3.5 text-gray-400" />
          {loaded.toFixed(1)} / {total.toFixed(1)} MB
        </span>
        <span className="flex items-center gap-1">
          <MdSpeed className="w-3.5 h-3.5 text-gray-400" />
          {speedString} MB/s
        </span>
        <span className="flex items-center gap-1">
          <MdAccessTime className="w-3.5 h-3.5 text-gray-400" />
          {timeString}
        </span>
      </div>
    </div>
  );
};

export default BRProgressStats;