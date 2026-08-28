// src/tools/image/precision-crop/index.tsx
import { Tool } from '@/core/registry/toolRegistry';
import { PrecisionCrop } from './PrecisionCrop';

const toolDef: Tool = {
  id: 'precision-crop',
  name: 'Precision Crop',
  description: 'Crop images with precision',
  category: 'image',
  input: 'single',
  component: PrecisionCrop,
};

export default toolDef;