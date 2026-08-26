// src/tools/image/background-remove/index.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { Tool } from '@/core/registry/toolRegistry';
import { useFileStore } from '@/core/store/fileStore';
import { FileUpload } from '@/shared/components/FileUpload';
import { FileCard } from '@/shared/components/FileCard';
import { ExportPanel } from '@/shared/components/ExportPanel';
import { Motion } from '@/core/motion/motion';
import { Stagger } from '@/core/motion/Stagger';
import { zoomIn } from '@/core/motion/presets/zoomIn';
import { Grid } from '@/core/components/ui/Grid';
import BRRemove from './components/BRRemove';
import BRAdd from './components/BRAdd';
import { useBRRemove } from './hooks/useBRRemove';
import { IMAGE_CONFIG } from '@/entities/image/services/config';

const TOOL_ID = 'background-remove';
const METADATA_STORAGE_KEY = 'br_metadata';

function BackgroundRemoveTool() {
  // ✅ REMOVED: save (unused)
  const { list, upload, clear, promote, remove, readFile } = useFileStore();
  const [isLoading, setIsLoading] = useState(false);

  const originalFiles = list('original');
  const currentFile = originalFiles.length > 0 ? originalFiles[0] : null;
  const processedFiles = list('process');
  const latestProcessed = processedFiles.length > 0 ? processedFiles[processedFiles.length - 1] : null;

  // ✅ REMOVED: generateCutout (unused)
  const { status, progress } = useBRRemove();

  const [metadataForCutout, setMetadataForCutout] = useState<{
    width?: number;
    height?: number;
    dpi?: number;
    unit?: string;
  } | null>(null);

  // ─── Restore metadata from localStorage on mount ──────────────
  useEffect(() => {
    const saved = localStorage.getItem(METADATA_STORAGE_KEY);
    if (saved) {
      try {
        setMetadataForCutout(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const isProcessing = status === 'loading' || status === 'processing';

  // ✅ Compute the latest cutout file (EXCLUDING original1)
  const cutoutCandidates = originalFiles.filter(f => f.name !== 'original1');
  const latestCutoutRef = cutoutCandidates.length > 0 ? cutoutCandidates[cutoutCandidates.length - 1] : null;
  const hasCutoutFile = !!latestCutoutRef;

  // ─── Handlers ──────────────────────────────────────────────────

  const handleCutoutGenerated = useCallback(
    async (blob: Blob, metadata: { width?: number; height?: number; dpi?: number; unit?: string }) => {
      setIsLoading(true);
      try {
        setMetadataForCutout(metadata);
        localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(metadata));
      } catch (error) {
        alert(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ✅ REMOVED: handleComplete (redundant)

  const handleUpload = useCallback(
    async (files: File[]) => {
      setIsLoading(true);
      try {
        await upload(files);
        setMetadataForCutout(null);
        localStorage.removeItem(METADATA_STORAGE_KEY);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    },
    [upload]
  );

  const handleRemove = useCallback(async () => {
    if (currentFile) await clear();
    setMetadataForCutout(null);
    localStorage.removeItem(METADATA_STORAGE_KEY);
  }, [currentFile, clear]);

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
      const targetOriginals = state.original.filter((f) => f.toolId === selectedToolId);

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
            original: prevState.original.filter((f) => f.toolId !== selectedToolId),
          }));
          await syncToDB(useFileStore.getState().original, useFileStore.getState().process);
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
          <Motion preset={zoomIn} as="div" className="col-span-1" delay={0}>
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
            <Motion preset={zoomIn} as="div" className="col-span-1" delay={100}>
              <BRRemove
                file={currentFile}
                onCutoutGenerated={handleCutoutGenerated}
                minWidth={360}
                minHeight={350}
                padding={0}
              />
            </Motion>
          )}

          {hasCutoutFile && (
            <Motion preset={zoomIn} as="div" className="col-span-1" delay={200}>
              <BRAdd
                cutoutFileRef={latestCutoutRef}
                metadata={metadataForCutout}
                isProcessing={isProcessing}
                progress={progress}
                // ✅ REMOVED: onComplete={handleComplete}
                minWidth={360}
                minHeight={350}
                padding={0}
              />
            </Motion>
          )}

          {hasProcessed && (
            <Motion preset={zoomIn} as="div" className="col-span-1" delay={300}>
              <FileCard file={latestProcessed} variant="process" minWidth={360} minHeight={350} padding={0} />
            </Motion>
          )}

          {hasProcessed && (
            <Motion preset={zoomIn} as="div" className="col-span-1" delay={400}>
              <ExportPanel
                file={latestProcessed}
                variant="single"
                initialFileName="cutout"
                onClear={clear}
                toolId={TOOL_ID}
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

const toolDef: Tool = {
  id: 'background-remove',
  name: 'Background Remover',
  description: 'Remove background from images with AI',
  category: 'image',
  input: 'single',
  component: BackgroundRemoveTool,
};

export default toolDef;