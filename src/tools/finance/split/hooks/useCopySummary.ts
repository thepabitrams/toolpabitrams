import { useCallback } from 'react';
import { formatSummaryText } from '../utils/formatSummary';

interface UseCopySummaryProps {
  currency: string;
  total: number;
  perPerson: number;
  people: string[];
  transactions: { from: string; to: string; amount: number }[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function useCopySummary({
  currency,
  total,
  perPerson,
  people,
  transactions,
  onSuccess,
  onError,
}: UseCopySummaryProps) {
  const copySummary = useCallback(async () => {
    try {
      const text = formatSummaryText({
        currency,
        total,
        perPerson,
        people,
        transactions,
      });
      await navigator.clipboard.writeText(text);
      onSuccess('Copied');
    } catch (err) {
      console.error('Copy failed:', err);
      onError('Failed to copy');
    }
  }, [currency, total, perPerson, people, transactions, onSuccess, onError]);

  return { copySummary };
}