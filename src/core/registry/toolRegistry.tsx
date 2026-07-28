// src/core/registry/toolRegistry.ts
import { ComponentType } from 'react';

export type Category = 'image' | 'pdf' | 'file';
export type InputType = 'single' | 'multiple'; // Keep this type if you want, or just use string

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: Category;
  input: InputType; // 🔥 CHANGED: inputType → input
  component: ComponentType;
}

export const FallbackComponent: ComponentType = () => (
  <div className="text-center py-8">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Under Construction</h2>
    <p className="text-gray-500 dark:text-gray-400 mt-2">This tool is being built.</p>
  </div>
);

const toolModules = import.meta.glob('../../tools/**/*/index.tsx');

export async function getToolRegistry(): Promise<Tool[]> {
  const tools: Tool[] = [];

  for (const [path, importFn] of Object.entries(toolModules)) {
    const module = (await importFn()) as any;
    const toolDef = module.default || module;
    if (toolDef?.id && toolDef?.name) {
      tools.push({
        id: toolDef.id,
        name: toolDef.name,
        description: toolDef.description || 'No description provided',
        category: toolDef.category || 'file',
        input: toolDef.input || toolDef.inputType || 'single', // 🔥 FALLBACK: check both just in case
        component: toolDef.component || FallbackComponent,
      });
    }
  }
  return tools;
}