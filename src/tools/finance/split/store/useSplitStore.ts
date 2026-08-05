import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Expense {
  id: string;
  description: string;
  amount: number;
  payer: string;
  participants: string[]; // who splits this expense
}

interface SplitState {
  people: string[];
  expenses: Expense[];
  currency: string;
  timestamp: number; // for 7-day TTL

  // Actions
  addPerson: (name: string) => void;
  removePerson: (name: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
  setCurrency: (currency: string) => void;
  clearAll: () => void;
  clearIfExpired: () => void;
  init: () => void;
}

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const useSplitStore = create<SplitState>()(
  persist(
    (set, get) => ({
      people: [],
      expenses: [],
      currency: 'INR',
      timestamp: Date.now(),

      addPerson: (name) =>
        set((state) => ({
          people: [...state.people, name.trim()],
        })),

      removePerson: (name) =>
        set((state) => ({
          people: state.people.filter((p) => p !== name),
          expenses: state.expenses.filter(
            (e) => e.payer !== name && e.participants.includes(name)
          ),
        })),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            {
              ...expense,
              id: crypto.randomUUID(),
              participants: expense.participants || state.people,
            },
          ],
        })),

      removeExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      setCurrency: (currency) => set({ currency }),

      clearAll: () => set({ people: [], expenses: [], timestamp: Date.now() }),

      clearIfExpired: () => {
        const { timestamp } = get();
        if (Date.now() - timestamp > SEVEN_DAYS) {
          set({ people: [], expenses: [], timestamp: Date.now() });
        }
      },

      init: () => {
        // Ensure timestamp exists for new users
        const { timestamp } = get();
        if (!timestamp) {
          set({ timestamp: Date.now() });
        }
      },
    }),
    {
      name: 'split-storage', // localStorage key
    }
  )
);