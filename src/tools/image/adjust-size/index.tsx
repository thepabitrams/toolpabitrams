// src/tools/image/adjust-size/index.tsx
import { useState, useCallback } from 'react';
import { Tool } from '@/core/registry/toolRegistry';
import { useFileStore } from '@/core/store/fileStore';
import { FileUpload } from '@/shared/components/FileUpload';
import { FileCard } from '@/shared/components/FileCard';
import { Motion } from '@/core/motion/motion';
import { Stagger } from '@/core/motion/Stagger';
import { zoomIn } from '@/core/motion/presets/zoomIn';
import { ExportPanel } from '@/shared/components/ExportPanel';
import type { CategoryType } from '@/shared/components/FileUpload';

import { Grid } from '@/core/components/ui/Grid';
import { ASCard } from './ASCard';
import { useASLogic } from './useASLogic';

const TOOL_ID = 'adjust-size';

interface AdjustSizeToolProps {
  category: CategoryType;
  toolId: string;
}

function AdjustSizeTool({ category, toolId }: AdjustSizeToolProps) {
  const { list, upload, save, clear, promote, readFile } = useFileStore();
  const [isLoading, setIsLoading] = useState(false);

  const originalFiles = list('original');
  const currentFile = originalFiles.length > 0 ? originalFiles[0] : null;

  const processedFiles = list('process');
  const latestProcessed = processedFiles.length > 0 ? processedFiles[processedFiles.length - 1] : null;

  const [minKB, setMinKB] = useState(50);
  const [maxKB, setMaxKB] = useState(200);

  const { process, isProcessing, progress } = useASLogic();

  const handleUpload = useCallback(
    async (files: File[]) => {
      console.log('📤 [handleUpload] Uploading files:', files.length);
      setIsLoading(true);
      try {
        await upload(files);
        console.log('✅ [handleUpload] Upload complete');
      } catch (error) {
        console.error('❌ Upload failed:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [upload]
  );

  const handleRemove = useCallback(async () => {
    console.log('🗑️ [handleRemove] Removing file');
    if (currentFile) {
      await clear();
      console.log('✅ [handleRemove] File removed');
    }
  }, [currentFile, clear]);

  const handleProcess = useCallback(async () => {
    console.log('🖱️ [handleProcess] Button clicked');
    console.log(`📊 Min: ${minKB}KB, Max: ${maxKB}KB`);

    if (!currentFile) {
      console.warn('⚠️ [handleProcess] No file');
      return;
    }
    if (minKB >= maxKB) {
      alert('Min must be less than Max.');
      return;
    }

    setIsLoading(true);

    try {
      const file = await readFile(currentFile.storageKey);
      if (!file) throw new Error('Failed to read file');
      console.log(`✅ [handleProcess] File loaded: ${file.name}, ${file.size} bytes`);

      console.log('⏳ [handleProcess] Calling process()...');
      const result = await process(file, minKB, maxKB);
      
      if (!result || !result.blob) {
        throw new Error('Processing failed: No blob returned');
      }
      
      console.log(`✅ [handleProcess] process() returned blob: ${result.blob.size} bytes`);
      console.log(`📊 Size: ${result.sizeKB.toFixed(1)}KB, Within range: ${result.isWithinRange}`);

      if (!result.isWithinRange && result.error) {
        console.warn('⚠️', result.error);
        alert(`⚠️ ${result.error}`);
      }

      const blobType = result.blob.type || 'image/jpeg';
      const ext = blobType.split('/')[1] || 'jpg';
      
      const resultFile = new File(
        [result.blob],
        `adjusted-${minKB}-${maxKB}KB.${ext}`,
        { type: blobType }
      );
      console.log(`⏳ [handleProcess] Saving to store`);
      await save([resultFile]);
      console.log('✅ [handleProcess] Save complete!');
      
    } catch (error) {
      console.error('❌ [handleProcess] Processing failed:', error);
      alert(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      console.log('🏁 [handleProcess] FINISHED');
      setIsLoading(false);
    }
  }, [currentFile, minKB, maxKB, process, save, readFile]);

  const handleAction = useCallback(
    async (selectedToolId: string) => {
      console.log('🔄 [handleAction] Promoting to:', selectedToolId);
      await promote();
      window.location.href = `/tools/${selectedToolId}`;
    },
    [promote]
  );

  const hasFile = !!currentFile;
  const hasProcessed = !!latestProcessed;

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <Grid minCardWidth={360} gap={16}>
        <Stagger delay={100}>
          {/* File Upload */}
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

          {/* Controls */}
          {hasFile && (
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={100}
              style={{ opacity: 0, transform: 'scale(0.5)' }}
            >
              <ASCard
                minKB={minKB}
                maxKB={maxKB}
                onMinChange={setMinKB}
                onMaxChange={setMaxKB}
                onProcess={handleProcess}
                isProcessing={isProcessing}
                hasFile={hasFile}
                minWidth={360}
                minHeight={240}
                padding={0}
              />
            </Motion>
          )}

          {/* Result */}
          {hasProcessed && (
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={200}
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

          {/* Export */}
          {hasProcessed && (
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={300}
              style={{ opacity: 0, transform: 'scale(0.5)' }}
            >
              <ExportPanel
                file={latestProcessed}
                variant="single"
                initialFileName={`adjusted-${minKB}-${maxKB}KB`}
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
  id: 'adjust-size',
  name: 'Adjust Size',
  description: 'Adjust image file size to fit within a range',
  category: 'image',
  input: 'single',
  component: AdjustSizeTool,
};

export default toolDef;