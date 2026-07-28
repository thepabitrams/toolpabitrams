// src/tools/image/form-crop/index.tsx

import { useState, useEffect, useCallback } from 'react';
import { Tool } from '@/core/registry/toolRegistry';
import { useFileStore } from '@/core/store/fileStore';
import { FileUpload } from '@/shared/components/FileUpload';
import { FileCard } from '@/shared/components/FileCard';
import { Motion } from '@/core/motion/motion';
import { Stagger } from '@/core/motion/Stagger';
import { zoomIn } from '@/core/motion/presets/zoomIn';
import { FCDimensionInput } from './FCDimensionInput';
import { FCCropper } from './FCCropper';
import { ExportPanel } from '@/shared/components/ExportPanel';
import type { CategoryType } from '@/shared/components/FileUpload';
import type { Unit } from './FCDimensionInput';

import { Grid } from '@/core/components/ui/Grid';

const TOOL_ID = 'form-crop';

interface FormCropToolProps {
  category: CategoryType;
  toolId: string;
}

function FormCropTool({ category, toolId }: FormCropToolProps) {
  const { list, upload, save, clear, promote } = useFileStore();
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

  useEffect(() => {
    return () => {};
  }, [clear]);

  const handleUpload = useCallback(async (files: File[]) => {
    setIsLoading(true);
    try {
      await upload(files);
    } catch (error) {
      console.error('Upload failed:', error);
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
    } catch (error) {
      console.error('Crop save failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [save]);

  const handleAction = useCallback(async (selectedToolId: string) => {
    await promote();
    window.location.href = `/tools/${selectedToolId}`;
  }, [promote]);

  // ============================================================
  // 👇 THE CRITICAL PART: handleSizeChange receives widthPx, heightPx, AND dpi
  // ============================================================
  const handleSizeChange = (
    widthPx: number,    // 👈 DPI-converted width in pixels
    heightPx: number,   // 👈 DPI-converted height in pixels
    rawWidth: number,   // 👈 Raw user input (e.g., 2)
    rawHeight: number,  // 👈 Raw user input (e.g., 60)
    unit: Unit,         // 👈 Unit: 'px', 'mm', 'cm', 'inch'
    dpi: number         // 👈 DPI value (e.g., 96, 200)
  ) => {
    setCropData({
      rawWidth,
      rawHeight,
      unit,
      dpi,              // 👈 Store DPI
      widthPx,          // 👈 Store converted width in pixels
      heightPx,         // 👈 Store converted height in pixels
    });
  };

  // ============================================================
  // 👇 aspectRatio uses widthPx and heightPx (which already include DPI)
  // ============================================================
  const aspectRatio = cropData.widthPx / cropData.heightPx;

  const hasFile = !!currentFile;
  const hasProcessed = !!latestProcessed;

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      {/* 🚀 HEADER REMOVED - Clean layout starts here */}
      
      <Grid minCardWidth={360} gap={16}>
        <Stagger delay={100}>
          
          {/* ✅ Upload */}
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
              category={category}
              isLoading={isLoading}
              onUpload={handleUpload}
              onRemove={handleRemove}
              minWidth={360}
              minHeight={400}
              padding={0}
            />
          </Motion>

          {/* ✅ Dimension Input */}
          {hasFile && (
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={100}
              style={{ opacity: 0, transform: 'scale(0.5)' }}
            >
              <FCDimensionInput
                initialWidth={cropData.rawWidth}
                initialHeight={cropData.rawHeight}
                onSizeChange={handleSizeChange}
                minWidth={360}
                minHeight={240}
                padding={0}
              />
            </Motion>
          )}

          {/* ✅ Cropper */}
          {hasFile && (
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={200}
              style={{ opacity: 0, transform: 'scale(0.5)' }}
            >
              <FCCropper
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

          {/* ✅ File Card */}
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

          {/* ✅ Export Panel */}
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

const toolDef: Tool = {
  id: 'form-crop',
  name: 'Form Crop',
  description: 'Crop images with precision',
  category: 'image',
  input: 'single',
  component: FormCropTool,
};

export default toolDef;