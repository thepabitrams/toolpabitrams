import { Tool } from '@/core/registry/toolRegistry';

function ConvertImageTool() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="text-center py-12">
        <h2 className="text-2xl font-medium text-gray-700 dark:text-gray-300">
          Convert Image Format
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Coming soon...
        </p>
      </div>
    </div>
  );
}

const toolDef: Tool = {
  id: 'convert-image',
  name: 'Convert Image Format',
  description: 'Convert images to different formats',
  category: 'image',
  component: ConvertImageTool,
};

export default toolDef;