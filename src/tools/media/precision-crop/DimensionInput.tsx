// src/tools/image/precision-crop/DimensionInput.tsx
import { useState, useCallback } from 'react';
import { Container } from '@/core/components/ui/Container';
import { Card } from '@/core/components/ui/Card';
import { Input } from '@/core/components/ui/Input';
import { Motion } from '@/core/motion/motion';
import { buttonMotion } from '@/core/motion/compositions/buttonMotion';

export type Unit = 'px' | 'mm' | 'cm' | 'inch';

const UNITS: Unit[] = ['px', 'mm', 'cm', 'inch'];

interface DimensionInputProps {
  initialWidth?: number;
  initialHeight?: number;
  onSizeChange?: (
    widthPx: number,
    heightPx: number,
    rawWidth: number,
    rawHeight: number,
    unit: Unit,
    dpi: number
  ) => void;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

const toPixels = (value: number, fromUnit: Unit, dpi: number): number => {
  switch (fromUnit) {
    case 'px':   return value;
    case 'inch': return value * dpi;
    case 'cm':   return (value / 2.54) * dpi;
    case 'mm':   return (value / 25.4) * dpi;
    default:     return value;
  }
};

export const DimensionInput: React.FC<DimensionInputProps> = ({
  initialWidth = 1,
  initialHeight = 1,
  onSizeChange,
  className = '',
  minWidth = 260,
  minHeight = 200,
  padding = 0,
}) => {
  const [widthRaw, setWidthRaw] = useState(initialWidth);
  const [heightRaw, setHeightRaw] = useState(initialHeight);
  const [unit, setUnit] = useState<Unit>('px');
  const [dpi, setDpi] = useState(96);

  const notify = useCallback(
    (wRaw: number, hRaw: number, u: Unit, d: number) => {
      if (!onSizeChange) return;
      const wPx = toPixels(wRaw, u, d);
      const hPx = toPixels(hRaw, u, d);
      onSizeChange(wPx, hPx, wRaw, hRaw, u, d);
    },
    [onSizeChange]
  );

  const handleUnitChange = (newUnit: Unit) => {
    setUnit(newUnit);
    notify(widthRaw, heightRaw, newUnit, dpi);
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (e.target.value === '' || isNaN(val)) return;
    if (val <= 0) {
      window.alert('Width cannot be 0 or negative. Setting to 1.');
      setWidthRaw(1);
      notify(1, heightRaw, unit, dpi);
      return;
    }
    setWidthRaw(val);
    notify(val, heightRaw, unit, dpi);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (e.target.value === '' || isNaN(val)) return;
    if (val <= 0) {
      window.alert('Height cannot be 0 or negative. Setting to 1.');
      setHeightRaw(1);
      notify(widthRaw, 1, unit, dpi);
      return;
    }
    setHeightRaw(val);
    notify(widthRaw, val, unit, dpi);
  };

  const handleDpiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      setDpi(val);
      notify(widthRaw, heightRaw, unit, val);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <Container 
      className={`px-0 flex-1 ${className}`}
      style={{ minWidth, minHeight, padding }}
    >
      <Card className="p-4 flex flex-col h-full w-full">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Dimension Input
        </h3>

        <div className="flex items-center gap-3 mb-3">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
            DPI
          </label>
          <Input
            type="number"
            value={dpi}
            onChange={handleDpiChange}
            onFocus={handleFocus}
            min="1"
            max="1200"
            fullWidth
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Unit
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {UNITS.map((u) => (
              <Motion
                key={u}
                preset={buttonMotion}
                as="button"
                onClick={() => handleUnitChange(u)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-lg
                  transition-all duration-200
                  ${unit === u
                    ? 'bg-blue-500 text-white shadow-sm scale-[1.02]'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {u.toUpperCase()}
              </Motion>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Width ({unit})
            </label>
            <Input
              type="number"
              value={widthRaw}
              onChange={handleWidthChange}
              onFocus={handleFocus}
              min="1"
              step="any"
              fullWidth
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Height ({unit})
            </label>
            <Input
              type="number"
              value={heightRaw}
              onChange={handleHeightChange}
              onFocus={handleFocus}
              min="1"
              step="any"
              fullWidth
            />
          </div>
        </div>
      </Card>
    </Container>
  );
};