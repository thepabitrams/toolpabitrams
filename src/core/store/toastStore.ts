// src/core/store/toastStore.ts
import { create } from 'zustand';
import { ReactNode } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastData {
  id: number;
  type: ToastType;
  icon: ReactNode;
  title: string;
  message: string;
  duration?: number;
  timeoutId?: ReturnType<typeof setTimeout>;
}

interface ToastStore {
  toasts: ToastData[];
  idCounter: number;
  MAX_VISIBLE: number;
  showToast: (
    type: ToastType,
    icon: ReactNode,
    title: string,
    message: string,
    duration?: number
  ) => number;
  dismissToast: (id: number) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  idCounter: 0,
  MAX_VISIBLE: 3,

  showToast: (type, icon, title, message, duration = 4000) => {
    const { toasts, idCounter, MAX_VISIBLE, dismissToast } = get();
    const id = idCounter + 1;

    const existingIndex = toasts.findIndex(t => t.title === title && t.message === message);
    if (existingIndex !== -1) {
      const existing = toasts[existingIndex];
      if (existing.timeoutId) clearTimeout(existing.timeoutId);
      const timeoutId = setTimeout(() => dismissToast(existing.id), duration);
      set((state) => {
        const updated = [...state.toasts];
        updated[existingIndex] = { ...existing, timeoutId, duration };
        return { toasts: updated };
      });
      return existing.id;
    }

    const timeoutId = setTimeout(() => {
      dismissToast(id);
    }, duration);

    const newToast: ToastData = {
      id,
      type,
      icon,
      title,
      message,
      duration,
      timeoutId,
    };

    set((state) => ({
      toasts: [newToast, ...state.toasts],
      idCounter: id,
    }));

    setTimeout(() => {
      set((state) => {
        if (state.toasts.length > MAX_VISIBLE) {
          const toRemove = state.toasts.slice(MAX_VISIBLE);
          toRemove.forEach(t => {
            if (t.timeoutId) clearTimeout(t.timeoutId);
          });
          return { toasts: state.toasts.slice(0, MAX_VISIBLE) };
        }
        return state;
      });
    }, 100);

    return id;
  },

  dismissToast: (id: number) => {
    set((state) => {
      const toast = state.toasts.find(t => t.id === id);
      if (toast?.timeoutId) clearTimeout(toast.timeoutId);
      return { toasts: state.toasts.filter(t => t.id !== id) };
    });
  },

  clearAll: () => {
    set((state) => {
      state.toasts.forEach(t => {
        if (t.timeoutId) clearTimeout(t.timeoutId);
      });
      return { toasts: [] };
    });
  },
}));