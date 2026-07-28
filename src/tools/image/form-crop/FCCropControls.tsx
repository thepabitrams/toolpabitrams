// tools/image/form-crop/FCCropControls.tsx

import React from "react";
import { FiZoomIn, FiZoomOut, FiRotateCw, FiRotateCcw, FiRefreshCw } from "react-icons/fi";
import { Button } from "@/core/components/ui/Button";
import { IconButton } from "@/core/components/ui/IconButton";
import { Container } from "@/core/components/ui/Container";

interface FCCropControlsProps {
  zoom: number;
  rotation: number;
  isZoomMin: boolean;
  isZoomMax: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onReset: () => void;
  onCrop: () => void;
}

export const FCCropControls: React.FC<FCCropControlsProps> = ({
  zoom,
  rotation,
  isZoomMin,
  isZoomMax,
  onZoomIn,
  onZoomOut,
  onRotateLeft,
  onRotateRight,
  onReset,
  onCrop,
}) => {
  return (
    <Container className="px-4 py-4">
      <div className="space-y-4">
        {/* ─── Icon Buttons ────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          
          <IconButton
            onClick={onZoomOut}
            disabled={isZoomMin}
            variant="standard"
            size="sm"
            ariaLabel="Zoom out"
            className={isZoomMin ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'hover:text-blue-600 dark:hover:text-blue-400'}
          >
            <FiZoomOut className="w-5 h-5" />
          </IconButton>

          <IconButton
            onClick={onZoomIn}
            disabled={isZoomMax}
            variant="standard"
            size="sm"
            ariaLabel="Zoom in"
            className={isZoomMax ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'hover:text-blue-600 dark:hover:text-blue-400'}
          >
            <FiZoomIn className="w-5 h-5" />
          </IconButton>

          <span className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <IconButton
            onClick={onRotateLeft}
            disabled={true}
            variant="standard"
            size="sm"
            ariaLabel="Rotate left"
            className="text-gray-300 dark:text-gray-600 cursor-not-allowed"
          >
            <FiRotateCcw className="w-5 h-5" />
          </IconButton>

          <IconButton
            onClick={onRotateRight}
            disabled={true}
            variant="standard"
            size="sm"
            ariaLabel="Rotate right"
            className="text-gray-300 dark:text-gray-600 cursor-not-allowed"
          >
            <FiRotateCw className="w-5 h-5" />
          </IconButton>

          <span className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <IconButton
            onClick={onReset}
            variant="standard"
            size="sm"
            ariaLabel="Reset crop"
            className="hover:text-red-600 dark:hover:text-red-400"
          >
            <FiRefreshCw className="w-5 h-5" />
          </IconButton>
        </div>

        {/* ─── Zoom Percentage ──────────────────────────────────── */}
        <div className="text-center">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* ─── Apply Crop Button ────────────────────────────────── */}
        <Button
          onClick={onCrop}
          variant="primary"
          className="w-full"
        >
          Apply Crop
        </Button>
      </div>
    </Container>
  );
};