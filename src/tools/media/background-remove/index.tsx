// src/tools/image/background-remove/index.ts
import { BackgroundRemove } from './BackgroundRemove';
import { Tool } from '@/core/registry/toolRegistry';

const toolDef: Tool = {
  id: 'background-remove',
  name: 'Background Remover',
  description: 'Remove background from images with AI',
  category: 'image',
  input: 'single',
  component: BackgroundRemove,
};

export default toolDef;