// src/shared/components/FileDetails.tsx

import React, { useState, useEffect } from 'react';
import { useFileStore } from '@/core/store/fileStore';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { readDimensions, readDpi } from '@/entities/image/metadata';
import type { FileRef } from '@/core/store/fileStore';

interface FileDetailsProps {
  file: FileRef | null;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
};

export const FileDetails: React.FC<FileDetailsProps> = ({
  file: fileRef,
  className = '',
  minWidth = 260,
  minHeight = 200,
  padding = 0,
}) => {
  const [imageMetadata, setImageMetadata] = useState({
    width: '—',
    height: '—',
    dpi: '—',
    unit: 'px',
  });
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const { readFile } = useFileStore();

  useEffect(() => {
    if (!fileRef) {
      setImageMetadata({ width: '—', height: '—', dpi: '—', unit: 'px' });
      setIsLoadingMetadata(false);
      return;
    }

    let isMounted = true;

    const loadImageMetadata = async () => {
      setIsLoadingMetadata(true);
      try {
        const resolvedFile = await readFile(fileRef.storageKey);
        if (!resolvedFile || !isMounted) {
          setIsLoadingMetadata(false);
          return;
        }

        const [imageDimensions, imageResolution] = await Promise.all([
          readDimensions(resolvedFile),
          readDpi(resolvedFile),
        ]);

        if (isMounted) {
          setImageMetadata({
            width: imageDimensions.width?.toString() || '—',
            height: imageDimensions.height?.toString() || '—',
            dpi: imageResolution.dpi?.toString() || '—',
            unit: imageDimensions.unit || 'px',
          });
        }
      } catch (error) {
        console.warn('FileDetails: Error reading metadata:', error);
      } finally {
        if (isMounted) setIsLoadingMetadata(false);
      }
    };

    loadImageMetadata();

    return () => {
      isMounted = false;
    };
  }, [fileRef, readFile]);

  const renderContent = () => {
    if (!fileRef) {
      return (
        <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
          <div className={`w-full px-3 pb-3 ${className}`}>
            <p className="text-xs text-gray-400 dark:text-gray-500">No file uploaded</p>
          </div>
        </Container>
      );
    }

    const size = formatFileSize(fileRef.size);
    const formatLabel = fileRef.type?.split('/')[1]?.toUpperCase() || 'FILE';

    return (
      <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
        <div className={`w-full px-3 pb-3 ${className}`}>
          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
            {fileRef.name}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-500 dark:text-gray-400">
            <span>{size}</span>
            <span className="w-px h-2.5 bg-gray-300 dark:bg-gray-600" />
            {isLoadingMetadata ? (
              <span>Reading metadata...</span>
            ) : (
              <>
                <span>{imageMetadata.width} × {imageMetadata.height} {imageMetadata.unit}</span>
                <span className="w-px h-2.5 bg-gray-300 dark:bg-gray-600" />
                <span>{imageMetadata.dpi} DPI</span>
              </>
            )}
            <span className="w-px h-2.5 bg-gray-300 dark:bg-gray-600" />
            <span>{formatLabel}</span>
          </div>
        </div>
      </Container>
    );
  };

  return (
    <Card className="p-3 flex-1">
      {renderContent()}
    </Card>
  );
};