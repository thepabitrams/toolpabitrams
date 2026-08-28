// src/tools/image/precision-crop/Cropper.tsx
import React, { useState, useCallback, useEffect } from "react";
import ReactEasyCrop from "react-easy-crop";
import type { Area } from "react-easy-crop/types";
import { usePrecisionCrop } from "./usePrecisionCrop";
import { CropControls } from "./Controls";
import { useFileStore } from '@/core/store/fileStore';
import { Container } from '@/core/components/ui/Container';
import { Card } from '@/core/components/ui/Card';
import type { FileRef } from '@/core/store/fileStore';
import { loadImage, exportCanvas, prepareCanvas } from '@/lib/browser';
import { writeDpi } from '@/entities/image';

interface CropperProps {
  file: FileRef | null;
  aspectRatio: number;
  targetWidthPx: number;
  targetHeightPx: number;
  inputDpi?: number;
  onCrop: (blob: Blob, name: string, originalMimeType: string, actualMimeType: string) => Promise<void>;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

export const Cropper: React.FC<CropperProps> = ({
  file,
  aspectRatio,
  targetWidthPx,
  targetHeightPx,
  inputDpi = 96,
  onCrop,
  className = '',
  minWidth = 260,
  minHeight = 200,
  padding = 0,
}) => {
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { readFile } = useFileStore();

  const {
    crop,
    zoom,
    setCrop,
    setZoom,
    zoomIn,
    zoomOut,
    reset,
    isZoomMin,
    isZoomMax,
  } = usePrecisionCrop();

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const fetchImage = async () => {
      if (!file) {
        setImageUrl(null);
        return;
      }

      try {
        const fileObj = await readFile(file.storageKey);
        if (fileObj && isMounted) {
          objectUrl = URL.createObjectURL(fileObj);
          setImageUrl(objectUrl);
        }
      } catch {
        // ignore
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file, readFile]);

  const onCropAreaComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = useCallback(async () => {
    if (!file || !croppedAreaPixels || !imageUrl) return;

    try {
      const originalFile = await readFile(file.storageKey);
      if (!originalFile) throw new Error("Failed to read file");

      const image = await loadImage(originalFile);

      const originalMimeType = originalFile.type || 'image/png';
      const supportsAlpha = originalMimeType !== 'image/jpeg' && originalMimeType !== 'image/bmp';

      const canvas = document.createElement('canvas');
      canvas.width = targetWidthPx;
      canvas.height = targetHeightPx;
      const ctx = prepareCanvas(canvas, supportsAlpha);

      const { x, y, width, height } = croppedAreaPixels;
      ctx.imageSmoothingEnabled = true;
      if ('imageSmoothingQuality' in ctx) {
        ctx.imageSmoothingQuality = 'high';
      }
      ctx.drawImage(
        image,
        x, y, width, height,
        0, 0, targetWidthPx, targetHeightPx
      );

      let blob: Blob;
      const quality = (originalMimeType === 'image/jpeg' || originalMimeType === 'image/webp') ? 0.92 : undefined;

      try {
        blob = await exportCanvas(canvas, originalMimeType, quality);
      } catch {
        blob = await exportCanvas(canvas, 'image/png');
      }

      let actualMimeType = blob.type || '';

      if (!actualMimeType) {
        try {
          const tempFile = new File([blob], 'temp', { type: originalMimeType });
          actualMimeType = tempFile.type || originalMimeType;
        } catch {
          actualMimeType = originalMimeType;
        }
      }

      const finalMimeType = actualMimeType;

      const fileObj = new File([blob], file.name, { type: finalMimeType });
      const finalBlob = await writeDpi(fileObj, inputDpi);

      const extension = finalMimeType.split('/')[1] || 'jpg';
      const baseName = file.name.replace(/\.[^.]+$/, '');
      const newName = `${baseName}_cropped_${targetWidthPx}x${targetHeightPx}.${extension}`;

      await onCrop(finalBlob, newName, originalMimeType, actualMimeType);

    } catch (err) {
      console.error('Crop error:', err);
      throw new Error('Failed to crop image. Please try again.');
    }
  }, [file, croppedAreaPixels, targetWidthPx, targetHeightPx, inputDpi, onCrop, imageUrl, readFile]);

  if (!file || !imageUrl) {
    return (
      <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
        <Card className="p-4 flex flex-col items-center justify-center min-h-[200px]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Upload an image to crop</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
      <Card className="overflow-hidden p-0">
        <div
          className="relative w-full aspect-square min-h-[300px] sm:min-h-[400px] bg-gray-100 dark:bg-gray-700"
          style={{ touchAction: 'none' }}
        >
          <ReactEasyCrop
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={0}
            aspect={aspectRatio}
            minZoom={1}
            maxZoom={5}
            restrictPosition={true}
            zoomWithScroll={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropAreaComplete}
            style={{
              containerStyle: { width: "100%", height: "100%", position: "relative" },
              cropAreaStyle: {
                border: "2px solid rgba(59, 130, 246, 0.8)",
                borderRadius: "8px",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
              },
              mediaStyle: {
                transition: "transform 0.15s ease-out",
                willChange: "transform",
              },
            }}
          />
        </div>

        <CropControls
          zoom={zoom}
          isZoomMin={isZoomMin}
          isZoomMax={isZoomMax}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={reset}
          onCrop={handleCrop}
        />
      </Card>
    </Container>
  );
};