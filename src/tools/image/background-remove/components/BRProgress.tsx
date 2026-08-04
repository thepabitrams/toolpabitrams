// src/tools/image/background-remove/components/BRProgress.tsx

import React from 'react';
import { FiDownload, FiClock } from 'react-icons/fi';

interface BRProgressProps {
  progress: number; // 0-100
  speed: number; // MB/s
  loaded: number; // MB downloaded
  total: number; // MB total
  status: 'idle' | 'downloading' | 'processing' | 'complete' | 'error';
  className?: string;
}

export const BRProgress: React.FC<BRProgressProps> = ({
  progress,
  speed,
  loaded,
  total,
  status,
  className = '',
}) => {
  // Show only if downloading or processing
  if (status === 'idle' || status === 'complete' || status === 'error') {
    return null;
  }

  const isDownloading = status === 'downloading';
  const isProcessing = status === 'processing';

  // Calculate time remaining (if speed > 0)
  const remainingMB = total - loaded;
  const timeRemaining = speed > 0 ? remainingMB / speed : 0;
  const timeString = timeRemaining > 0
    ? timeRemaining < 60
      ? `${Math.ceil(timeRemaining)} seconds`
      : `${Math.ceil(timeRemaining / 60)} minutes`
    : 'Calculating...';

  return (
    <div className={`w-full bg-gray-50 dark:bg-gray-800/50 rounded-b-lg px-4 py-3 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1.5">
        <span className="font-medium">
          {isDownloading ? '📥 Downloading model...' : '🧠 Processing image...'}
        </span>
        <span className="font-mono">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
        {isDownloading && total > 0 && (
          <>
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
          </>
        )}
        {isProcessing && (
          <span className="text-blue-500 dark:text-blue-400">
            ✨ Applying AI model...
          </span>
        )}
      </div>
    </div>
  );
};

export default BRProgress;