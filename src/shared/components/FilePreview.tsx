// src/shared/components/FilePreview.tsx

import React, { useState, useEffect } from 'react';
import { useFileStore } from '@/core/store/fileStore';
import { Card } from '@/core/components/ui/Card';
import type { FileRef } from '@/core/store/fileStore';
import { Container } from '@/core/components/ui/Container';

interface FilePreviewProps {
  file: FileRef | null;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ 
  file, 
  className = '', 
  minWidth = 260, 
  minHeight = 200, 
  padding = 0 
}) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { read } = useFileStore();

  useEffect(() => {
    if (!file) {
      setFileUrl(null);
      return;
    }

    let isMounted = true;
    let objectUrl: string | null = null;

    const fetchBlob = async () => {
      setLoading(true);
      try {
        const blob = await read(file.name);
        if (blob && isMounted) {
          objectUrl = URL.createObjectURL(blob);
          setFileUrl(objectUrl);
        }
      } catch (error) {
        console.error('FilePreview: Failed to fetch file:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBlob();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file, read]);

  const renderPreview = () => {
    if (!file) {
      return (
        <div className={`w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`}>
          <span className="text-gray-400 dark:text-gray-500 text-sm">No file</span>
        </div>
      );
    }

    const isImage = file.type?.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (loading) {
      return (
        <div className={`w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`}>
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!fileUrl) {
      return (
        <div className={`w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`}>
          <span className="text-gray-400 dark:text-gray-500 text-sm">Loading...</span>
        </div>
      );
    }

    return (
      <div className={`w-full aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden rounded-lg ${className}`}>
        {isImage ? (
          <img src={fileUrl} alt={file.name} className="w-full h-full object-contain" />
        ) : isPdf ? (
          <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-950/20">
            <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
            </svg>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">📄</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden p-0 flex-1">
      <Container 
        className={`px-0 ${className}`}
        style={{
          minWidth: `${minWidth}px`,
          minHeight: `${minHeight}px`,
          padding: `${padding}px`,
        }}
      >
        {renderPreview()}
      </Container>
    </Card>
  );
};