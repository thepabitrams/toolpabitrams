/**
 * ─── ROUND TO 2 DECIMAL PLACES ───
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * ─── CALCULATE BALANCES ───
 * 
 * For each person: Balance = (Amount Paid) - (Total / Number of Participants)
 * Positive = gets money back (overpaid)
 * Negative = owes money (underpaid)
 */
export function calculateBalances(
  people: string[],
  expenses: { amount: number; payer: string; participants: string[] }[]
): Map<string, number> {
  const balances = new Map<string, number>();
  people.forEach((p) => balances.set(p, 0));

  for (const expense of expenses) {
    if (expense.participants.length === 0) continue;
    
    const share = round(expense.amount / expense.participants.length);
    
    // Subtract share from all participants
    for (const p of expense.participants) {
      const current = balances.get(p) || 0;
      balances.set(p, round(current - share));
    }
    
    // Add full amount to payer
    const currentPayer = balances.get(expense.payer) || 0;
    balances.set(expense.payer, round(currentPayer + expense.amount));
  }

  // Final rounding for all balances
  for (const [person, amount] of balances) {
    balances.set(person, round(amount));
  }

  return balances;
}

/**
 * ─── CALCULATE TRANSACTIONS (GREEDY ALGORITHM) ───
 * 
 * Matches biggest debtor with biggest creditor.
 * This minimizes the number of transactions.
 */
export function calculateTransactions(
  balances: Map<string, number>
): { from: string; to: string; amount: number }[] {
  // Get all non-zero balances
  const entries = Array.from(balances.entries())
    .map(([person, amount]) => [person, round(amount)] as [string, number])
    .filter(([, amount]) => Math.abs(amount) > 0.01);

  if (entries.length === 0) {
    return [];
  }

  // Split into debtors (negative) and creditors (positive)
  const debtors = entries
    .filter(([, amount]) => amount < 0)
    .sort((a, b) => a[1] - b[1]); // Most negative first (owes the most)

  const creditors = entries
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]); // Most positive first (gets the most)

  const transactions: { from: string; to: string; amount: number }[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const [debtor, debt] = debtors[i];
    const [creditor, credit] = creditors[j];
    const amount = Math.min(Math.abs(debt), credit);
    const roundedAmount = round(amount);

    if (roundedAmount > 0.01) {
      transactions.push({ from: debtor, to: creditor, amount: roundedAmount });
    }

    // Update balances
    debtors[i] = [debtor, round(debt + roundedAmount)];
    creditors[j] = [creditor, round(credit - roundedAmount)];

    // Move to next if settled
    if (Math.abs(debtors[i][1]) < 0.01) i++;
    if (Math.abs(creditors[j][1]) < 0.01) j++;
  }

  return transactions;
}