import { useMemo } from 'react';
import { useSplitStore } from '../store/useSplitStore';
import { calculateBalances, calculateTransactions } from '../utils/settlement';

export function useSettlement() {
  const { people, expenses } = useSplitStore();

  return useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const activePeople = people.length > 0 ? people : ['No one'];
    const perPerson = activePeople.length > 0 ? total / activePeople.length : 0;

    const balances = calculateBalances(people, expenses);
    const transactions = calculateTransactions(balances);

    return { total, perPerson, transactions };
  }, [people, expenses]);
}