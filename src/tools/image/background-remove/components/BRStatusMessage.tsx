// src/tools/image/background-remove/components/BRStatusMessage.tsx

import React from 'react';
import { FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface BRStatusMessageProps {
  status: 'idle' | 'loading' | 'processing' | 'ready' | 'error';
  progress: number;
  isDownloading: boolean;
  errorMessage?: string | null;
  className?: string;
}

export const BRStatusMessage: React.FC<BRStatusMessageProps> = ({
  status,
  progress,
  isDownloading,
  errorMessage,
  className = '',
}) => {
  // Idle
  if (status === 'idle') {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 ${className}`}>
        <span>Ready to remove background</span>
      </div>
    );
  }

  // Loading from cache (no download)
  if (status === 'loading' && !isDownloading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
        <FiLoader className="w-4 h-4 animate-spin text-blue-500" />
        Loading AI model...
      </div>
    );
  }

  // Processing
  if (status === 'processing') {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 w-full ${className}`}>
        <FiLoader className="w-4 h-4 animate-spin text-blue-500" />
        <span>AI processing image</span>
        <span className="font-mono text-blue-600 dark:text-blue-400 text-xs ml-auto">
          {Math.round(progress)}%
        </span>
      </div>
    );
  }

  // Error
  if (status === 'error') {
    return (
      <div className={`flex items-center gap-2 text-sm text-red-500 dark:text-red-400 ${className}`}>
        <FiAlertCircle className="w-4 h-4" />
        {errorMessage || 'Something went wrong'}
      </div>
    );
  }

  // Ready
  if (status === 'ready') {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-600 dark:text-green-400 ${className}`}>
        <FiCheck className="w-4 h-4" />
        Background removed successfully
      </div>
    );
  }

  return null;
};

export default BRStatusMessage;