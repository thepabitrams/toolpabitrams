import { Tool } from '@/core/registry/toolRegistry';
import { AddText } from './AddText';

const toolDef: Tool = {
  id: 'add-text',
  name: 'Add Text',
  description: 'Add text overlay to your image',
  category: 'image',
  input: 'single',
  component: AddText,
};

export default toolDef;