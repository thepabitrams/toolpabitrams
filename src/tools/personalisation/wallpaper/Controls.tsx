import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { ColorPicker } from '@/core/components/ui/ColorPicker';
import { Input } from '@/core/components/ui/Input';
import { Select, type SelectOption } from '@/core/components/ui/Select';
import { Button } from '@/core/components/ui/Button';
import { useState, useEffect } from 'react';

// ✅ MERGED – NO DUPLICATES!
const DIMENSION_OPTIONS: SelectOption[] = [
  { value: '1920x1080', label: 'Desktop HD (1920×1080)' },
  { value: '1080x1920', label: 'Mobile & Social Stories (1080×1920)' },
  { value: '2048x2732', label: 'iPad Pro (2048×2732)' },
  { value: '1080x1080', label: 'Square (1080×1080)' },
  { value: 'custom', label: 'Custom' },
];

const FILE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'png', label: 'PNG (Lossless)' },
  { value: 'jpeg', label: 'JPG (Smaller)' },
  { value: 'webp', label: 'WEBP (Modern)' },
];

const PRESET_COLORS = [
  '#000000', '#FFFFFF',
  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3',
];

interface ControlsProps {
  color: string;
  onColorChange: (c: string) => void;
  width: number;
  height: number;
  onWidthChange: (w: number) => void;
  onHeightChange: (h: number) => void;
  fileType: 'png' | 'jpeg' | 'webp';
  onFileTypeChange: (t: 'png' | 'jpeg' | 'webp') => void;
  onGenerate: () => void;
  isGenerating: boolean;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
  className?: string;
}

export default function Controls({
  color,
  onColorChange,
  width,
  height,
  onWidthChange,
  onHeightChange,
  fileType,
  onFileTypeChange,
  onGenerate,
  isGenerating,
  minWidth = 360,
  minHeight = 350,
  padding = 0,
  className = '',
}: ControlsProps) {
  const findPreset = (w: number, h: number) => {
    const match = DIMENSION_OPTIONS.find(
      (opt) => opt.value !== 'custom' && opt.value === `${w}x${h}`
    );
    return match ? match.value : 'custom';
  };

  const [selectedPreset, setSelectedPreset] = useState(findPreset(width, height));

  useEffect(() => {
    setSelectedPreset(findPreset(width, height));
  }, [width, height]);

  const handleDimensionChange = (value: string) => {
    setSelectedPreset(value);
    if (value === 'custom') return;
    const [w, h] = value.split('x').map(Number);
    if (w && h) {
      onWidthChange(w);
      onHeightChange(h);
    }
  };

  const isCustom = selectedPreset === 'custom';

  return (
    <Container
      className={`px-0 flex-1 ${className}`}
      style={{
        minWidth: `${minWidth}px`,
        minHeight: `${minHeight}px`,
        padding: `${padding}px`,
      }}
    >
      <Card className="p-4 space-y-4 w-full h-full">
        <div>
          <label className="text-sm font-medium block mb-1.5">Pick a Color</label>
          <div className="flex items-center gap-3">
            <ColorPicker value={color} onChange={onColorChange} size="lg" />
            <Input
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  color === c
                    ? 'border-blue-500 scale-110 shadow-md ring-2 ring-blue-500/30'
                    : 'border-gray-300 dark:border-gray-600 hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
                onClick={() => onColorChange(c)}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">Dimensions</label>
          <Select
            options={DIMENSION_OPTIONS}
            value={selectedPreset}
            onChange={handleDimensionChange}
            className="w-full"
          />
          {isCustom && (
            <div className="flex gap-3 mt-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Width</label>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => onWidthChange(Number(e.target.value))}
                  min={1}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Height</label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => onHeightChange(Number(e.target.value))}
                  min={1}
                  className="w-full"
                />
              </div>
            </div>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {width} × {height} px
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">File Type</label>
          <Select
            options={FILE_TYPE_OPTIONS}
            value={fileType}
            onChange={(val) => onFileTypeChange(val as any)}
            className="w-full"
          />
        </div>

        <Button
          variant="primary"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full mt-2"
        >
          Generate Wallpaper
        </Button>
      </Card>
    </Container>
  );
}