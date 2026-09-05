// src/shared/hooks/useExportPanel.ts
import { useCallback, useState } from 'react';
import { useFileStore } from '@/core/store/fileStore';
import { FileRef } from '@/core/store/fileStore';

interface useExportPanelOptions {
  file: FileRef | null;
  variant: 'single' | 'multiple';
}

interface UseExportPanelReturn {
  export: (fileName: string, format?: string) => Promise<void>;
  isDownloading: boolean;
  error: Error | null;
}

export const useExportPanel = ({ file, variant }: useExportPanelOptions): UseExportPanelReturn => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { read } = useFileStore();

  const download = useCallback(async (fileName: string, format: string = 'original') => {
    if (!file) {
      throw new Error('No file to download');
    }

    setIsDownloading(true);
    setError(null);

    try {
      const blob = await read(file.name);
      if (!blob) throw new Error('Failed to read file');

      const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png';
      const fullName = fileName ? `${fileName}.${ext}` : file.name;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fullName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Download failed');
      setError(error);
      throw error;
    } finally {
      setIsDownloading(false);
    }
  }, [file, read]);

  return { download, isDownloading, error };
};