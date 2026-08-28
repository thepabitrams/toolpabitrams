// src/tools/image/flip-rotate/index.tsx
import { Tool } from '@/core/registry/toolRegistry';
import { FlipRotateTool } from './FlipRotate';

const toolDef: Tool = {
  id: 'flip-rotate',
  name: 'Rotate & Flip',
  description: 'Rotate and flip your image',
  category: 'image',
  input: 'single',
  component: FlipRotateTool,
};

export default toolDef;