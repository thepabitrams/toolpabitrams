// src/tools/image/background-remove/remove/Remove.tsx

import React, { useEffect, useState } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { Button } from '@/core/components/ui/Button';
import { Select } from '@/core/components/ui/Select';
import { FiLoader, FiRefreshCw } from 'react-icons/fi';
import { useFileStore } from '@/core/store/fileStore';
import { readDimensions, readDpi } from '@/entities/image/metadata/read';
import { loadImage, blobToUrl, revokeUrl } from '@/lib/browser';
import type { FileRef } from '@/core/store/fileRef';
import { useRemove } from './useRemove';
import { StatusBadge } from './StatusBadge';
import { StatusMessage } from './StatusMessage';

interface RemoveProps {
  file: FileRef | null;
  onCutoutGenerated: (blob: Blob, metadata: { width?: number; height?: number; dpi?: number; unit?: string }) => void;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

export const Remove: React.FC<RemoveProps> = ({
  file,
  onCutoutGenerated,
  className = '',
  minWidth = 360,
  minHeight = 350,
  padding = 0,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { readFile, upload } = useFileStore();

  const {
    status,
    progress,
    errorMessage,
    selectedModelId,
    setSelectedModel,
    generateCutout,
    retry,
    reset,
    availableModels,
  } = useRemove();

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const loadImageUrl = async () => {
      if (!file) {
        setImageUrl(null);
        reset();
        return;
      }
      try {
        const fileObj = await readFile(file.storageKey);
        if (fileObj && isMounted) {
          objectUrl = blobToUrl(fileObj);
          setImageUrl(objectUrl);
        }
      } catch {
        // silent
      }
    };

    loadImageUrl();

    return () => {
      isMounted = false;
      if (objectUrl) revokeUrl(objectUrl);
    };
  }, [file, readFile, reset]);

  const handleGenerate = async () => {
    if (!file) return;
    if (status === 'loading' || status === 'processing') return;

    const actualFile = await readFile(file.storageKey);
    if (!actualFile) {
      alert('File not found');
      return;
    }

    try {
      let width = 0,
        height = 0,
        dpi = 96,
        unit = 'px';
      try {
        const dims = await readDimensions(actualFile);
        width = dims.width;
        height = dims.height;
        unit = dims.unit || 'px';
      } catch {
        const img = await loadImage(actualFile);
        width = img.naturalWidth || img.width;
        height = img.naturalHeight || img.height;
      }
      try {
        const dpiInfo = await readDpi(actualFile);
        dpi = dpiInfo.dpi || 96;
        unit = dpiInfo.unit || 'px';
      } catch {
        // fallback to 96
      }
      const metadata = { width, height, dpi, unit };

      const result = await generateCutout(actualFile);
      if (result && result.previewBlob) {
        const ext = result.previewBlob.type.split('/')[1] || 'png';
        const resultFile = new File(
          [result.previewBlob],
          `cutout.${ext}`,
          { type: result.previewBlob.type }
        );
        await upload([resultFile]);
        onCutoutGenerated(result.previewBlob, metadata);
      }
    } catch (err) {
      // error handled in hook
    }
  };

  const handleRetry = () => {
    retry();
    setTimeout(() => handleGenerate(), 100);
  };

  const isReady = status === 'ready';
  const isLoading = status === 'loading';
  const isProcessing = status === 'processing';
  const isError = status === 'error';
  const isBusy = isLoading || isProcessing;

  const getBadgeStatus = () => {
    if (isLoading || isProcessing) return isLoading ? 'loading' : 'processing';
    if (isError) return 'error';
    if (isReady) return 'ready';
    return undefined;
  };

  if (!file || !imageUrl) {
    return (
      <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
        <Card className="p-4 flex flex-col items-center justify-center min-h-[200px] border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Upload an image first</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
      <Card className="overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative w-full aspect-square min-h-[300px] sm:min-h-[400px] bg-gray-100 dark:bg-gray-800">
          <img
            src={imageUrl}
            alt="Original"
            className="w-full h-full object-contain"
            style={{ opacity: isBusy ? 0.5 : 1 }}
          />
          {getBadgeStatus() && <StatusBadge status={getBadgeStatus()} progress={progress} />}
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="px-4 py-3">
            <Select
              value={selectedModelId}
              onChange={setSelectedModel}
              options={availableModels.map(m => ({ value: m.id, label: m.name }))}
              label="Model"
              disabled={isBusy}
            />
          </div>
          <div className="min-h-[60px] border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 flex items-center">
            <StatusMessage status={status} progress={progress} errorMessage={errorMessage} />
          </div>
        </div>

        <div className="px-4 pb-4 pt-3">
          <Button
            onClick={isError ? handleRetry : handleGenerate}
            disabled={isBusy}
            variant="primary"
            className="w-full"
          >
            {isLoading || isProcessing ? (
              <>
                <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : isError ? (
              'Retry'
            ) : isReady ? (
              <>
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </>
            ) : (
              'Remove Background'
            )}
          </Button>
        </div>
      </Card>
    </Container>
  );
};