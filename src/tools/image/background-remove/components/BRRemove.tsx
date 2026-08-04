// src/tools/image/background-remove/components/BRRemove.tsx

import React, { useEffect, useState } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { Button } from '@/core/components/ui/Button';
import { useFileStore } from '@/core/store/fileStore';
import { useBRRemove } from '../hooks/useBRRemove';
import type { FileRef } from '@/core/store/fileRef';
import { FiLoader, FiRefreshCw } from 'react-icons/fi';
import { Select } from '@/core/components/ui/Select';
import { BRStatusBadge } from './BRStatusBadge';
import { BRStatusMessage } from './BRStatusMessage';
import { extractImageMetadata } from '@/entities/image/services/readMetadata';

interface BRRemoveProps {
  file: FileRef | null;
  onCutoutGenerated: (blob: Blob, metadata: { width?: number; height?: number; dpi?: number; unit?: string }) => void;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

const BRRemove: React.FC<BRRemoveProps> = ({
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
  } = useBRRemove();

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const loadImage = async () => {
      if (!file) {
        setImageUrl(null);
        reset();
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
      const metadata = await extractImageMetadata(actualFile);
      const result = await generateCutout(actualFile);
      if (result && result.previewBlob) {
        const ext = result.previewBlob.type.split('/')[1] || 'png';
        const resultFile = new File([result.previewBlob], `cutout.${ext}`, { type: result.previewBlob.type });
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

        {/* ─── Image Preview ────────────────────────────────── */}
        <div className="relative w-full aspect-square min-h-[300px] sm:min-h-[400px] bg-gray-100 dark:bg-gray-800">
          <img
            src={imageUrl}
            alt="Original"
            className="w-full h-full object-contain"
            style={{ opacity: isBusy ? 0.5 : 1 }}
          />

          {getBadgeStatus() && (
            <BRStatusBadge
              status={getBadgeStatus()}
              progress={progress}
            />
          )}
        </div>

        {/* ─── Model Selection & Status ──────────────────── */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
          
          <div className="px-4 py-3">
            <Select
              value={selectedModelId}
              onChange={setSelectedModel}
              options={availableModels.map(m => ({ id: m.id, name: m.name }))}
              label="Model"
              disabled={isBusy}
            />
          </div>

          {/* ─── Status Area (Simplified) ──────────────────── */}
          <div className="min-h-[60px] border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 flex items-center">
            <BRStatusMessage
              status={status}
              progress={progress}
              errorMessage={errorMessage}
            />
          </div>
        </div>

        {/* ─── Button Area ──────────────────── */}
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

export default BRRemove;