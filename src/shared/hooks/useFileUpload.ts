// src/shared/hooks/useFileUpload.ts

import { useState, useCallback } from 'react';
import { useFileStore } from '@/core/store/fileStore';

function extractImageMetadata(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

export function useFileUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { upload } = useFileStore();

  const uploadSingle = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      setIsLoading(true);
      setError(null);

      try {
        await upload(files);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsLoading(false);
      }
    },
    [upload]
  );

  return {
    isLoading,
    error,
    uploadSingle,
  };
}