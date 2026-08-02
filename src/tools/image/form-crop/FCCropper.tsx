// src/tools/image/form-crop/FCCropper.tsx
import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop/types";
import { useFCCrop } from "./useFCCrop";
import { FCCropControls } from "./FCCropControls";
import { useFileStore } from '@/core/store/fileStore';
import { Container } from '@/core/components/ui/Container';
import { Card } from '@/core/components/ui/Card';
import type { FileRef } from '@/core/store/fileStore';
import { cropImage } from '@/entities/image/services/canvas';
import { resizeImage } from '@/entities/image/services/resize';
import { injectImageMetadata } from '@/entities/image/services/writeMetadata';

interface FCCropperProps {
  file: FileRef | null;
  aspectRatio: number;
  targetWidthPx: number;
  targetHeightPx: number;
  inputDpi?: number;
  onCrop: (blob: Blob, name: string) => Promise<void>;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

export const FCCropper: React.FC<FCCropperProps> = ({
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
  // 🗑️ REMOVED: const [isProcessing, setIsProcessing] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { readFile } = useFileStore();

  // 🚫 rotation is completely removed from the hook
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
  } = useFCCrop();

  // ─── Load image from OPFS using storageKey ──────────────────
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
        // silent fail – caller handles errors
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
    // 🗑️ REMOVED: setIsProcessing(true);
    try {
      const originalFile = await readFile(file.storageKey);
      if (!originalFile) throw new Error("Failed to read file");
      // ✅ rotation always 0
      const croppedBlob = await cropImage(originalFile, croppedAreaPixels, 0);
      const resizedBlob = await resizeImage(croppedBlob, targetWidthPx, targetHeightPx);
      const resizedFile = new File([resizedBlob], file.name, { type: resizedBlob.type });
      const finalBlob = await injectImageMetadata(resizedFile, inputDpi);
      const extension = finalBlob.type.split('/')[1] || 'jpg';
      const newName = file.name.replace(/\.[^.]+$/, '') + `_cropped_${targetWidthPx}x${targetHeightPx}.${extension}`;
      await onCrop(finalBlob, newName);
    } catch {
      // silent
    } finally {
      // 🗑️ REMOVED: setIsProcessing(false);
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
        {/* 🖐️ touch-action: none prevents browser pinch-zoom from interfering */}
        <div
          className="relative w-full aspect-square min-h-[300px] sm:min-h-[400px] bg-gray-100 dark:bg-gray-700"
          style={{ touchAction: 'none' }}
        >
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={0}                         // 🚫 forced 0
            aspect={aspectRatio}
            minZoom={1}
            maxZoom={5}                          // ✅ 500% zoom
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

        <FCCropControls
          zoom={zoom}
          isZoomMin={isZoomMin}
          isZoomMax={isZoomMax}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={reset}
          onCrop={handleCrop}
          // 🗑️ REMOVED: isProcessing={isProcessing}
        />
      </Card>
    </Container>
  );
};