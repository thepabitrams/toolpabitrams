// src/tools/image/image-filters/IFControls.tsx
import React from 'react';
import { FiRotateCcw } from 'react-icons/fi';
import { IconButton } from '@/core/components/ui/IconButton';
import { Button } from '@/core/components/ui/Button';
import { Container } from '@/core/components/ui/Container';
import { IFSlider } from './components/IFSlider';
import { IFPresetButton } from './components/IFPresetButton';
import type { FilterState } from './core/types';
import { FILTER_DEFAULTS, FILTER_RANGES } from './core/constants';

interface IFControlsProps {
  filters: FilterState;
  onUpdate: (key: keyof FilterState, value: any) => void;
  onReset: () => void;
  hasChanges: boolean;
  onApply: () => void;
  isExporting: boolean;
}

export const IFControls: React.FC<IFControlsProps> = ({
  filters,
  onUpdate,
  onReset,
  hasChanges,
  onApply,
  isExporting,
}) => {
  return (
    <Container className="px-4 py-4">
      <div className="space-y-3">
        {/* ─── Live CSS Filters ────────────────────────────── */}
        <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
          Live Preview (CSS)
        </div>

        <IFSlider
          label="Brightness"
          keyName="brightness"
          value={filters.brightness}
          min={FILTER_RANGES.brightness.min}
          max={FILTER_RANGES.brightness.max}
          step={1}
          suffix="%"
          onChange={(val) => onUpdate('brightness', val)}
        />

        <IFSlider
          label="Contrast"
          keyName="contrast"
          value={filters.contrast}
          min={FILTER_RANGES.contrast.min}
          max={FILTER_RANGES.contrast.max}
          step={1}
          suffix="%"
          onChange={(val) => onUpdate('contrast', val)}
        />

        <IFSlider
          label="Saturation"
          keyName="saturation"
          value={filters.saturation}
          min={FILTER_RANGES.saturation.min}
          max={FILTER_RANGES.saturation.max}
          step={1}
          suffix="%"
          onChange={(val) => onUpdate('saturation', val)}
        />

        {/* ─── Export Only Filters ──────────────────────────── */}
        <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-3 mb-1">
          Export Only (Canvas)
        </div>

        <IFSlider
          label="Blur"
          keyName="blur"
          value={filters.blur}
          min={FILTER_RANGES.blur.min}
          max={FILTER_RANGES.blur.max}
          step={0.5}
          suffix="px"
          note="export"
          onChange={(val) => onUpdate('blur', val)}
        />

        <IFSlider
          label="Temperature"
          keyName="temperature"
          value={filters.temperature}
          min={FILTER_RANGES.temperature.min}
          max={FILTER_RANGES.temperature.max}
          step={1}
          suffix="%"
          note="export"
          onChange={(val) => onUpdate('temperature', val)}
        />

        <IFSlider
          label="Sharpness"
          keyName="sharpness"
          value={filters.sharpness}
          min={FILTER_RANGES.sharpness.min}
          max={FILTER_RANGES.sharpness.max}
          step={1}
          suffix="%"
          note="export"
          onChange={(val) => onUpdate('sharpness', val)}
        />

        <IFSlider
          label="Highlights"
          keyName="highlights"
          value={filters.highlights}
          min={FILTER_RANGES.highlights.min}
          max={FILTER_RANGES.highlights.max}
          step={1}
          suffix="%"
          note="export"
          onChange={(val) => onUpdate('highlights', val)}
        />

        <IFSlider
          label="Shadows"
          keyName="shadows"
          value={filters.shadows}
          min={FILTER_RANGES.shadows.min}
          max={FILTER_RANGES.shadows.max}
          step={1}
          suffix="%"
          note="export"
          onChange={(val) => onUpdate('shadows', val)}
        />

        {/* ─── Presets ────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-200 dark:border-gray-700">
          <IFPresetButton
            label="Grayscale"
            active={filters.grayscale}
            onClick={() => onUpdate('grayscale', !filters.grayscale)}
          />
          <IFPresetButton
            label="Sepia"
            active={filters.sepia}
            onClick={() => onUpdate('sepia', !filters.sepia)}
          />
          <IFPresetButton
            label="Vintage"
            active={filters.vintage}
            onClick={() => onUpdate('vintage', !filters.vintage)}
          />
          <IFPresetButton
            label="Noir"
            active={filters.noir}
            onClick={() => onUpdate('noir', !filters.noir)}
          />
          <IFPresetButton
            label="Vignette"
            active={filters.vignette}
            onClick={() => onUpdate('vignette', !filters.vignette)}
          />
          <IFPresetButton
            label="HDR"
            active={filters.hdr}
            onClick={() => onUpdate('hdr', !filters.hdr)}
          />
        </div>

        {/* ─── Reset + Apply ────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <IconButton
              onClick={onReset}
              variant="standard"
              size="sm"
              ariaLabel="Reset all filters"
              disabled={!hasChanges}
              className={!hasChanges ? 'text-gray-300 cursor-not-allowed' : 'hover:text-red-600'}
            >
              <FiRotateCcw className="w-4 h-4" />
            </IconButton>
            <span className="text-xs text-gray-400">Reset</span>
          </div>

          <Button
            onClick={onApply}
            disabled={false}
            variant="primary"
            className="px-6 py-1.5 text-sm"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </Container>
  );
};