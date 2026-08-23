import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';

interface WallpaperPreviewProps {
  color: string;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
  className?: string;
}

export default function WallpaperPreview({ 
  color, 
  width, 
  height,
  minWidth = 360,
  minHeight = 420,
  padding = 0,
  className = '',
}: WallpaperPreviewProps) {
  return (
    // 🔥 ONLY OUTER CONTAINER ADDED – SAME AS FILECARD!
    <Container 
      className={`px-0 flex-1 ${className}`}
      style={{
        minWidth: `${minWidth}px`,
        minHeight: `${minHeight}px`,
        padding: `${padding}px`,
      }}
    >
      {/* 🔥 INSIDE CARD – COMPLETELY UNCHANGED! KEPT AS IS! */}
      <Card 
        className="overflow-hidden p-0 shadow-lg bg-white dark:bg-gray-900" 
        style={{ 
          width: '100%',
          height: '420px',
          minHeight: '420px',
          maxHeight: '420px',
          flexShrink: 0,
          flexGrow: 0,
        }}
      >
        <Container 
          className="px-0 w-full h-full flex items-center justify-center"
          style={{
            paddingLeft: '16px',
            paddingRight: '16px',
            paddingTop: 0,
            paddingBottom: 0,
          }}
        >
          <div 
            className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center"
          >
            <div
              style={{
                backgroundColor: color,
                aspectRatio: `${width} / ${height}`,
                maxWidth: '100%',
                maxHeight: '100%',
                flex: '1 1 auto',
                minWidth: 0,
                minHeight: 0,
                transition: 'all 0.3s ease-in-out',
              }}
            />
          </div>
        </Container>
      </Card>
    </Container>
  );
}