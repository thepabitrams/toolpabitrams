// src/tools/image/precision-crop/PrecisionCrop.tsx
import { useState, useEffect, useCallback } from 'react';
import { useFileStore } from '@/core/store/fileStore';
import { FileUpload } from '@/shared/components/FileUpload';
import { FileCard } from '@/shared/components/FileCard';
import { Motion } from '@/core/motion/motion';
import { Stagger } from '@/core/motion/core/Stagger';
import { zoomIn } from '@/core/motion/presets/zoomIn';
import { DimensionInput } from './DimensionInput';
import { Cropper } from './Cropper';
import { ExportPanel } from '@/shared/components/ExportPanel';
import type { Unit } from './DimensionInput';
import { Grid } from '@/core/components/ui/Grid';
import { IMAGE_CONFIG } from '@/entities/image';

interface PrecisionCropProps {
  category: string;
  toolId: string;
}

export function PrecisionCrop({ toolId }: PrecisionCropProps) {
  const { list, upload, save, clear, promote, remove } = useFileStore();
  const [isLoading, setIsLoading] = useState(false);

  const originalFiles = list('original');
  const currentFile = originalFiles.length > 0 ? originalFiles[0] : null;

  const processedFiles = list('process');
  const latestProcessed = processedFiles.length > 0 ? processedFiles[processedFiles.length - 1] : null;

  const [cropData, setCropData] = useState({
    rawWidth: 1,
    rawHeight: 1,
    unit: 'px' as Unit,
    dpi: 96,
    widthPx: 1,
    heightPx: 1,
  });

  const handleUpload = useCallback(async (files: File[]) => {
    setIsLoading(true);
    try {
      await upload(files);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [upload]);

  const handleRemove = useCallback(async () => {
    if (currentFile) {
      await clear();
    }
  }, [currentFile, clear]);

  const handleCrop = useCallback(async (croppedBlob: Blob, name: string) => {
    setIsLoading(true);
    try {
      const file = new File([croppedBlob], name, { type: croppedBlob.type });
      await save([file]);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [save]);

  const handleAction = useCallback(
    async (selectedToolId: string, variant: 'single' | 'multiple') => {
      if (!selectedToolId) {
        alert('Error: No tool selected.');
        return;
      }

      const processedFiles = list('process');
      if (processedFiles.length === 0) {
        alert('No processed files to promote');
        return;
      }

      const latestName = processedFiles[processedFiles.length - 1]?.name;

      const state = useFileStore.getState();
      const targetOriginals = state.original.filter(f => f.toolId === selectedToolId);

      if (targetOriginals.length > 0) {
        const userChoice = window.confirm(
          `The target tool already has ${targetOriginals.length} file(s).\n\n` +
          `• Click "OK" → REPLACE (delete old files, use new ones)\n` +
          `• Click "CANCEL" → Stay in current tool`
        );

        if (userChoice) {
          for (const ref of targetOriginals) {
            await remove(ref.storageKey);
          }
          useFileStore.setState((prevState) => ({
            original: prevState.original.filter(f => f.toolId !== selectedToolId),
          }));
          await syncToDB(
            useFileStore.getState().original,
            useFileStore.getState().process
          );
        } else {
          return;
        }
      }

      if (variant === 'single' && latestName) {
        await promote(latestName, selectedToolId);
      } else {
        await promote(undefined, selectedToolId);
      }

      window.location.href = `/${selectedToolId}`;
    },
    [list, promote, remove]
  );

  const handleSizeChange = (
    widthPx: number,
    heightPx: number,
    rawWidth: number,
    rawHeight: number,
    unit: Unit,
    dpi: number
  ) => {
    setCropData({
      rawWidth,
      rawHeight,
      unit,
      dpi,
      widthPx,
      heightPx,
    });
  };

  const aspectRatio = cropData.widthPx / cropData.heightPx;

  const hasFile = !!currentFile;
  const hasProcessed = !!latestProcessed;

  async function syncToDB(original: any[], process: any[]) {
    const { saveCatalog } = await import('@/core/services/indexeddb');
    await saveCatalog({ original, process });
  }

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <Grid minCardWidth={360} gap={16}>
        <Stagger delay={100}>
          <Motion
            preset={zoomIn}
            as="div"
            className="col-span-1"
            delay={0}
            style={{ opacity: 0, transform: 'scale(0.5)' }}
          >
            <FileUpload
              file={currentFile}
              variant="single"
              accept={IMAGE_CONFIG.accept}
              label={IMAGE_CONFIG.label}
              extensions={IMAGE_CONFIG.extensions}
              isLoading={isLoading}
              onUpload={handleUpload}
              onRemove={handleRemove}
              minWidth={360}
              minHeight={400}
              padding={0}
            />
          </Motion>

          {hasFile && (
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={100}
              style={{ opacity: 0, transform: 'scale(0.5)' }}
            >
              <DimensionInput
                initialWidth={cropData.rawWidth}
                initialHeight={cropData.rawHeight}
                onSizeChange={handleSizeChange}
                minWidth={360}
                minHeight={240}
                padding={0}
              />
            </Motion>
          )}

          {hasFile && (
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={200}
              style={{ opacity: 0, transform: 'scale(0.5)' }}
            >
              <Cropper
                file={currentFile}
                aspectRatio={aspectRatio}
                targetWidthPx={cropData.widthPx}
                targetHeightPx={cropData.heightPx}
                inputDpi={cropData.dpi}
                onCrop={handleCrop}
                minWidth={360}
                minHeight={500}
                padding={0}
              />
            </Motion>
          )}

          {hasProcessed && (
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={300}
              style={{ opacity: 0, transform: 'scale(0.5)' }}
            >
              <FileCard
                file={latestProcessed}
                variant="process"
                minWidth={360}
                minHeight={350}
                padding={0}
              />
            </Motion>
          )}

          {hasProcessed && (
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={400}
              style={{ opacity: 0, transform: 'scale(0.5)' }}
            >
              <ExportPanel
                file={latestProcessed}
                variant="single"
                initialFileName={`${cropData.rawWidth}x${cropData.rawHeight}`}
                onClear={clear}
                toolId={toolId}
                onToolSelect={handleAction}
                minWidth={360}
                minHeight={200}
                padding={0}
              />
            </Motion>
          )}
        </Stagger>
      </Grid>
    </div>
  );
}