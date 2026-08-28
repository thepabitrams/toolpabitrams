// src/core/motion/injection/css.ts
const injected = new Set<string>();

export function injectCss(id: string, css: string): void {
  if (typeof document === 'undefined') return;
  if (injected.has(id)) return;

  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
  injected.add(id);
}

export function isCssInjected(id: string): boolean {
  return injected.has(id);
}

export function getInjectedCss(): string[] {
  return Array.from(injected);
}