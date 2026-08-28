// core/motion/motion.tsx
import React from 'react';
import { injectKeyframes } from './core/injection/keyframes';

// ---------- Types ----------
interface Preset {
  name: string;
  keyframes: string;
  duration: number;
  easing: string;
}

type MotionPreset =
  | Preset
  | (() => { className: string; style?: Record<string, any> })
  | string
  | { className: string; style?: Record<string, any> };

interface MotionProps {
  preset: MotionPreset;
  as?: keyof JSX.IntrinsicElements;
  duration?: number;
  easing?: string;
  delay?: number;
  className?: string;
  style?: Record<string, any>;
  children?: React.ReactNode;
}

// ---------- Core logic ----------
export function getMotion(
  preset: MotionPreset,
  options?: {
    duration?: number;
    easing?: string;
    delay?: number;
    className?: string;
    style?: Record<string, any>;
  }
): { className: string; style: Record<string, any> } {
  // CASE 1: Animation preset
  if (typeof preset === 'object' && preset !== null && 'name' in preset && 'keyframes' in preset) {
    const p = preset as Preset;
    injectKeyframes(p.name, p.keyframes);

    const duration = options?.duration ?? p.duration ?? 200;
    const easing = options?.easing ?? p.easing ?? 'ease';

    // ✅ FIX: Use inline styles for animation, NOT Tailwind class!
    let style = { ...(options?.style || {}) };
    
    // Apply animation via inline styles
    style = {
      ...style,
      animationName: p.name,
      animationDuration: `${duration}ms`,
      animationTimingFunction: easing,
      animationFillMode: 'both',
    };

    // Apply delay if provided
    if (options?.delay !== undefined) {
      style = {
        ...style,
        animationDelay: `${options.delay}ms`,
      };
    }

    // Regular className (for layout, colors, etc.)
    let className = options?.className || '';

    return {
      className,
      style,
    };
  }

  // CASE 2: Function composition
  if (typeof preset === 'function') {
    const result = preset();
    const mergedStyle = { ...(result.style || {}), ...(options?.style || {}) };
    return {
      className: (result.className || '') + (options?.className ? ` ${options.className}` : ''),
      style: mergedStyle,
    };
  }

  // CASE 3: String
  if (typeof preset === 'string') {
    return {
      className: preset + (options?.className ? ` ${options.className}` : ''),
      style: options?.style ?? {},
    };
  }

  // CASE 4: Object with className
  if (typeof preset === 'object' && preset !== null && 'className' in preset) {
    const result = preset as { className: string; style?: Record<string, any> };
    const mergedStyle = { ...(result.style || {}), ...(options?.style || {}) };
    return {
      className: (result.className || '') + (options?.className ? ` ${options.className}` : ''),
      style: mergedStyle,
    };
  }

  return {
    className: options?.className || '',
    style: options?.style || {},
  };
}

// ---------- The Motion Component ----------
export function Motion({
  preset,
  as: Component = 'div',
  duration,
  easing,
  delay,
  className = '',
  style = {},
  children,
  show,
  ...props
}: MotionProps & React.HTMLAttributes<HTMLElement>) {
  const result = getMotion(preset, { duration, easing, delay, className, style });

  return (
    <Component className={result.className} style={result.style} {...props}>
      {children}
    </Component>
  );
}