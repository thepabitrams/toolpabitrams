// src/core/motion/injection/keyframes.ts
const injected = new Set<string>();

export function injectKeyframes(name: string, keyframes: string): void {
  if (typeof document === 'undefined') return;
  if (injected.has(name)) return;

  const style = document.createElement('style');
  style.textContent = `@keyframes ${name} { ${keyframes} }`;
  document.head.appendChild(style);
  injected.add(name);
}

export function isKeyframesInjected(name: string): boolean {
  return injected.has(name);
}

export function getInjectedKeyframes(): string[] {
  return Array.from(injected);
}