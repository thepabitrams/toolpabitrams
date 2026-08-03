// src/tools/image/background-remove/types.ts

export interface RefinePoint {
  x: number;
  y: number;
  type: 'positive' | 'negative';
}

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  license: string;
  size: string;
  accuracy: string;
  task: 'image-segmentation' | 'background-removal';
  modelName: string;
  processorName?: string;
  useAutoModel: boolean; // true = AutoModel, false = pipeline
  dtype?: 'fp16' | 'fp32';
  device?: 'webgpu' | 'wasm';
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'birefnet-lite-512',
    name: 'BiRefNet-lite-512',
    description: 'Best quality, MIT licensed',
    license: 'MIT ✅',
    size: '94 MB',
    accuracy: 'Highest (SOTA)',
    task: 'image-segmentation',
    modelName: 'studioludens/birefnet-lite-512',
    useAutoModel: true,
    dtype: 'fp16',
    device: 'webgpu',
  },
  {
    id: 'isnet',
    name: 'ISNet',
    description: 'Best "just works" default',
    license: 'Apache-2.0 ✅',
    size: '80 MB',
    accuracy: 'Very High',
    task: 'background-removal',
    modelName: 'SacredNoir/isnet-general-use-onnx',
    useAutoModel: false,
  },
  {
    id: 'modnet',
    name: 'MODNet',
    description: 'Fastest, smallest, portraits',
    license: 'Apache-2.0 ✅',
    size: '10 MB',
    accuracy: 'Good (Portraits)',
    task: 'background-removal',
    modelName: 'Xenova/modnet',
    useAutoModel: false,
  },
  {
    id: 'ben2',
    name: 'BEN2',
    description: 'New, great for hair & 4K',
    license: 'Open Source',
    size: '94.6M params',
    accuracy: 'Excellent',
    task: 'background-removal',
    modelName: 'kittypdf/BEN2-transformersjs',
    useAutoModel: false,
  },
];