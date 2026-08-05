// Balances: positive = gets money back, negative = owes
export function calculateBalances(
  people: string[],
  expenses: { amount: number; payer: string; participants: string[] }[]
): Map<string, number> {
  const balances = new Map<string, number>();
  people.forEach((p) => balances.set(p, 0));

  for (const expense of expenses) {
    const share = expense.amount / expense.participants.length;
    for (const p of expense.participants) {
      balances.set(p, (balances.get(p) || 0) - share);
    }
    balances.set(expense.payer, (balances.get(expense.payer) || 0) + expense.amount);
  }

  return balances;
}

// Greedy algorithm: minimize number of transactions
export function calculateTransactions(
  balances: Map<string, number>
): { from: string; to: string; amount: number }[] {
  const sorted = Array.from(balances.entries())
    .filter(([, amount]) => Math.abs(amount) > 0.01)
    .sort((a, b) => a[1] - b[1]);

  const transactions: { from: string; to: string; amount: number }[] = [];
  let i = 0,
    j = sorted.length - 1;

  while (i < j) {
    const [debtor, debt] = sorted[i];
    const [creditor, credit] = sorted[j];
    const amount = Math.min(-debt, credit);

    if (amount > 0.01) {
      transactions.push({ from: debtor, to: creditor, amount });
    }

    sorted[i] = [debtor, debt + amount];
    sorted[j] = [creditor, credit - amount];

    if (Math.abs(sorted[i][1]) < 0.01) i++;
    if (Math.abs(sorted[j][1]) < 0.01) j--;
  }

  return transactions;
}