import { Tool } from '@/core/registry/toolRegistry';
import Wallpaper from './Wallpaper';

const tool: Tool = {
  id: 'wallpaper',
  name: 'Wallpaper',
  description: 'Create solid color wallpapers in any size and format.',
  category: 'personalisation',
  input: 'none',
  component: Wallpaper,
};

export default tool;