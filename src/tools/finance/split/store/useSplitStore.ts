import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Expense {
  id: string;
  description: string;
  amount: number;
  payer: string;
  participants: string[];
}

interface SplitState {
  people: string[];
  expenses: Expense[];
  currency: string;
  timestamp: number;

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

      /**
       * ─── ADD PERSON ───
       * Adds person to people list AND to ALL existing expenses.
       * This ensures they are included in ALL splits (past and future).
       * 
       * Example: If Singh joins after Pabitra paid ₹100,
       * Singh is added to that expense's participants.
       * So Singh owes his fair share.
       */
      addPerson: (name) =>
        set((state) => {
          const trimmedName = name.trim();
          const newPeople = [...state.people, trimmedName];
          // ✅ Add new person to ALL existing expenses
          const updatedExpenses = state.expenses.map((exp) => ({
            ...exp,
            participants: [...exp.participants, trimmedName],
          }));
          return {
            people: newPeople,
            expenses: updatedExpenses,
          };
        }),

      /**
       * ─── REMOVE PERSON ───
       * 1. Remove from people list
       * 2. DELETE all expenses where this person paid
       * 3. REMOVE this person from participants of remaining expenses
       * 
       * Example: If Singh leaves, his ₹50 expense is deleted,
       * and he is removed from Pabitra's ₹100 expense.
       */
      removePerson: (name) =>
        set((state) => {
          const newPeople = state.people.filter((p) => p !== name);
          // ✅ Delete expenses where person was payer
          // ✅ Remove person from participants of remaining expenses
          const updatedExpenses = state.expenses
            .filter((exp) => exp.payer !== name)
            .map((exp) => ({
              ...exp,
              participants: exp.participants.filter((p) => p !== name),
            }));
          return {
            people: newPeople,
            expenses: updatedExpenses,
          };
        }),

      /**
       * ─── ADD EXPENSE ───
       * All current people are participants by default.
       */
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
        const { timestamp } = get();
        if (!timestamp) {
          set({ timestamp: Date.now() });
        }
      },
    }),
    {
      name: 'split-storage',
    }
  )
);