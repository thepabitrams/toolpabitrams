import React, { useState, useEffect } from 'react';
import { Button } from '@/core/components/ui/Button';
import { ActionButton } from '@/shared/components/ActionButton';
import { useFileStore } from '@/core/store/fileStore';
import { Container } from '@/core/components/ui/Container';
import { Card } from '@/core/components/ui/Card';
import { Motion } from '@/core/motion/motion';
import { exportInputMotion } from '@/core/motion/compositions/exportInput';
import type { FileRef } from '@/core/store/fileStore';

interface ExportPanelProps {
  file: FileRef | null;
  variant: 'single' | 'multiple';
  initialFileName?: string;
  onClear: () => Promise<void>;
  toolId: string;
  onToolSelect: (selectedToolId: string, variant: 'single' | 'multiple') => Promise<void>;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

function getExtensionFromMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
    'application/zip': 'zip',
    'text/plain': 'txt',
    'application/json': 'json',
  };
  return mimeMap[mimeType] || '';
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  file,
  variant,
  initialFileName = 'download',
  onClear,
  toolId,
  onToolSelect,
  className = '',
  minWidth = 260,
  minHeight = 200,
  padding = 0,
}) => {
  const [fileName, setFileName] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const { read } = useFileStore();

  useEffect(() => {
    if (file) {
      const name = file.name.replace(/\.[^.]+$/, '');
      setFileName(name);
    } else {
      setFileName(initialFileName);
    }
  }, [file, initialFileName]);

  const handleDownload = async () => {
    if (!file) return;

    setIsDownloading(true);
    try {
      const blob = await read(file.name);
      if (!blob) throw new Error('Failed to read file');

      const ext = getExtensionFromMimeType(file.type) || 'png';
      const fullName = fileName ? `${fileName}.${ext}` : file.name;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fullName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      await onClear();
    } catch {
      // Silent fail - user will see nothing happened
    } finally {
      setIsDownloading(false);
    }
  };

  const fileExt = file ? getExtensionFromMimeType(file.type) : '';

  if (!file) return null;

  return (
    <Container 
      className={`px-0 flex-1 ${className}`}
      style={{
        minWidth: `${minWidth}px`,
        minHeight: `${minHeight}px`,
        padding: `${padding}px`,
      }}
    >
      <Card className="p-4 flex flex-col h-full w-full">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Download
        </h3>

        <div className="mb-3">
          <div className="relative">
            <Motion
              preset={exportInputMotion}
              as="input"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name..."
              disabled={isDownloading}
              className="w-full"
            />
            {fileExt && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 font-medium pointer-events-none">
                .{fileExt}
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200/60 dark:border-gray-700/60 my-2" />

        <div className="flex items-center justify-between gap-3 mt-auto pt-1">
          <ActionButton
            toolId={toolId}
            variant={variant}
            onToolSelect={onToolSelect}
            className="flex-1"
          />
          <Button
            onClick={handleDownload}
            variant="primary"
            disabled={!file || isDownloading}
            className="flex-1 px-5 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};