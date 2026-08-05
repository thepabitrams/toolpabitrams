// src/tools/image/add-text/ATControls.tsx
import React from 'react';
import {
  FiMinus,
  FiPlus,
  FiRotateCcw,
} from 'react-icons/fi';
import { Container } from '@/core/components/ui/Container';
import { Button } from '@/core/components/ui/Button';
import { IconButton } from '@/core/components/ui/IconButton';
import { Motion } from '@/core/motion/motion';
import { inputFieldMotion } from '@/core/motion/compositions/input';
import { Select } from '@/core/components/ui/Select';  // ✅ reusable Select
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
    <Container className="px-3 py-3 max-w-full overflow-hidden">
      <div className="space-y-3">
        {/* ─── TEXT INPUT + Style Buttons ────────────────── */}
        <div className="flex items-start gap-2">
          <Motion
            preset={inputFieldMotion}
            as="textarea"
            value={config.content}
            onChange={(e) => onUpdateText(e.target.value)}
            placeholder="Type your text here..."
            rows={2}
            className="
              flex-1 min-w-[80px] px-3 py-2
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg
              text-sm text-gray-900 dark:text-gray-100
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              resize-none
              min-h-[48px]
            "
          />

          {/* Style Buttons as IconButtons */}
          <div className="flex gap-1 pt-1 flex-shrink-0">
            <IconButton
              variant={config.fontWeight === 'bold' ? 'filled' : 'standard'}
              size="sm"
              onClick={onToggleBold}
              ariaLabel="Toggle bold"
              className="px-2 py-1 min-w-[32px]"
            >
              <span className="font-bold text-sm">B</span>
            </IconButton>
            <IconButton
              variant={config.fontStyle === 'italic' ? 'filled' : 'standard'}
              size="sm"
              onClick={onToggleItalic}
              ariaLabel="Toggle italic"
              className="px-2 py-1 min-w-[32px]"
            >
              <span className="italic text-sm">I</span>
            </IconButton>
          </div>
        </div>

        {/* ─── ROW 1: Size | Color | BG Clear ──────────────── */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="flex items-center gap-1 flex-shrink-0">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Size
            </label>
            <IconButton
              onClick={() => onUpdateFontSize(Math.max(8, config.fontSize - 4))}
              size="xs"
              variant="standard"
              ariaLabel="Decrease size"
            >
              <FiMinus />
            </IconButton>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[28px] text-center">
              {config.fontSize}
            </span>
            <IconButton
              onClick={() => onUpdateFontSize(Math.min(200, config.fontSize + 4))}
              size="xs"
              variant="standard"
              ariaLabel="Increase size"
            >
              <FiPlus />
            </IconButton>
          </div>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 flex-shrink-0" />

          <div className="flex items-center gap-1 flex-shrink-0">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Color
            </label>
            <input
              type="color"
              value={config.color}
              onChange={(e) => onUpdateColor(e.target.value)}
              className="w-6 h-6 p-0 border-0 rounded-lg cursor-pointer bg-transparent flex-shrink-0"
            />
          </div>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 flex-shrink-0" />

          <div className="flex items-center gap-1 flex-shrink-0">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              BG
            </label>
            <input
              type="color"
              value={config.backgroundColor === 'transparent' ? '#ffffff' : config.backgroundColor}
              onChange={(e) => onUpdateBackgroundColor(e.target.value)}
              className="w-6 h-6 p-0 border-0 rounded-lg cursor-pointer bg-transparent flex-shrink-0"
            />
            <IconButton
              variant={config.backgroundColor === 'transparent' ? 'standard' : 'filled'}
              size="sm"
              onClick={() => onUpdateBackgroundColor('transparent')}
              ariaLabel="Clear background"
              className="px-1.5 py-0.5 text-xs font-medium rounded whitespace-nowrap"
            >
              <span>Clear</span>
            </IconButton>
          </div>
        </div>

        {/* ─── ROW 2: Opacity | Font Family ──────────────────── */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="flex items-center gap-1 flex-shrink-0">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Opacity
            </label>
            <IconButton
              onClick={() => onUpdateOpacity(Math.max(0, config.opacity - 0.05))}
              size="xs"
              variant="standard"
              ariaLabel="Decrease opacity"
            >
              <FiMinus />
            </IconButton>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[36px] text-center">
              {Math.round(config.opacity * 100)}%
            </span>
            <IconButton
              onClick={() => onUpdateOpacity(Math.min(1, config.opacity + 0.05))}
              size="xs"
              variant="standard"
              ariaLabel="Increase opacity"
            >
              <FiPlus />
            </IconButton>
          </div>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 flex-shrink-0" />

          {/* Font Family Group – now using reusable Select */}
          <div className="flex items-center gap-1.5 flex-1 min-w-[100px] max-w-[180px]">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Font
            </label>
            <Select
              options={FONTS.map((font) => ({
                value: font,
                label: font.split(',')[0].trim(),
              }))}
              value={config.fontFamily}
              onChange={onUpdateFontFamily}
              className="flex-1 min-w-[60px]"
            />
          </div>
        </div>

        {/* ─── ROW 3: Position (Top/Bottom) ───────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Position
          </label>
          <div className="flex gap-1 flex-1 min-w-[100px]">
            {['top', 'bottom'].map((pos) => (
              <Button
                key={pos}
                variant={config.position === pos ? 'primary' : 'secondary'}
                onClick={() => onUpdatePosition(pos as 'top' | 'bottom')}
                className="flex-1 px-2 py-1.5 text-xs font-medium rounded-lg capitalize"
              >
                {pos}
              </Button>
            ))}
          </div>
        </div>

        {/* ─── ROW 4: Reset + Apply ───────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1">
            <IconButton
              onClick={onReset}
              disabled={!hasChanges}
              variant="standard"
              size="sm"
              ariaLabel="Reset text settings"
            >
              <FiRotateCcw />
            </IconButton>
            <span className="text-xs text-gray-400">Reset</span>
          </div>

          <Button
            variant="primary"
            onClick={onApply}
            disabled={isExporting || !config.content.trim()}
            className="px-6 py-1.5 text-sm"
          >
            Apply Text
          </Button>
        </div>
      </div>
    </Container>
  );
};