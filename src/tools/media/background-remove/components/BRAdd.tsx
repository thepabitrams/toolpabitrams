// src/tools/image/background-remove/components/BRAdd.tsx

import React, { useState, useEffect } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { Button } from '@/core/components/ui/Button';
import { Select } from '@/core/components/ui/Select';
import { IconButton } from '@/core/components/ui/IconButton';
import { ColorPicker } from '@/core/components/ui/ColorPicker';
import { FiLoader } from 'react-icons/fi';
import { MdDelete } from 'react-icons/md';
import { useFileStore } from '@/core/store/fileStore';
import { useBRAdd } from '../hooks/useBRAdd';
import type { FileRef } from '@/core/store/fileRef';

interface BRAddProps {
  cutoutFileRef: FileRef | null;
  metadata: { width?: number; height?: number; dpi?: number; unit?: string } | null;
  isProcessing: boolean;
  progress: number;
  // ✅ REMOVED: onComplete (dead code - not passed from parent)
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

const BRAdd: React.FC<BRAddProps> = ({
  cutoutFileRef,
  metadata,
  isProcessing,
  progress,
  // ✅ REMOVED: onComplete
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
  }, [cutoutFileRef, readFile]);

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
      // ✅ REMOVED: onComplete(finalBlob) - dead code
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
      <Card className="overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">

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

        {/* ─── Controls - Google Material Style ──────────────────── */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="px-4 py-2.5">
            
            {/* Fixed container - No alignment changes */}
            <div className="flex items-center justify-center gap-2 flex-wrap min-h-[36px]">
              
              {/* BG Color Picker - Using reusable ColorPicker */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">BG</label>
                <ColorPicker
                  value={backgroundColor}
                  onChange={setBackgroundColor}
                  disabled={isProcessing || isExporting}
                  size="md"
                />
              </div>

              {/* Delete/Reset Button - Google Material delete icon */}
              <IconButton
                onClick={() => setBackgroundColor('#ffffff')}
                disabled={isProcessing || isExporting}
                ariaLabel="Reset background to white"
                size="md"
                variant="standard"
                className="flex-shrink-0"
              >
                <MdDelete className="w-5 h-5" />
              </IconButton>

              {/* Divider */}
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 flex-shrink-0" />

              {/* Format Select Group */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Format</label>
                <Select
                  value={outputFormat}
                  onChange={(val) => setOutputFormat(val as 'png' | 'jpeg' | 'webp')}
                  options={formatOptions}
                  disabled={isProcessing || isExporting}
                  className="w-28"
                />
              </div>
            </div>

            {/* Dimensions - Subtle helper text */}
            {imageDimensions && (
              <div className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-500 text-center">
                {imageDimensions.width} × {imageDimensions.height} px
                {metadata?.dpi && ` · ${metadata.dpi} DPI`}
              </div>
            )}
          </div>
        </div>

        {/* ─── Button ────────────────────────────────── */}
        <div className="px-4 pb-4 pt-3">
          <Button
            onClick={handleComplete}
            disabled={isProcessing || isExporting}
            variant="primary"
            className="w-full"
          >
            {isExporting ? (
              <>
                <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>Apply Background</>
            )}
          </Button>
        </div>

      </Card>
    </Container>
  );
};

export default BRAdd;