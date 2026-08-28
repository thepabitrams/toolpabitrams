// src/core/hooks/useToast.ts
import { useToastStore } from '@/core/store/toastStore';
import type { ToastType } from '@/core/store/toastStore';

export function useToast() {
  const { toasts, showToast, dismissToast, clearAll } = useToastStore();

  return {
    toasts,
    showToast,
    dismissToast,
    clearAll,
  };
}

export type { ToastType };