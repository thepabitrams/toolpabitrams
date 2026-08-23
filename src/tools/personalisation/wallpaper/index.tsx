import { Tool } from '@/core/registry/toolRegistry';
import WallpaperTool from './WallpaperTool';

const tool: Tool = {
  id: 'wallpaper',
  name: 'Wallpaper Studio',
  description: 'Create solid color wallpapers in any size and format.',
  category: 'personalisation',
  input: 'none',
  component: WallpaperTool,
};

export default tool;