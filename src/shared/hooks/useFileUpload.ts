// src/shared/hooks/useFileUpload.ts
import { useState, useCallback } from 'react';
import { useFileStore } from '@/core/store/fileStore';

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