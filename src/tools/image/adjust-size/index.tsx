import { Tool } from '@/core/registry/toolRegistry';

function AdjustSizeTool() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="text-center py-12">
        <h2 className="text-2xl font-medium text-gray-700 dark:text-gray-300">
          Adjust Image File Size
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Coming soon...
        </p>
      </div>
    </div>
  );
}

const toolDef: Tool = {
  id: 'adjust-size',
  name: 'Adjust Image File Size',
  description: 'Compress or resize images',
  category: 'image',
  component: AdjustSizeTool,
};

export default toolDef;