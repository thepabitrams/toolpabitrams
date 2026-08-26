import { ComponentType } from 'react';

export type Category = 'image' | 'pdf' | 'file';
export type InputType = 'single' | 'multiple';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: Category;
  input: InputType;
  component: ComponentType;
}

export const FallbackComponent: ComponentType = () => (
  <div className="text-center py-8">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Under Construction</h2>
    <p className="text-gray-500 dark:text-gray-400 mt-2">This tool is being built.</p>
  </div>
);

const toolModules = import.meta.glob('../../tools/**/index.tsx');
const loaderMap = new Map<string, () => Promise<any>>();

for (const [path, loader] of Object.entries(toolModules)) {
  const parts = path.split('/');
  const toolId = parts[parts.length - 2];
  loaderMap.set(toolId, loader);
}

export async function loadTool(toolId: string): Promise<Tool> {
  const loader = loaderMap.get(toolId);
  if (!loader) {
    throw new Error(`Tool "${toolId}" not found in loader map.`);
  }
  const module = await loader();
  const toolDef = module.default || module;

  return {
    id: toolDef.id || toolId,
    name: toolDef.name || toolId,
    description: toolDef.description || 'No description provided',
    category: toolDef.category || 'file',
    input: toolDef.input || toolDef.inputType || 'single',
    component: toolDef.component || FallbackComponent,
  };
}

export function preloadTool(toolId: string): void {
  const loader = loaderMap.get(toolId);
  if (loader) {
    loader().catch(() => {});
  }
}