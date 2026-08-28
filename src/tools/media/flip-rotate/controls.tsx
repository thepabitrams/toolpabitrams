// src/tools/image/flip-rotate/controls.tsx
import React from 'react';
import { 
  FiRotateCcw, 
  FiRotateCw, 
  FiRefreshCw 
} from 'react-icons/fi';
import { TfiArrowsHorizontal, TfiArrowsVertical } from 'react-icons/tfi';
import { IconButton } from '@/core/components/ui/IconButton';
import { Container } from '@/core/components/ui/Container';

interface ControlsProps {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onToggleFlipH: () => void;
  onToggleFlipV: () => void;
  onReset: () => void;
  hasChanges: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  rotation,
  flipH,
  flipV,
  onRotateLeft,
  onRotateRight,
  onToggleFlipH,
  onToggleFlipV,
  onReset,
  hasChanges,
}) => {
  return (
    <Container className="px-4 py-4">
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <IconButton
            onClick={onRotateLeft}
            variant="standard"
            size="md"
            ariaLabel="Rotate 90° left"
          >
            <FiRotateCcw className="w-5 h-5" />
          </IconButton>

          <IconButton
            onClick={onRotateRight}
            variant="standard"
            size="md"
            ariaLabel="Rotate 90° right"
          >
            <FiRotateCw className="w-5 h-5" />
          </IconButton>

          <span className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <IconButton
            onClick={onToggleFlipH}
            variant={flipH ? 'tonal' : 'standard'}
            size="md"
            ariaLabel="Flip horizontal"
          >
            <TfiArrowsHorizontal className="w-5 h-5" />
          </IconButton>

          <IconButton
            onClick={onToggleFlipV}
            variant={flipV ? 'tonal' : 'standard'}
            size="md"
            ariaLabel="Flip vertical"
          >
            <TfiArrowsVertical className="w-5 h-5" />
          </IconButton>

          <span className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <IconButton
            onClick={onReset}
            variant="standard"
            size="md"
            ariaLabel="Reset transforms"
            disabled={!hasChanges}
          >
            <FiRefreshCw className="w-5 h-5" />
          </IconButton>
        </div>

        <div className="text-center">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Rotation: {((rotation % 360) + 360) % 360}° 
            {flipH && ' · Flipped H'} 
            {flipV && ' · Flipped V'}
          </span>
        </div>
      </div>
    </Container>
  );
};