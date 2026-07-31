// src/tools/image/adjust-size/ASCard.tsx
import React, { useRef } from 'react';
import { Container } from '@/core/components/ui/Container';
import { Card } from '@/core/components/ui/Card';
import { Button } from '@/core/components/ui/Button';

interface ASCardProps {
  minKB: number;
  maxKB: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  onProcess: () => void;
  isProcessing: boolean;
  hasFile: boolean;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

export const ASCard: React.FC<ASCardProps> = ({
  minKB,
  maxKB,
  onMinChange,
  onMaxChange,
  onProcess,
  isProcessing,
  hasFile,
  className = '',
  minWidth = 360,
  minHeight = 240,
  padding = 0,
}) => {
  const minInputRef = useRef<HTMLInputElement>(null);
  const maxInputRef = useRef<HTMLInputElement>(null);

  // ─── Auto-select on focus ──────────────────────────────────
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
      <Card className="p-6 space-y-5">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Adjust File Size
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Min Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Min Size
            </label>
            <div className="relative">
              <input
                ref={minInputRef}
                type="number"
                min={1}
                value={minKB}
                onChange={(e) => onMinChange(Number(e.target.value))}
                onFocus={handleFocus}
                className="
                  w-full 
                  px-3 py-2.5 
                  text-gray-900 dark:text-white 
                  bg-white dark:bg-gray-800 
                  border border-gray-300 dark:border-gray-600 
                  rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-shadow duration-200
                  text-sm
                  [appearance:textfield]
                  [&::-webkit-outer-spin-button]:appearance-none
                  [&::-webkit-inner-spin-button]:appearance-none
                "
                placeholder="Min KB"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500 pointer-events-none">
                KB
              </span>
            </div>
          </div>

          {/* Max Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Max Size
            </label>
            <div className="relative">
              <input
                ref={maxInputRef}
                type="number"
                min={1}
                value={maxKB}
                onChange={(e) => onMaxChange(Number(e.target.value))}
                onFocus={handleFocus}
                className="
                  w-full 
                  px-3 py-2.5 
                  text-gray-900 dark:text-white 
                  bg-white dark:bg-gray-800 
                  border border-gray-300 dark:border-gray-600 
                  rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-shadow duration-200
                  text-sm
                  [appearance:textfield]
                  [&::-webkit-outer-spin-button]:appearance-none
                  [&::-webkit-inner-spin-button]:appearance-none
                "
                placeholder="Max KB"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500 pointer-events-none">
                KB
              </span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {minKB >= maxKB && minKB > 0 && maxKB > 0 && (
          <p className="text-sm text-red-500 dark:text-red-400 -mt-2">
            Min must be less than Max
          </p>
        )}

        {/* Process Button - Google Blue */}
        <Button
          onClick={onProcess}
          disabled={!hasFile || isProcessing || minKB >= maxKB}
          variant="primary"
          className="
            w-full 
            py-2.5 
            text-sm 
            font-medium 
            text-white 
            bg-blue-600 hover:bg-blue-700 
            disabled:bg-blue-300 dark:disabled:bg-blue-800 
            disabled:cursor-not-allowed
            rounded-lg 
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          "
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Adjust File Size'
          )}
        </Button>
      </Card>
    </Container>
  );
};