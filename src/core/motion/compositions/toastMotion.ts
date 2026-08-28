// src/core/motion/compositions/toastMotion.ts
import { injectCss } from '../core/injection/css';

const TOAST_CSS = `
  .toast-notification {
    transform: translate3d(0, -20px, 0) scale(0.92);
    opacity: 0;
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                opacity 0.3s ease;
    will-change: transform, opacity;
  }
  .toast-notification.visible {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 1;
  }
  .toast-notification.hiding {
    transform: translate3d(0, -10px, 0) scale(0.92);
    opacity: 0;
    pointer-events: none;
  }
  .toast-notification .toast-icon {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .toast-notification .toast-title {
    font-size: 13px; font-weight: 600; color: #0f172a;
  }
  .dark .toast-notification .toast-title { color: #f1f5f9; }
  .toast-notification .toast-message {
    font-size: 12.5px; color: #475569; line-height: 1.4;
  }
  .dark .toast-notification .toast-message { color: #94a3b8; }
  .toast-notification .toast-time {
    font-size: 10px; color: #94a3b8; margin-top: 4px; display: block;
  }
  .dark .toast-notification .toast-time { color: #64748b; }
  .toast-notification .toast-swipe-hint {
    font-size: 12px; color: #cbd5e1; opacity: 0.4;
    flex-shrink: 0; pointer-events: none; user-select: none;
  }
  .dark .toast-notification .toast-swipe-hint { color: #475569; }
  .toast-notification.info .toast-icon { background: #eff6ff; color: #3b82f6; }
  .dark .toast-notification.info .toast-icon { background: #1e3a5f; color: #60a5fa; }
  .toast-notification.success .toast-icon { background: #f0fdf4; color: #22c55e; }
  .dark .toast-notification.success .toast-icon { background: #14532d; color: #4ade80; }
  .toast-notification.warning .toast-icon { background: #fffbeb; color: #f59e0b; }
  .dark .toast-notification.warning .toast-icon { background: #78350f; color: #fbbf24; }
  .toast-notification.error .toast-icon { background: #fef2f2; color: #ef4444; }
  .dark .toast-notification.error .toast-icon { background: #7f1d1d; color: #f87171; }
`;

export const toastMotion = () => {
  injectCss('toast-styles', TOAST_CSS);

  return {
    className: `
      toast-notification
      shadow-md hover:shadow-xl
      dark:shadow-white/10 dark:hover:shadow-white/20
      transition-shadow duration-300
    `,
  };
};