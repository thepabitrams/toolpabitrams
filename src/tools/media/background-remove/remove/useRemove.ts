// src/tools/image/background-remove/remove/useRemove.ts

import { useState, useCallback, useRef } from 'react';
import { strategies, strategyList } from '../strategies';
import type { ModelStrategy } from '../strategies';

export interface CutoutResult {
  mask: ImageData | null;
  originalFile: File;
  previewBlob: Blob | null;
}

export function useRemove() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'processing' | 'ready' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>('birefnet');

  const originalFileRef = useRef<File | null>(null);
  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getStrategy = useCallback((): ModelStrategy => {
    const strategy = strategies[selectedModelId];
    if (!strategy) throw new Error(`Strategy ${selectedModelId} not found`);
    return strategy;
  }, [selectedModelId]);

  const generateCutout = useCallback(
    async (file: File): Promise<CutoutResult> => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
        processingIntervalRef.current = null;
      }

      setStatus('loading');
      setProgress(0);
      setErrorMessage(null);
      originalFileRef.current = file;

      const strategy = getStrategy();

      try {
        const blob = await strategy.run(file, (prog: number, speed: number, loaded?: number, total?: number) => {
          if (prog === 10) {
            // still loading
          } else if (prog === 60) {
            setStatus('processing');
            setProgress(60);

            if (processingIntervalRef.current) {
              clearInterval(processingIntervalRef.current);
            }
            processingIntervalRef.current = setInterval(() => {
              setProgress(prev => {
                const next = prev + 1;
                if (next >= 99) {
                  clearInterval(processingIntervalRef.current!);
                  processingIntervalRef.current = null;
                  return 99;
                }
                return next;
              });
            }, 40);
          } else if (prog === 85) {
            setProgress(prog);
          } else if (prog === 100) {
            if (processingIntervalRef.current) {
              clearInterval(processingIntervalRef.current);
              processingIntervalRef.current = null;
            }
            setStatus('ready');
            setProgress(100);
          }
        });

        if (processingIntervalRef.current) {
          clearInterval(processingIntervalRef.current);
          processingIntervalRef.current = null;
        }
        setStatus('ready');
        setProgress(100);
        return { mask: null, originalFile: file, previewBlob: blob };
      } catch (error) {
        console.error(`❌ ${strategy.name} failed:`, error);
        if (processingIntervalRef.current) {
          clearInterval(processingIntervalRef.current);
          processingIntervalRef.current = null;
        }
        setStatus('error');
        setErrorMessage(
          `${strategy.name} failed: ${error instanceof Error ? error.message : String(error)}`
        );
        throw error;
      }
    },
    [getStrategy]
  );

  const retry = useCallback(() => {
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }
    setStatus('idle');
    setErrorMessage(null);
    setProgress(0);
  }, []);

  const setSelectedModel = useCallback((modelId: string) => {
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }
    setSelectedModelId(modelId);
    setStatus('idle');
    setErrorMessage(null);
    setProgress(0);
  }, []);

  const reset = useCallback(() => {
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }
    setStatus('idle');
    setProgress(0);
    setErrorMessage(null);
    originalFileRef.current = null;
  }, []);

  return {
    status,
    progress,
    errorMessage,
    selectedModelId,
    setSelectedModel,
    generateCutout,
    retry,
    reset,
    availableModels: strategyList,
  };
}