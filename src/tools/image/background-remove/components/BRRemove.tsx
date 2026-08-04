// src/tools/image/background-remove/components/BRRemove.tsx

import React, { useEffect, useState } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { Button } from '@/core/components/ui/Button';
import { useFileStore } from '@/core/store/fileStore';
import { useBRRemove } from '../hooks/useBRRemove';
import type { FileRef } from '@/core/store/fileRef';
import { FiLoader, FiCheck, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { BRProgressStats } from './BRProgressStats';
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
  // 🔥 FIXED: use 'upload' instead of 'save'
  const { readFile, upload } = useFileStore();

  const {
    status,
    progress,
    downloadSpeed,
    loadedMB,
    totalMB,
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
        // ✅ SAVE CUTOUT TO ORIGINAL STORE (using upload → original)
        const ext = result.previewBlob.type.split('/')[1] || 'png';
        const resultFile = new File([result.previewBlob], `cutout.${ext}`, { type: result.previewBlob.type });
        await upload([resultFile]); // 🔥 now saves as original2, original3…

        // ✅ Pass metadata to index
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
      <Card className="overflow-hidden p-0 shadow-sm border border-gray-200 dark:border-gray-700">
        {/* ─── Image Preview ────────────────────────────────── */}
        <div className="relative w-full aspect-square min-h-[300px] sm:min-h-[400px] bg-gray-100 dark:bg-gray-800">
          <img
            src={imageUrl}
            alt="Original"
            className="w-full h-full object-contain"
            style={{ opacity: isBusy ? 0.5 : 1 }}
          />

          {isBusy && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5">
              <FiLoader className="w-3 h-3 animate-spin" />
              {isLoading ? 'Loading AI...' : `${Math.round(progress)}%`}
            </div>
          )}

          {isError && (
            <div className="absolute top-3 right-3 bg-red-500/80 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5">
              <FiAlertCircle className="w-3 h-3" />
              Error
            </div>
          )}

          {isReady && (
            <div className="absolute top-3 right-3 bg-green-500/80 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5">
              <FiCheck className="w-3 h-3" />
              Ready
            </div>
          )}
        </div>

        {/* ─── Model Area ──────────────────── */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Model:</label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isBusy}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} — {model.size} ({model.license})
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                {availableModels.find((m) => m.id === selectedModelId)?.description}
              </span>
            </div>
          </div>

          {isLoading && (
            <BRProgressStats
              progress={progress}
              speed={downloadSpeed}
              loaded={loadedMB}
              total={totalMB}
              status="downloading"
            />
          )}
        </div>

        {/* ─── Button Area ──────────────────── */}
        <div className="px-4 pb-4 pt-3 space-y-2">
          <Button
            onClick={isError ? handleRetry : handleGenerate}
            disabled={isBusy}
            variant="primary"
            className="w-full"
          >
            {isLoading ? (
              <>
                <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                Loading AI...
              </>
            ) : isProcessing ? (
              <>
                <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                {progress > 0 ? `Processing ${Math.round(progress)}%` : 'Processing...'}
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

          {isError && errorMessage && (
            <div className="text-xs text-center text-red-500">
              ❌ {errorMessage}
              <br />
              <span className="text-gray-500">Select a different model from the dropdown and retry.</span>
            </div>
          )}

          {isReady && (
            <div className="text-xs text-center text-green-600 dark:text-green-400">
              ✅ Cutout ready! Adjust background color below.
            </div>
          )}
        </div>
      </Card>
    </Container>
  );
};

export default BRRemove;