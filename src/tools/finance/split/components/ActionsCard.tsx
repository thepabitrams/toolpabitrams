import React, { useState, useEffect } from 'react';
import { Card } from '@/core/components/ui/Card';
import { IconButton } from '@/core/components/ui/IconButton';
import { useSplitStore } from '../store/useSplitStore';
import { useCopySummary } from '../hooks/useCopySummary';
import { useSaveImage } from '../hooks/useSaveImage';
import { 
  MdOutlineContentCopy,
  MdOutlineImage,
  MdOutlineRestartAlt,
} from 'react-icons/md';

interface ActionsCardProps {
  transactions: { from: string; to: string; amount: number }[];
  total: number;
  perPerson: number;
  people: string[];
  onClear: () => void;
}

export function ActionsCard({
  transactions,
  total,
  perPerson,
  people,
  onClear,
}: ActionsCardProps) {
  const { currency } = useSplitStore();
  const [isCopying, setIsCopying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatus, setShowStatus] = useState(false);

  // Auto-hide status after 2 seconds
  useEffect(() => {
    if (showStatus) {
      const timer = setTimeout(() => {
        setShowStatus(false);
        setStatusMessage('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showStatus]);

  const showNotification = (message: string) => {
    setStatusMessage(message);
    setShowStatus(true);
  };

  const { copySummary } = useCopySummary({
    currency,
    total,
    perPerson,
    people,
    transactions,
    onSuccess: (msg) => {
      showNotification(msg);
      setIsCopying(false);
    },
    onError: (msg) => {
      showNotification(msg);
      setIsCopying(false);
    },
  });

  const { saveImage } = useSaveImage({
    currency,
    total,
    perPerson,
    people,
    transactions,
    onSuccess: (msg) => {
      showNotification(msg);
      setIsSaving(false);
    },
    onError: (msg) => {
      showNotification(msg);
      setIsSaving(false);
    },
  });

  const handleCopy = async () => {
    setIsCopying(true);
    await copySummary();
  };

  const handleSaveImage = async () => {
    setIsSaving(true);
    await saveImage();
  };

  const handleReset = () => {
    if (people.length === 0) {
      onClear();
      return;
    }
    if (window.confirm('Clear all people and expenses?')) {
      onClear();
      showNotification('Reset complete');
    }
  };

  const hasTransactions = transactions.length > 0;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        {/* Status on LEFT side */}
        <div className="w-32 text-left">
          {showStatus && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {statusMessage}
            </span>
          )}
        </div>

        {/* Icons in CENTER */}
        <div className="flex items-center justify-center gap-2">
          <IconButton
            onClick={handleCopy}
            variant="ghost"
            size="md"
            className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            disabled={isCopying}
            aria-label="Copy summary"
          >
            <MdOutlineContentCopy className="w-5 h-5" />
          </IconButton>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

          <IconButton
            onClick={handleSaveImage}
            variant="ghost"
            size="md"
            className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
            disabled={isSaving || !hasTransactions}
            aria-label="Save as image"
          >
            <MdOutlineImage className="w-5 h-5" />
          </IconButton>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

          <IconButton
            onClick={handleReset}
            variant="ghost"
            size="md"
            className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            aria-label="Reset all"
          >
            <MdOutlineRestartAlt className="w-5 h-5" />
          </IconButton>
        </div>

        {/* Empty spacer on RIGHT for balance */}
        <div className="w-32" />
      </div>

      {/* Status indicator (loading states) */}
      {(isCopying || isSaving) && (
        <div className="text-center mt-2 text-xs text-gray-400 dark:text-gray-500">
          {isCopying && 'Copying...'}
          {isSaving && 'Saving...'}
        </div>
      )}
    </Card>
  );
}