import { useMemo } from 'react';
import { useSplitStore } from '../store/useSplitStore';
import { calculateBalances, calculateTransactions } from '../utils/settlement';

export function useSettlement() {
  const { people, expenses } = useSplitStore();

  return useMemo(() => {
    // ─── Total ───
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    // ─── Per Person ───
    const activePeople = people.length > 0 ? people : ['No one'];
    const perPerson = activePeople.length > 0 ? total / activePeople.length : 0;

    // ─── Balances ───
    const balances = calculateBalances(people, expenses);

    // ─── Transactions ───
    const transactions = calculateTransactions(balances);

    return { total, perPerson, balances, transactions };
  }, [people, expenses]); // ← Recalculates EVERY time people or expenses change
}