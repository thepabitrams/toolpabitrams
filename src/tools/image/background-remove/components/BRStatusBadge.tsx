// src/tools/image/background-remove/components/BRStatusBadge.tsx

import React from 'react';
import { FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';

type BadgeStatus = 'loading' | 'processing' | 'ready' | 'error';

interface BRStatusBadgeProps {
  status: BadgeStatus;
  progress?: number;
  className?: string;
}

export const BRStatusBadge: React.FC<BRStatusBadgeProps> = ({
  status,
  progress = 0,
  className = '',
}) => {
  // ✅ AWS/Google style: Dark badge with light text (always readable)
  // In light mode: black/80 background, white text
  // In dark mode: white/20 background, white text (slightly transparent)
  const baseClasses = "absolute top-3 right-3 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm transition-all duration-200";

  if (status === 'loading' || status === 'processing') {
    return (
      <div className={`${baseClasses} bg-black/80 dark:bg-white/20 text-white shadow-sm border border-white/10 dark:border-white/20 ${className}`}>
        <FiLoader className="w-3 h-3 animate-spin" />
        {status === 'loading' ? 'Loading' : `${Math.round(progress)}%`}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={`${baseClasses} bg-red-500/90 backdrop-blur-sm text-white shadow-sm ${className}`}>
        <FiAlertCircle className="w-3 h-3" />
        Error
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div className={`${baseClasses} bg-green-500/90 backdrop-blur-sm text-white shadow-sm ${className}`}>
        <FiCheck className="w-3 h-3" />
        Ready
      </div>
    );
  }

  return null;
};

export default BRStatusBadge;