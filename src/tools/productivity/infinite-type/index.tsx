// src/tools/productivity/infinite-type/index.tsx
import { Tool } from '@/core/registry/toolRegistry';
import { InfiniteType } from './InfiniteType';

const toolDef: Tool = {
  id: 'infinite-type',
  name: 'Infinite Type',
  description: 'Endless typing drill with custom character pool',
  category: 'productivity',
  input: 'none',
  component: InfiniteType,
};

export default toolDef;