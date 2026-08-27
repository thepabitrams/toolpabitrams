// src/tools/image/adjust-size/index.tsx
import { Tool } from '@/core/registry/toolRegistry';
import { AdjustSizeTool } from './AdjustSize'; // ✅ IMPORT FROM NEW FILE

const toolDef: Tool = {
  id: 'adjust-size',
  name: 'Adjust Size',
  description: 'Adjust image file size to fit within a range',
  category: 'image',
  input: 'single',
  component: AdjustSizeTool,
};

export default toolDef;