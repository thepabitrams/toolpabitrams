import React, { useEffect, useState } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { useFileStore } from '@/core/store/fileStore';
import { Controls } from './Controls';
import { useAddText } from './useAddText'; // ✅ UPDATED IMPORT
import type { FileRef } from '@/core/store/fileStore';

interface EditorProps {
  file: FileRef | null;
  onProcess: (blob: Blob) => Promise<void>;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

export const Editor: React.FC<EditorProps> = ({
  file,
  onProcess,
  className = '',
  minWidth = 360,
  minHeight = 350,
  padding = 0,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const { readFile } = useFileStore();

  const {
    config,
    updateText,
    updateFontSize,
    updateColor,
    updateBackgroundColor,
    updateOpacity,
    updateFontFamily,
    toggleBold,
    toggleItalic,
    updatePosition,
    reset,
    hasChanges,
    processImage,
  } = useAddText(); // ✅ UPDATED HOOK NAME

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const loadImage = async () => {
      if (!file) {
        setImageUrl(null);
        return;
      }
      try {
        const fileObj = await readFile(file.storageKey);
        if (fileObj && isMounted) {
          const img = new Image();
          const url = URL.createObjectURL(fileObj);
          img.onload = () => {
            setImageDimensions({ width: img.width, height: img.height });
          };
          img.src = url;
          objectUrl = url;
          setImageUrl(objectUrl);
        }
      } catch {
        // silent
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, readFile]);

  const handleApply = async () => {
    if (!file || isExporting) return;
    setIsExporting(true);
    try {
      const originalFile = await readFile(file.storageKey);
      if (!originalFile) throw new Error('File not found');
      const blob = await processImage(originalFile);
      await onProcess(blob);
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (!file || !imageUrl) {
    return (
      <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
        <Card className="p-4 flex flex-col items-center justify-center min-h-[200px]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Upload an image to add text</p>
        </Card>
      </Container>
    );
  }

  const lines = config.content.split('\n');
  const hasContent = lines.some(line => line.trim() || line === '');

  const getTextContainerStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      color: config.color,
      fontSize: `${config.fontSize}px`,
      fontFamily: config.fontFamily,
      fontWeight: config.fontWeight,
      fontStyle: config.fontStyle as any,
      opacity: config.opacity,
      lineHeight: '1.2',
      textAlign: 'center',
      boxSizing: 'border-box',
      padding: '0',
      margin: '0',
      top: config.position === 'top' ? 0 : 'auto',
      bottom: config.position === 'bottom' ? 0 : 'auto',
      left: 0,
      right: 0,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      transform: 'none',
    };

    return base;
  };

  const getTextBgStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      wordBreak: 'break-word',
      padding: '0',
      margin: '0',
      boxSizing: 'border-box',
    };

    if (config.backgroundColor === 'transparent' || config.backgroundColor === '') {
      return base;
    }

    return {
      ...base,
      backgroundColor: config.backgroundColor,
    };
  };

  const wrapperAspect = imageDimensions.width && imageDimensions.height
    ? imageDimensions.width / imageDimensions.height
    : 1;

  return (
    <Container className={`px-0 flex-1 ${className}`} style={{ minWidth, minHeight, padding }}>
      <Card className="overflow-hidden p-0">
        <div
          className="relative w-full aspect-square min-h-[300px] sm:min-h-[400px] bg-gray-100 dark:bg-gray-800"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'relative',
              aspectRatio: wrapperAspect,
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              flexShrink: 0,
            }}
          >
            <img
              src={imageUrl}
              alt="Preview"
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />

            {hasContent && (
              <div style={getTextContainerStyle()}>
                <div style={getTextBgStyle()}>
                  {lines.map((line, i) => (
                    <div
                      key={i}
                      style={{
                        whiteSpace: 'pre-wrap',
                        width: '100%',
                        textAlign: 'center',
                        lineHeight: '1.2',
                        padding: '0',
                        margin: '0',
                      }}
                    >
                      {line || '\u00A0'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Controls
          config={config}
          onUpdateText={updateText}
          onUpdateFontSize={updateFontSize}
          onUpdateColor={updateColor}
          onUpdateBackgroundColor={updateBackgroundColor}
          onUpdateOpacity={updateOpacity}
          onUpdateFontFamily={updateFontFamily}
          onToggleBold={toggleBold}
          onToggleItalic={toggleItalic}
          onUpdatePosition={updatePosition}
          onReset={reset}
          hasChanges={hasChanges}
          onApply={handleApply}
          isExporting={isExporting}
        />
      </Card>
    </Container>
  );
};