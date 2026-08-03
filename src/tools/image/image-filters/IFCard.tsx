// src/tools/image/image-filters/IFCard.tsx
import React, { useEffect, useState } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { useFileStore } from '@/core/store/fileStore';
import { IFControls } from './IFControls';
import { useIFLogic } from './useIFLogic';
import type { FileRef } from '@/core/store/fileStore';

interface IFCardProps {
  file: FileRef | null;
  onProcess: (blob: Blob) => Promise<void>;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

export const IFCard: React.FC<IFCardProps> = ({
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
    filters,
    updateFilter,
    resetFilters,
    hasChanges,
    getCSSFilterString,
    processImage,
  } = useIFLogic();

  // ─── Load image ──────────────────────────────────────────
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

  // ─── Handle Export ───────────────────────────────────────
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

  const cssFilter = getCSSFilterString();

  if (!file || !imageUrl) {
    return (
      <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
        <Card className="p-4 flex flex-col items-center justify-center min-h-[200px]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Upload an image to apply filters</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
      <Card className="overflow-hidden p-0">
        {/* ─── Gray Container ─── */}
        <div
          className="relative w-full aspect-square min-h-[300px] sm:min-h-[400px] bg-gray-100 dark:bg-gray-800"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            src={imageUrl}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: cssFilter,
              transition: 'filter 0.1s ease',
            }}
          />
        </div>

        <IFControls
          filters={filters}
          onUpdate={updateFilter}
          onReset={resetFilters}
          hasChanges={hasChanges}
          onApply={handleApply}
          isExporting={isExporting}
        />
      </Card>
    </Container>
  );
};