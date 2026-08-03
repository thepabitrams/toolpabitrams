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

function BackgroundRemoveTool() {
  const { list, upload, save, clear, promote, remove, readFile } = useFileStore();
  const [isLoading, setIsLoading] = useState(false);

  const originalFiles = list('original');
  const currentFile = originalFiles.length > 0 ? originalFiles[0] : null;
  const processedFiles = list('process');
  const latestProcessed = processedFiles.length > 0 ? processedFiles[processedFiles.length - 1] : null;

  // ─── AI State ──────────────────────────────────────────────────
  const {
    status,
    progress,
    generateCutout,
  } = useBRRemove();

  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const [originalFileForCutout, setOriginalFileForCutout] = useState<File | null>(null);

  const isProcessing = status === 'loading' || status === 'processing';

  // ─── Handlers ──────────────────────────────────────────────────

  // When BRRemove generates the cutout
  const handleCutoutGenerated = useCallback(
    async (blob: Blob) => {
      setIsLoading(true);
      try {
        // 1. Save to process (for FileCard preview)
        const ext = blob.type.split('/')[1] || 'png';
        const resultFile = new File([blob], `cutout.${ext}`, { type: blob.type });
        await save([resultFile]);

        // 2. Store for BRAdd (background color adjustment)
        setCutoutBlob(blob);

        // 3. Get the original file for BRAdd (needed for dimensions & DPI)
        if (currentFile) {
          const fileObj = await readFile(currentFile.storageKey);
          setOriginalFileForCutout(fileObj);
        }
      } catch (error) {
        alert(`Save failed: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    },
    [save, currentFile, readFile]
  );

  // Regenerate: clear cutout data so BRAdd disappears
  const handleRegenerate = useCallback(() => {
    setCutoutBlob(null);
    setOriginalFileForCutout(null);
  }, []);

  // When BRAdd applies background color and exports
  const handleComplete = useCallback(
    async (blob: Blob) => {
      setIsLoading(true);
      try {
        const ext = blob.type.split('/')[1] || 'png';
        const resultFile = new File([blob], `final.${ext}`, { type: blob.type });
        // Save as a new process file (or replace current)
        await save([resultFile]);
        // Clear cutout data so BRAdd closes
        setCutoutBlob(null);
        setOriginalFileForCutout(null);
      } catch (error) {
        alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    },
    [save]
  );

  // ─── File Handlers ──────────────────────────────────────────

  const handleUpload = useCallback(
    async (files: File[]) => {
      setIsLoading(true);
      try {
        await upload(files);
        // Reset cutout when new file is uploaded
        setCutoutBlob(null);
        setOriginalFileForCutout(null);
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
    setCutoutBlob(null);
    setOriginalFileForCutout(null);
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
  const hasCutout = !!cutoutBlob && !!originalFileForCutout;

  async function syncToDB(original: any[], process: any[]) {
    const { saveCatalog } = await import('@/core/services/indexeddb');
    await saveCatalog({ original, process });
  }

  // ─── RENDER ──────────────────────────────────────────────────

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <Grid minCardWidth={360} gap={16}>
        <Stagger delay={100}>
          {/* ─── FileUpload ────────────────────────────────────── */}
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

          {/* ─── BRRemove ──────────────────────────────────────── */}
          {hasFile && (
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={100}
              style={{ opacity: 0, transform: 'scale(0.5)' }}
            >
              <BRRemove
                file={currentFile}
                onCutoutGenerated={handleCutoutGenerated}
                minWidth={360}
                minHeight={350}
                padding={0}
              />
            </Motion>
          )}

          {/* ─── BRAdd ─────────────────────────────────────────── */}
          {hasCutout && (
            <Motion
              preset={zoomIn}
              as="div"
              className="col-span-1"
              delay={200}
              style={{ opacity: 0, transform: 'scale(0.5)' }}
            >
              <BRAdd
                cutoutBlob={cutoutBlob}
                originalFile={originalFileForCutout}
                isProcessing={isProcessing}
                progress={progress}
                onComplete={handleComplete}
                onRegenerate={handleRegenerate}
                minWidth={360}
                minHeight={350}
                padding={0}
              />
            </Motion>
          )}

          {/* ─── FileCard (Result preview) ────────────────────── */}
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

          {/* ─── ExportPanel ───────────────────────────────────── */}
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

// ─── Tool Registry Definition ──────────────────────────────
const toolDef: Tool = {
  id: 'background-remove',
  name: 'Background Remover',
  description: 'Remove background from images with AI',
  category: 'image',
  input: 'single',
  component: BackgroundRemoveTool,
};

export default toolDef;