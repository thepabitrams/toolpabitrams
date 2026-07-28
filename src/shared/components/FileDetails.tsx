// src/shared/components/FileDetails.tsx

import React, { useState, useEffect } from 'react';
import { useFileStore } from '@/core/store/fileStore';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { extractImageMetadata } from '@/entities/image/services/readMetadata'; // 👈 KITCHEN SERVICE
import type { FileRef } from '@/core/store/fileStore';

interface FileDetailsProps {
  file: FileRef | null;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

export const FileDetails: React.FC<FileDetailsProps> = ({ 
  file, 
  className = '', 
  minWidth = 260, 
  minHeight = 200, 
  padding = 0 
}) => {
  const [metadata, setMetadata] = useState({
    width: '—',
    height: '—',
    dpi: '—',
    unit: 'px',
  });
  const [loading, setLoading] = useState(false);
  const { readFile } = useFileStore(); // 👈 USE readFile (native File)

  useEffect(() => {
    if (!file) {
      setMetadata({ width: '—', height: '—', dpi: '—', unit: 'px' });
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchMetadata = async () => {
      setLoading(true);
      try {
        // 1️⃣ Get the native File directly from OPFS
        const fileObj = await readFile(file.storageKey);
        if (!fileObj || !isMounted) {
          setLoading(false);
          return;
        }

        // 2️⃣ Use the kitchen service to extract metadata
        const meta = await extractImageMetadata(fileObj);
        
        if (isMounted) {
          setMetadata({
            width: meta.width?.toString() || '—',
            height: meta.height?.toString() || '—',
            dpi: meta.dpi?.toString() || '—',
            unit: meta.unit || 'px',
          });
        }
      } catch (error) {
        console.warn('FileDetails: Error reading metadata:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMetadata();

    return () => {
      isMounted = false;
    };
  }, [file, readFile]);

  // ─── The Details Content (100% UNCHANGED) ──────────────────
  const renderDetails = () => {
    if (!file) {
      return (
        <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
          <div className={`w-full px-3 pb-3 ${className}`}>
            <p className="text-xs text-gray-400 dark:text-gray-500">No file uploaded</p>
          </div>
        </Container>
      );
    }

    const size = (file.size / 1024).toFixed(1);
    const fileType = file.type?.split('/')[1]?.toUpperCase() || 'FILE';

    return (
      <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
        <div className={`w-full px-3 pb-3 ${className}`}>
          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
            {file.name}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-500 dark:text-gray-400">
            <span>{size} KB</span>
            <span className="w-px h-2.5 bg-gray-300 dark:bg-gray-600" />
            {loading ? (
              <span>Reading metadata...</span>
            ) : (
              <>
                <span>{metadata.width} × {metadata.height} {metadata.unit}</span>
                <span className="w-px h-2.5 bg-gray-300 dark:bg-gray-600" />
                <span>{metadata.dpi} DPI</span>
              </>
            )}
            <span className="w-px h-2.5 bg-gray-300 dark:bg-gray-600" />
            <span>{fileType}</span>
          </div>
        </div>
      </Container>
    );
  };

  return (
    <Card className="p-3 flex-1">
      {renderDetails()}
    </Card>
  );
};