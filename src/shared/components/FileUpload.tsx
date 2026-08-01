// src/shared/components/FileUpload.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileCard } from './FileCard';
import { Container } from '@/core/components/ui/Container';
import { Card } from '@/core/components/ui/Card';
import type { FileRef } from '@/core/store/fileStore';

interface FileUploadProps {
  file: FileRef | null;
  variant: 'single' | 'multiple';
  accept: Record<string, string[]>; // 👈 PASS FROM TOOL
  label: string;                    // 👈 PASS FROM TOOL
  extensions?: string;              // 👈 PASS FROM TOOL (optional)
  isLoading?: boolean;
  onUpload: (files: File[]) => void;
  onRemove: () => void;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  file,
  variant,
  accept,
  label,
  extensions = '',
  isLoading = false,
  onUpload,
  onRemove,
  className = '',
  minWidth = 260,
  minHeight = 200,
  padding = 0,
}) => {
  const handleUpload = useCallback(
    (files: File[]) => {
      onUpload(files);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    accept: accept,
    maxFiles: variant === 'single' ? 1 : undefined,
    disabled: (variant === 'single' && !!file) || isLoading,
  });

  if (variant === 'single' && file) {
    return (
      <FileCard 
        file={file} 
        variant="original" 
        onRemove={onRemove} 
        className={className} 
      />
    );
  }

  return (
    <Container 
      className={`px-0 flex-1 ${className}`}
      style={{
        minWidth: `${minWidth}px`,
        minHeight: `${minHeight}px`,
        padding: `${padding}px`,
      }}
    >
      <Card className="p-1" hover={false}>
        <div
          {...getRootProps()}
          className={`
            w-full cursor-pointer rounded-xl border-2 border-dashed p-6
            bg-white dark:bg-gray-800/50
            transition-all duration-200
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/30 scale-[1.01] shadow-lg shadow-blue-500/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            <svg 
              className={`w-10 h-10 transition-colors duration-200 ${
                isDragActive ? 'text-blue-500' : 'text-gray-400'
              }`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="text-center">
              <p className={`text-sm font-medium transition-colors duration-200 ${
                isDragActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {isDragActive ? 'Drop it' : `Upload ${label}`}
              </p>
              {extensions && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{extensions}</p>
              )}
            </div>
            {isLoading && <p className="text-xs text-blue-500 animate-pulse">Processing...</p>}
          </div>
        </div>
      </Card>
    </Container>
  );
};