import { useState, useCallback } from 'react';
import { Motion } from '@/core/motion/motion';
import { zoomIn } from '@/core/motion/presets/zoomIn';
import { Grid } from '@/core/components/ui/Grid';
import { Stagger } from '@/core/motion/Stagger';
import { useFileStore } from '@/core/store/fileStore';
import { FileCard } from '@/shared/components/FileCard';
import { ExportPanel } from '@/shared/components/ExportPanel';
import Preview from './Preview';
import Controls from './Controls';
import { useGenerator } from './useGenerator';

const TOOL_ID = 'wallpaper';

interface WallpaperProps {
  category: string;
  toolId: string;
}

export default function Wallpaper({ category, toolId }: WallpaperProps) {
  const { list, save, clear, promote, remove } = useFileStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [color, setColor] = useState('#3B82F6');
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [fileType, setFileType] = useState<'png' | 'jpeg' | 'webp'>('png');

  const processedFiles = list('process');
  const latestProcessed = processedFiles.length > 0 ? processedFiles[processedFiles.length - 1] : null;
  const { generateWallpaper } = useGenerator();
  const hasProcessed = !!latestProcessed;

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const blob = await generateWallpaper(color, width, height, fileType);
      const ext = fileType === 'jpeg' ? 'jpg' : fileType;
      const fileName = `wallpaper_${width}x${height}.${ext}`;
      const file = new File([blob], fileName, { type: blob.type });
      await save([file]);
    } catch (error) {
      alert('Failed to generate wallpaper: ' + String(error));
    } finally {
      setIsGenerating(false);
    }
  }, [color, width, height, fileType, generateWallpaper, save]);

  const handleClear = useCallback(async () => {
    await clear();
  }, [clear]);

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
          const { saveCatalog } = await import('@/core/services/indexeddb');
          await saveCatalog({
            original: useFileStore.getState().original,
            process: useFileStore.getState().process,
          });
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
            <Preview
              color={color}
              width={width}
              height={height}
              minWidth={360}
              minHeight={420}
              padding={0}
            />
          </Motion>

          <Motion
            preset={zoomIn}
            as="div"
            className="col-span-1"
            delay={100}
            style={{ opacity: 0, transform: 'scale(0.5)' }}
          >
            <Controls
              color={color}
              onColorChange={setColor}
              width={width}
              height={height}
              onWidthChange={setWidth}
              onHeightChange={setHeight}
              fileType={fileType}
              onFileTypeChange={setFileType}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              minWidth={360}
              minHeight={350}
              padding={0}
            />
          </Motion>

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
                initialFileName={`wallpaper_${width}x${height}`}
                onClear={handleClear}
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