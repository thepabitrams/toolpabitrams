// src/tools/image/image-filters/index.tsx
import { Tool } from '@/core/registry/toolRegistry';
import { ImageFilters } from './ImageFilters';

const toolDef: Tool = {
  id: 'image-filters',
  name: 'Image Filters',
  description: 'Apply professional filters to your images',
  category: 'image',
  input: 'single',
  component: ImageFilters,
};

export default toolDef;