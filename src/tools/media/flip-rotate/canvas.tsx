// src/tools/image/flip-rotate/canvas.tsx
import React, { useEffect, useState } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { Button } from '@/core/components/ui/Button';
import { useFileStore } from '@/core/store/fileStore';
import { Controls } from './controls';
import { useFlipRotate } from './useFlipRotate';
import type { FileRef } from '@/core/store/fileStore';

interface CanvasProps {
  file: FileRef | null;
  onProcess: (blob: Blob) => Promise<void>;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

export const Canvas: React.FC<CanvasProps> = ({
  file,
  onProcess,
  className = '',
  minWidth = 360,
  minHeight = 350,
  padding = 0,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { readFile } = useFileStore();

  const {
    rotation,
    flipH,
    flipV,
    rotateLeft,
    rotateRight,
    toggleFlipH,
    toggleFlipV,
    reset,
    computedTransform,   // ✅ FIXED
    hasChanges,
    processImage,
  } = useFlipRotate();

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const loadImage = async () => {
      if (!file) {
        setImageUrl(null);
        return;
      }
      try {
        const fileObj = await readFile(file.storageKey);
        if (fileObj && isMounted) {
          objectUrl = URL.createObjectURL(fileObj);
          setImageUrl(objectUrl);
        }
      } catch {
        // silent
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, readFile]);

  const handleApply = async () => {
    if (!file || isExporting) return;
    setIsExporting(true);
    try {
      const originalFile = await readFile(file.storageKey);
      if (!originalFile) throw new Error('File not found');
      const blob = await processImage(originalFile);
      await onProcess(blob);
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (!file || !imageUrl) {
    return (
      <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
        <Card className="p-4 flex flex-col items-center justify-center min-h-[200px]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Upload an image to transform</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
      <Card className="overflow-hidden p-0">
        <div
          className="relative w-full aspect-square min-h-[300px] sm:min-h-[400px] bg-gray-100 dark:bg-gray-800"
          style={{ touchAction: 'none' }}
        >
          <img
            src={imageUrl}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transform: computedTransform,   // ✅ FIXED
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease',
              willChange: 'transform',
            }}
          />
        </div>

        <Controls
          rotation={rotation}
          flipH={flipH}
          flipV={flipV}
          onRotateLeft={rotateLeft}
          onRotateRight={rotateRight}
          onToggleFlipH={toggleFlipH}
          onToggleFlipV={toggleFlipV}
          onReset={reset}
          hasChanges={hasChanges}
        />

        <div className="px-4 pb-4">
          <Button
            onClick={handleApply}
            disabled={isExporting}
            variant="primary"
            className="w-full"
          >
            Apply Transform
          </Button>
        </div>
      </Card>
    </Container>
  );
};