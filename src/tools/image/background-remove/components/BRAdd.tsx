// src/tools/image/background-remove/components/BRAdd.tsx

import React, { useState, useEffect } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { Button } from '@/core/components/ui/Button';
import { useBRAdd } from '../hooks/useBRAdd';
import { FiDownload, FiRefreshCw, FiLoader } from 'react-icons/fi';

interface BRAddProps {
  mask: ImageData | null;
  originalFile: File | null;
  isProcessing: boolean;
  progress?: number;
  onComplete: (blob: Blob) => void;
  onRegenerate: () => void;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

const BRAdd: React.FC<BRAddProps> = ({
  mask,
  originalFile,
  isProcessing,
  progress = 0,
  onComplete,
  onRegenerate,
  className = '',
  minWidth = 360,
  minHeight = 350,
  padding = 0,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const {
    backgroundColor,
    setBackgroundColor,
    applyBackground,
    exportImage,
  } = useBRAdd();

  // ─── Render preview ──────────────────────────────────────────
  useEffect(() => {
    if (!mask || !originalFile) {
      setPreviewUrl(null);
      return;
    }

    let isMounted = true;

    const renderPreview = async () => {
      try {
        const blob = await applyBackground(originalFile, mask, backgroundColor);
        if (blob && isMounted) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          return () => URL.revokeObjectURL(url);
        }
      } catch (err) {
        console.error('Preview render failed:', err);
      }
    };

    renderPreview();
  }, [mask, originalFile, backgroundColor, applyBackground]);

  // ─── Handle Complete ────────────────────────────────────────
  const handleComplete = async () => {
    if (!mask || !originalFile) return;

    setIsExporting(true);
    try {
      const blob = await exportImage(originalFile, mask, backgroundColor);
      onComplete(blob);
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (!mask || !originalFile) {
    return (
      <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
        <Card className="p-4 flex flex-col items-center justify-center min-h-[200px] border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Generate a cutout first</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
      <Card className="overflow-hidden p-0 shadow-sm border border-gray-200 dark:border-gray-700">
        {/* ─── Preview ──────────────────────────────────────────── */}
        <div
          className="relative w-full aspect-square min-h-[300px] sm:min-h-[400px] bg-[#f8f9fa] dark:bg-gray-800"
          style={{
            backgroundColor: backgroundColor,
            backgroundImage: `
              linear-gradient(45deg, #e9ecef 25%, transparent 25%),
              linear-gradient(-45deg, #e9ecef 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #e9ecef 75%),
              linear-gradient(-45deg, transparent 75%, #e9ecef 75%)
            `,
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          }}
        >
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          )}

          {/* Simple processing overlay if needed */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                <FiLoader className="w-4 h-4 animate-spin" />
                Processing... {Math.round(progress)}%
              </div>
            </div>
          )}
        </div>

        {/* ─── Color Picker ────────────────────────────────────── */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Background:
            </span>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-600 p-0 bg-transparent"
              disabled={isProcessing}
            />
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
              {backgroundColor.toUpperCase()}
            </span>
            {['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffd700', '#ff69b4'].map(
              (color) => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                    backgroundColor === color
                      ? 'border-blue-500 ring-2 ring-blue-500/30'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={isProcessing}
                />
              )
            )}
          </div>
        </div>

        {/* ─── Actions ──────────────────────────────────────────── */}
        <div className="px-4 pb-4 pt-3 space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={onRegenerate}
              variant="secondary"
              className="flex-1"
              disabled={isProcessing || isExporting}
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
            <Button
              onClick={handleComplete}
              variant="primary"
              className="flex-1"
              disabled={isProcessing || isExporting || !previewUrl}
            >
              {isExporting ? (
                <>
                  <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <FiDownload className="w-4 h-4 mr-2" />
                  Apply &amp; Export
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </Container>
  );
};

// ✅ DEFAULT EXPORT
export default BRAdd;