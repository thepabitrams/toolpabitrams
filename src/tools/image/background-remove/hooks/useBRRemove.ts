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
  const [loadedMB, setLoadedMB] = useState(0);
  const [totalMB, setTotalMB] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>('isnet');

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
      setDownloadSpeed(0);
      setLoadedMB(0);
      setTotalMB(0);
      setIsDownloading(false);
      setErrorMessage(null);
      originalFileRef.current = file;

      const strategy = getStrategy();

      try {
        const blob = await strategy.run(file, (prog: number, speed: number, loaded?: number, total?: number) => {
          setDownloadSpeed(speed);
          
          const hasDownloadInfo = (loaded !== undefined && total !== undefined && total > 0);
          
          if (hasDownloadInfo) {
            setLoadedMB(loaded);
            setTotalMB(total);
            setIsDownloading(true);
            setProgress(prog);
            if (status !== 'loading') setStatus('loading');
          } else {
            if (prog === 10) {
              if (!isDownloading) setProgress(10);
            } 
            else if (prog === 60) {
              setIsDownloading(false);
              setStatus('processing');
              setProgress(60);

              // ✅ Smooth AI counter: 61, 62, 63 ... 99
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
            } 
            else if (prog === 85) {
              setProgress(prog);
            } 
            else if (prog === 100) {
              if (processingIntervalRef.current) {
                clearInterval(processingIntervalRef.current);
                processingIntervalRef.current = null;
              }
              setIsDownloading(false);
              setStatus('ready');
              setProgress(100);
            }
          }
        });

        if (processingIntervalRef.current) {
          clearInterval(processingIntervalRef.current);
          processingIntervalRef.current = null;
        }
        setIsDownloading(false);
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
        setIsDownloading(false);
        setErrorMessage(
          `${strategy.name} failed: ${error instanceof Error ? error.message : String(error)}`
        );
        throw error;
      }
    },
    [getStrategy, status, isDownloading]
  );

  const retry = useCallback(() => {
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }
    setStatus('idle');
    setErrorMessage(null);
    setProgress(0);
    setDownloadSpeed(0);
    setLoadedMB(0);
    setTotalMB(0);
    setIsDownloading(false);
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
    setDownloadSpeed(0);
    setLoadedMB(0);
    setTotalMB(0);
    setIsDownloading(false);
  }, []);

  const reset = useCallback(() => {
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }
    setStatus('idle');
    setProgress(0);
    setDownloadSpeed(0);
    setLoadedMB(0);
    setTotalMB(0);
    setIsDownloading(false);
    setErrorMessage(null);
    originalFileRef.current = null;
  }, []);

  // 🔥🔥🔥 DEBUG: DELETE AFTER TESTING 🔥🔥🔥
  const simulateDownload = useCallback(() => {
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }
    console.log('🧪 DEBUG: Simulating download...');
    setStatus('loading');
    setIsDownloading(true);
    setTotalMB(80);
    setLoadedMB(0);
    setProgress(0);
    setDownloadSpeed(0);
    setErrorMessage(null);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2;
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsDownloading(false);
        setStatus('processing');
        setProgress(60);

        if (processingIntervalRef.current) clearInterval(processingIntervalRef.current);
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

        setTimeout(() => {
          if (processingIntervalRef.current) {
            clearInterval(processingIntervalRef.current);
            processingIntervalRef.current = null;
          }
          setStatus('ready');
          setProgress(100);
          console.log('✅ DEBUG: Complete!');
        }, 3000);
        return;
      }

      setProgress(currentProgress);
      setLoadedMB((currentProgress / 100) * 80);
      setDownloadSpeed(2.5 + (Math.random() * 4));
    }, 150);
  }, []);
  // 🔥🔥🔥 DEBUG: END 🔥🔥🔥

  return {
    status,
    progress,
    downloadSpeed,
    loadedMB,
    totalMB,
    isDownloading,
    errorMessage,
    selectedModelId,
    setSelectedModel,
    generateCutout,
    retry,
    reset,
    simulateDownload,
    availableModels: strategyList,
  };
}