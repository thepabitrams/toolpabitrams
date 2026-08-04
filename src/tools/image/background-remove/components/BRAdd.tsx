// src/tools/image/background-remove/components/BRAdd.tsx

import React, { useState, useEffect } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { Button } from '@/core/components/ui/Button';
import { FiCheck, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { useFileStore } from '@/core/store/fileStore';
import { useBRAdd } from '../hooks/useBRAdd';
import type { FileRef } from '@/core/store/fileRef';

interface BRAddProps {
  cutoutFileRef: FileRef | null; // ✅ NEW: receives the cutout file reference
  metadata: { width?: number; height?: number; dpi?: number; unit?: string } | null;
  isProcessing: boolean;
  progress: number;
  onComplete: (blob: Blob) => void;
  onRegenerate: () => void;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

const BRAdd: React.FC<BRAddProps> = ({
  cutoutFileRef, // ✅ NEW
  metadata,
  isProcessing,
  progress,
  onComplete,
  onRegenerate,
  className = '',
  minWidth = 360,
  minHeight = 350,
  padding = 0,
}) => {
  const { save, readFile } = useFileStore();
  const {
    backgroundColor,
    setBackgroundColor,
    outputFormat,
    setOutputFormat,
    applyBackgroundWithMetadata,
  } = useBRAdd();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);

  // ─── Load cutout from the provided FileRef ──
  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const loadCutout = async () => {
      if (!cutoutFileRef) {
        setCutoutBlob(null);
        setImageUrl(null);
        setImageDimensions(null);
        return;
      }

      try {
        const fileObj = await readFile(cutoutFileRef.storageKey);
        if (!fileObj || !isMounted) return;

        setCutoutBlob(fileObj);
        objectUrl = URL.createObjectURL(fileObj);
        setImageUrl(objectUrl);

        const img = new Image();
        img.onload = () => {
          if (isMounted) {
            setImageDimensions({
              width: img.naturalWidth || img.width,
              height: img.naturalHeight || img.height,
            });
          }
        };
        img.src = objectUrl;
      } catch (error) {
        console.error('[BRAdd] Failed to load cutout:', error);
        if (isMounted) {
          setCutoutBlob(null);
          setImageUrl(null);
          setImageDimensions(null);
        }
      }
    };

    loadCutout();

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [cutoutFileRef, readFile]); // ✅ Re-run when prop changes

  // ─── Handle Complete ─────────────────────────────────────────
  const handleComplete = async () => {
    if (!cutoutBlob) {
      alert('No cutout available. Please remove background first.');
      return;
    }

    setIsExporting(true);

    try {
      const finalBlob = await applyBackgroundWithMetadata(
        cutoutBlob,
        backgroundColor,
        metadata?.dpi,
        outputFormat
      );

      let ext = 'png';
      if (outputFormat === 'jpeg') ext = 'jpg';
      else if (outputFormat === 'webp') ext = 'webp';
      else ext = 'png';

      const resultFile = new File([finalBlob], `final-with-bg.${ext}`, {
        type: finalBlob.type,
      });
      await save([resultFile]);
      onComplete(finalBlob);
    } catch (error) {
      console.error('[BRAdd] Error:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExporting(false);
    }
  };

  // ─── If no cutout, show placeholder ──────────────────────────
  if (!cutoutBlob || !imageUrl) {
    return (
      <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
        <Card className="p-4 flex flex-col items-center justify-center min-h-[200px] border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Generate a cutout first</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Click "Remove Background" above
          </p>
        </Card>
      </Container>
    );
  }

  const aspectRatio = imageDimensions ? imageDimensions.width / imageDimensions.height : 1;
  const formatOptions = [
    { value: 'png', label: 'PNG' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'webp', label: 'WebP' },
  ];

  return (
    <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
      <Card className="overflow-hidden p-0 shadow-sm border border-gray-200 dark:border-gray-700">
        {/* ─── Image Preview ────────────────────────────────── */}
        <div className="relative w-full aspect-square min-h-[300px] sm:min-h-[400px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="relative" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              className="relative"
              style={{
                aspectRatio,
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                backgroundColor,
                boxShadow: '0 0 30px rgba(0,0,0,0.05)',
              }}
            >
              <img
                src={imageUrl}
                alt="Cutout preview"
                className="block w-full h-full object-contain"
                style={{ opacity: isProcessing ? 0.5 : 1 }}
              />
              {isProcessing && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Controls ──── */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="px-4 py-3">
            <div className="flex justify-center">
              <div className="flex items-center gap-2 flex-nowrap overflow-x-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap flex-shrink-0">BG:</label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer p-0.5 bg-white dark:bg-gray-800 hover:border-blue-500 transition-colors flex-shrink-0"
                  disabled={isProcessing || isExporting}
                />
                <span className="text-xs font-mono text-gray-600 dark:text-gray-400 min-w-[50px] flex-shrink-0">
                  {backgroundColor.toUpperCase()}
                </span>
                <button
                  onClick={() => setBackgroundColor('#ffffff')}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex-shrink-0"
                  disabled={isProcessing || isExporting}
                  title="Reset to white"
                >
                  <FiRefreshCw className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap flex-shrink-0">Format:</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as 'png' | 'jpeg' | 'webp')}
                  disabled={isProcessing || isExporting}
                  className="px-2 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {formatOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {imageDimensions && (
              <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
                📐 {imageDimensions.width} × {imageDimensions.height} px
                {metadata?.dpi && ` · DPI: ${metadata.dpi}`}
              </div>
            )}
          </div>
        </div>

        {/* ─── Button ──────────────────────── */}
        <div className="px-4 pb-4 pt-3">
          <Button
            onClick={handleComplete}
            disabled={isProcessing || isExporting}
            variant="primary"
            className="w-full"
          >
            {isExporting ? (
              <>
                <FiCheck className="w-4 h-4 mr-2 animate-spin" /> Exporting...
              </>
            ) : (
              <>
                <FiDownload className="w-4 h-4 mr-2" /> Apply
              </>
            )}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default BRAdd;