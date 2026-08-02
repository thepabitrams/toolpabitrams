// src/tools/image/add-text/ATControls.tsx
import React from 'react';
import {
  FiMinus,
  FiPlus,
  FiRotateCcw,
} from 'react-icons/fi';
import { IconButton } from '@/core/components/ui/IconButton';
import { Button } from '@/core/components/ui/Button';
import { Container } from '@/core/components/ui/Container';
import type { TextConfig } from './ATLogic';

interface ATControlsProps {
  config: TextConfig;
  onUpdateText: (content: string) => void;
  onUpdateFontSize: (size: number) => void;
  onUpdateColor: (color: string) => void;
  onUpdateBackgroundColor: (color: string) => void;
  onUpdateOpacity: (opacity: number) => void;
  onUpdateFontFamily: (font: string) => void;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onUpdatePosition: (pos: 'top' | 'bottom') => void;
  onReset: () => void;
  hasChanges: boolean;
  onApply: () => void;
  isExporting: boolean;
}

const FONTS = [
  'Arial, sans-serif',
  'Times New Roman, serif',
  'Georgia, serif',
  'Verdana, sans-serif',
  'Impact, sans-serif',
  'Courier New, monospace',
  'Helvetica, sans-serif',
  'Comic Sans MS, cursive',
];

export const ATControls: React.FC<ATControlsProps> = ({
  config,
  onUpdateText,
  onUpdateFontSize,
  onUpdateColor,
  onUpdateBackgroundColor,
  onUpdateOpacity,
  onUpdateFontFamily,
  onToggleBold,
  onToggleItalic,
  onUpdatePosition,
  onReset,
  hasChanges,
  onApply,
  isExporting,
}) => {
  return (
    <Container className="px-3 py-3">
      <div className="space-y-3">
        {/* ─── TEXT INPUT + Style Buttons ────────────────── */}
        <div className="flex items-start gap-2">
          <textarea
            value={config.content}
            onChange={(e) => onUpdateText(e.target.value)}
            placeholder="Type your text here..."
            rows={2}
            className="
              flex-1 px-3 py-2
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg
              text-sm text-gray-900 dark:text-gray-100
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500
              resize-none
              transition-all
              min-h-[48px]
            "
          />

          {/* Style Buttons */}
          <div className="flex gap-1 pt-1">
            <button
              onClick={onToggleBold}
              className={`
                px-3 py-1.5 text-sm font-bold rounded-lg transition-all
                ${config.fontWeight === 'bold'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }
              `}
            >
              B
            </button>
            <button
              onClick={onToggleItalic}
              className={`
                px-3 py-1.5 text-sm font-medium italic rounded-lg transition-all
                ${config.fontStyle === 'italic'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }
              `}
            >
              I
            </button>
          </div>
        </div>

        {/* ─── ROW 1: Size + Colors ──────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Size */}
          <div className="flex items-center gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Size
            </label>
            <IconButton
              onClick={() => onUpdateFontSize(Math.max(8, config.fontSize - 4))}
              variant="standard"
              size="xs"
              ariaLabel="Decrease size"
            >
              <FiMinus className="w-3 h-3" />
            </IconButton>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[32px] text-center">
              {config.fontSize}
            </span>
            <IconButton
              onClick={() => onUpdateFontSize(Math.min(200, config.fontSize + 4))}
              variant="standard"
              size="xs"
              ariaLabel="Increase size"
            >
              <FiPlus className="w-3 h-3" />
            </IconButton>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Text Color */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Color
            </label>
            <input
              type="color"
              value={config.color}
              onChange={(e) => onUpdateColor(e.target.value)}
              className="w-8 h-8 p-0 border-0 rounded-lg cursor-pointer bg-transparent"
            />
          </div>

          {/* BG Color */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              BG
            </label>
            <input
              type="color"
              value={config.backgroundColor === 'transparent' ? '#ffffff' : config.backgroundColor}
              onChange={(e) => onUpdateBackgroundColor(e.target.value)}
              className="w-8 h-8 p-0 border-0 rounded-lg cursor-pointer bg-transparent"
            />
            <button
              onClick={() => onUpdateBackgroundColor('transparent')}
              className={`
                px-1.5 py-0.5 text-xs font-medium rounded transition-all
                ${config.backgroundColor === 'transparent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }
              `}
            >
              Clear
            </button>
          </div>
        </div>

        {/* ─── ROW 2: Opacity + Font Family ──────────────── */}
        <div className="flex items-center gap-3">
          {/* Opacity */}
          <div className="flex items-center gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Opacity
            </label>
            <IconButton
              onClick={() => onUpdateOpacity(Math.max(0, config.opacity - 0.05))}
              variant="standard"
              size="xs"
              ariaLabel="Decrease opacity"
            >
              <FiMinus className="w-3 h-3" />
            </IconButton>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[40px] text-center">
              {Math.round(config.opacity * 100)}%
            </span>
            <IconButton
              onClick={() => onUpdateOpacity(Math.min(1, config.opacity + 0.05))}
              variant="standard"
              size="xs"
              ariaLabel="Increase opacity"
            >
              <FiPlus className="w-3 h-3" />
            </IconButton>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Font Family */}
          <div className="flex-1 flex items-center gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Font
            </label>
            <select
              value={config.fontFamily}
              onChange={(e) => onUpdateFontFamily(e.target.value)}
              className="
                flex-1 px-2 py-1.5
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-lg
                text-sm text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-500
                transition-all
              "
            >
              {FONTS.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font.split(',')[0].trim()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ─── ROW 3: Position Buttons (Top/Bottom Only) ─── */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[48px]">
            Position
          </label>
          <div className="flex gap-1 flex-1">
            {['top', 'bottom'].map((pos) => (
              <button
                key={pos}
                onClick={() => onUpdatePosition(pos as 'top' | 'bottom')}
                className={`
                  flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-all capitalize
                  ${config.position === pos
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }
                `}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Reset + Apply ────────────────────────────────── */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <IconButton
              onClick={onReset}
              variant="standard"
              size="sm"
              ariaLabel="Reset text settings"
              disabled={!hasChanges}
              className={!hasChanges ? 'text-gray-300 cursor-not-allowed' : 'hover:text-red-600'}
            >
              <FiRotateCcw className="w-4 h-4" />
            </IconButton>
            <span className="text-xs text-gray-400">Reset</span>
          </div>

          <Button
            onClick={onApply}
            disabled={isExporting || !config.content.trim()}
            variant="primary"
            className="px-6 py-1.5 text-sm"
          >
            {isExporting ? 'Processing...' : 'Apply Text'}
          </Button>
        </div>
      </div>
    </Container>
  );
};