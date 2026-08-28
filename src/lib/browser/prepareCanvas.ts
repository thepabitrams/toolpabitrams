// src/lib/browser/prepareCanvas.ts

export function prepareCanvas(
  canvas: HTMLCanvasElement,
  hasAlpha: boolean = true
): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')!;

  if (hasAlpha) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  return ctx;
}