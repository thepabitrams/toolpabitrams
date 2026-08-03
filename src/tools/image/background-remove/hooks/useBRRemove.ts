// src/tools/image/background-remove/hooks/useBRRemove.ts

import { useState, useCallback, useRef } from 'react';
import { strategies, strategyList } from '../strategies';
import type { ModelStrategy } from '../strategies';

export interface CutoutResult {
  mask: ImageData | null;
  originalFile: File;
  previewBlob: Blob | null;
}

export function useBRRemove() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'processing' | 'ready' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>('isnet');

  const originalFileRef = useRef<File | null>(null);

  // ─── Get selected strategy ──────────────────────────────────
  const getStrategy = useCallback((): ModelStrategy => {
    const strategy = strategies[selectedModelId];
    if (!strategy) throw new Error(`Strategy ${selectedModelId} not found`);
    return strategy;
  }, [selectedModelId]);

  // ─── Generate Cutout ──────────────────────────────────────────
  const generateCutout = useCallback(
    async (file: File): Promise<CutoutResult> => {
      setStatus('loading');
      setProgress(0);
      setErrorMessage(null);
      originalFileRef.current = file;

      const strategy = getStrategy();

      try {
        const blob = await strategy.run(file, (prog: number, speed: number) => {
          setProgress(prog);
          setDownloadSpeed(speed);
          if (prog > 0 && prog < 100) {
            setStatus('processing');
          }
        });

        setStatus('ready');
        return { mask: null, originalFile: file, previewBlob: blob };
      } catch (error) {
        console.error(`❌ ${strategy.name} failed:`, error);
        setStatus('error');
        setErrorMessage(
          `${strategy.name} failed: ${error instanceof Error ? error.message : String(error)}`
        );
        throw error;
      }
    },
    [getStrategy]
  );

  // ─── Retry ──────────────────────────────────────────────────
  const retry = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
    setProgress(0);
  }, []);

  // ─── Set selected model ──────────────────────────────────────
  const setSelectedModel = useCallback((modelId: string) => {
    setSelectedModelId(modelId);
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  // ─── Reset ──────────────────────────────────────────────────
  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setDownloadSpeed(0);
    setErrorMessage(null);
    originalFileRef.current = null;
  }, []);

  return {
    status,
    progress,
    downloadSpeed,
    errorMessage,
    selectedModelId,
    setSelectedModel,
    generateCutout,
    retry,
    reset,
    availableModels: strategyList,
  };
}