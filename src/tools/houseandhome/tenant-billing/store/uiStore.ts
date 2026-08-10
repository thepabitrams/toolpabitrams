import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentMonth } from '../core/constants';

interface UIState {
  selectedTenantId: string | null;
  selectedMonth: string;
  showSettings: boolean;
  setSelectedTenantId: (id: string | null) => void;
  setSelectedMonth: (month: string) => void;
  setShowSettings: (show: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      selectedTenantId: null,
      selectedMonth: getCurrentMonth(),
      showSettings: false,
      setSelectedTenantId: (id) => set({ selectedTenantId: id }),
      setSelectedMonth: (month) => set({ selectedMonth: month }),
      setShowSettings: (show) => set({ showSettings: show }),
    }),
    {
      name: 'ui-store',
    }
  )
);