import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { useRef, useEffect } from 'react';

interface PreviewProps {
  color: string;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
  className?: string;
}

export default function Preview({
  color,
  width,
  height,
  minWidth = 360,
  minHeight = 420,
  padding = 0,
  className = '',
}: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const containerWidth = rect.width;
    const containerHeight = rect.height;

    const aspectRatio = width / height;
    let drawWidth = containerWidth;
    let drawHeight = containerWidth / aspectRatio;

    if (drawHeight > containerHeight) {
      drawHeight = containerHeight;
      drawWidth = containerHeight * aspectRatio;
    }

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const x = (canvas.width - drawWidth) / 2;
    const y = (canvas.height - drawHeight) / 2;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, drawWidth, drawHeight);
  }, [color, width, height]);

  return (
    <Container
      className={`px-0 flex-1 ${className}`}
      style={{
        minWidth: `${minWidth}px`,
        minHeight: `${minHeight}px`,
        padding: `${padding}px`,
      }}
    >
      <Card
        className="overflow-hidden p-0 shadow-lg bg-white dark:bg-gray-900"
        style={{
          width: '100%',
          height: `${minHeight}px`,
          minHeight: `${minHeight}px`,
          maxHeight: `${minHeight}px`,
          flexShrink: 0,
          flexGrow: 0,
        }}
      >
        <Container
          className="px-0 w-full h-full flex items-center justify-center"
          style={{ padding: 0 }}
        >
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
            <canvas
              ref={canvasRef}
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        </Container>
      </Card>
    </Container>
  );
}