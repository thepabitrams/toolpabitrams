// src/tools/image/background-remove/components/RefineOverlay.tsx
import React from 'react';
import type { RefinePoint } from '../types';

interface RefineOverlayProps {
  points: RefinePoint[];
  imageWidth: number;
  imageHeight: number;
  containerWidth: number;
  containerHeight: number;
}

export const RefineOverlay: React.FC<RefineOverlayProps> = ({
  points,
  imageWidth,
  imageHeight,
  containerWidth,
  containerHeight,
}) => {
  // Calculate aspect ratio and fit
  const imageAspect = imageWidth / imageHeight;
  const containerAspect = containerWidth / containerHeight;

  let displayWidth, displayHeight, offsetX, offsetY;
  if (imageAspect > containerAspect) {
    displayWidth = containerWidth;
    displayHeight = containerWidth / imageAspect;
    offsetX = 0;
    offsetY = (containerHeight - displayHeight) / 2;
  } else {
    displayHeight = containerHeight;
    displayWidth = containerHeight * imageAspect;
    offsetX = (containerWidth - displayWidth) / 2;
    offsetY = 0;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {points.map((point, index) => {
        // Map normalized coordinates (0-1) to pixel positions
        const px = offsetX + point.x * displayWidth;
        const py = offsetY + point.y * displayHeight;

        const isPositive = point.type === 'positive';

        return (
          <div
            key={index}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: px,
              top: py,
            }}
          >
            <div className="relative">
              {/* Outer glow ring */}
              <div
                className={`w-8 h-8 rounded-full border-2 animate-pulse ${
                  isPositive
                    ? 'border-green-400 bg-green-400/20'
                    : 'border-red-400 bg-red-400/20'
                }`}
              />
              {/* Inner dot */}
              <div
                className={`absolute inset-1 rounded-full ${
                  isPositive ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              {/* Label */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-white bg-black/70 px-1.5 py-0.5 rounded">
                {isPositive ? 'KEEP' : 'REMOVE'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};