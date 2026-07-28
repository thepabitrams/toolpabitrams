// core/motion/injection.ts

/**
 * Set to track which keyframes have already been injected
 * Prevents duplicate style tags
 */
const injected = new Set<string>();

/**
 * Inject keyframes into the document head
 * @param name - The name of the keyframes (used as @keyframes name)
 * @param keyframes - The CSS keyframes content
 * 
 * @example
 * injectKeyframes('fade-in', `
 *   0% { opacity: 0; }
 *   100% { opacity: 1; }
 * `);
 */
export function injectKeyframes(name: string, keyframes: string): void {
  if (typeof document === 'undefined') return;
  if (injected.has(name)) return;

  const style = document.createElement('style');
  style.textContent = `@keyframes ${name} { ${keyframes} }`;
  document.head.appendChild(style);
  injected.add(name);
}

/**
 * Check if keyframes have already been injected
 * Useful for debugging or conditional logic
 */
export function isKeyframesInjected(name: string): boolean {
  return injected.has(name);
}

/**
 * Get all injected keyframe names (for debugging)
 */
export function getInjectedKeyframes(): string[] {
  return Array.from(injected);
}