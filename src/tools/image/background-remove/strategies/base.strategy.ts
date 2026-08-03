// src/tools/image/background-remove/strategies/base.strategy.ts

export interface ModelStrategy {
  id: string;
  name: string;
  license: string;
  size: string;
  description: string;
  run(file: File, onProgress: (progress: number, speed: number) => void): Promise<Blob>;
}