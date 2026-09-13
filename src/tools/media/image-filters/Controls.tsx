// src/tools/image/image-filters/Controls.tsx
import React from 'react';
import { FiRotateCcw } from 'react-icons/fi';
import {
  MdWbSunny,
  MdContrast,
  MdOpacity,
  MdBlurOn,
  MdDeviceThermostat,
  MdCenterFocusStrong,
  MdBrightnessHigh,
  MdBrightnessLow,
} from 'react-icons/md';
import { IconButton } from '@/core/components/ui/IconButton';
import { Button } from '@/core/components/ui/Button';
import { Container } from '@/core/components/ui/Container';
import { Slider } from './Slider';
import type { FilterState } from './core/types';
import { FILTER_RANGES } from './core/constants';

interface ControlsProps {
  filters: FilterState;
  onUpdate: (key: keyof FilterState, value: any) => void;
  onReset: () => void;
  hasChanges: boolean;
  onApply: () => void;
  isExporting: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
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
        <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
          Live Preview (CSS)
        </div>

        <Slider
          icon={<MdWbSunny size={16} />}
          label="Brightness"
          value={filters.brightness}
          min={FILTER_RANGES.brightness.min}
          max={FILTER_RANGES.brightness.max}
          step={1}
          suffix="%"
          onChange={(val) => onUpdate('brightness', val)}
        />

        <Slider
          icon={<MdContrast size={16} />}
          label="Contrast"
          value={filters.contrast}
          min={FILTER_RANGES.contrast.min}
          max={FILTER_RANGES.contrast.max}
          step={1}
          suffix="%"
          onChange={(val) => onUpdate('contrast', val)}
        />

        <Slider
          icon={<MdOpacity size={16} />}
          label="Saturation"
          value={filters.saturation}
          min={FILTER_RANGES.saturation.min}
          max={FILTER_RANGES.saturation.max}
          step={1}
          suffix="%"
          onChange={(val) => onUpdate('saturation', val)}
        />

        <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-3 mb-1">
          Export Only (Canvas)
        </div>

        <Slider
          icon={<MdBlurOn size={16} />}
          label="Blur"
          value={filters.blur}
          min={FILTER_RANGES.blur.min}
          max={FILTER_RANGES.blur.max}
          step={0.5}
          suffix="px"
          onChange={(val) => onUpdate('blur', val)}
        />

        <Slider
          icon={<MdDeviceThermostat size={16} />}
          label="Temperature"
          value={filters.temperature}
          min={FILTER_RANGES.temperature.min}
          max={FILTER_RANGES.temperature.max}
          step={1}
          suffix="%"
          onChange={(val) => onUpdate('temperature', val)}
        />

        <Slider
          icon={<MdCenterFocusStrong size={16} />}
          label="Sharpness"
          value={filters.sharpness}
          min={FILTER_RANGES.sharpness.min}
          max={FILTER_RANGES.sharpness.max}
          step={1}
          suffix="%"
          onChange={(val) => onUpdate('sharpness', val)}
        />

        <Slider
          icon={<MdBrightnessHigh size={16} />}
          label="Highlights"
          value={filters.highlights}
          min={FILTER_RANGES.highlights.min}
          max={FILTER_RANGES.highlights.max}
          step={1}
          suffix="%"
          onChange={(val) => onUpdate('highlights', val)}
        />

        <Slider
          icon={<MdBrightnessLow size={16} />}
          label="Shadows"
          value={filters.shadows}
          min={FILTER_RANGES.shadows.min}
          max={FILTER_RANGES.shadows.max}
          step={1}
          suffix="%"
          onChange={(val) => onUpdate('shadows', val)}
        />

        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant={filters.grayscale ? 'primary' : 'secondary'}
            className="px-3 py-1.5 text-xs"
            onClick={() => onUpdate('grayscale', !filters.grayscale)}
          >
            Grayscale
          </Button>
          <Button
            variant={filters.sepia ? 'primary' : 'secondary'}
            className="px-3 py-1.5 text-xs"
            onClick={() => onUpdate('sepia', !filters.sepia)}
          >
            Sepia
          </Button>
          <Button
            variant={filters.vintage ? 'primary' : 'secondary'}
            className="px-3 py-1.5 text-xs"
            onClick={() => onUpdate('vintage', !filters.vintage)}
          >
            Vintage
          </Button>
          <Button
            variant={filters.noir ? 'primary' : 'secondary'}
            className="px-3 py-1.5 text-xs"
            onClick={() => onUpdate('noir', !filters.noir)}
          >
            Noir
          </Button>
          <Button
            variant={filters.vignette ? 'primary' : 'secondary'}
            className="px-3 py-1.5 text-xs"
            onClick={() => onUpdate('vignette', !filters.vignette)}
          >
            Vignette
          </Button>
          <Button
            variant={filters.hdr ? 'primary' : 'secondary'}
            className="px-3 py-1.5 text-xs"
            onClick={() => onUpdate('hdr', !filters.hdr)}
          >
            HDR
          </Button>
        </div>

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