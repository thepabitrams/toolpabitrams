import React from 'react';
import { Card } from '@/core/components/ui/Card';
import { IconButton } from '@/core/components/ui/IconButton';
import { useSettlement } from '../hooks/useSettlement';
import { useSplitStore } from '../store/useSplitStore';
import { MdSwapHoriz, MdContentCopy, MdCheckCircle } from 'react-icons/md';

export function SettlementCard() {
  const { transactions } = useSettlement();
  const { currency } = useSplitStore();

  const copyTransaction = (from: string, to: string, amount: number) => {
    const text = `${from} → ${to}: ${currency} ${amount.toFixed(2)}`;
    navigator.clipboard.writeText(text);
  };

  const hasResults = transactions.length > 0;

  return (
    <Card className="p-4">
      {/* Header with Material icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MdSwapHoriz className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Who Pays Whom
          </span>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Scrollable transaction list */}
      <div className="max-h-60 overflow-y-auto space-y-2">
        {!hasResults ? (
          <div className="text-center py-6 text-gray-400 dark:text-gray-500">
            <p className="text-sm">Add expenses to see who pays whom</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-6">
            <MdCheckCircle className="w-8 h-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">All settled! 🎉</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Everyone has paid their share</p>
          </div>
        ) : (
          transactions.map((tx, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{tx.from}</span>
                <span className="text-gray-400 dark:text-gray-500">→</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{tx.to}</span>
                <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">
                  {currency} {tx.amount.toFixed(2)}
                </span>
              </div>
              <IconButton
                onClick={() => copyTransaction(tx.from, tx.to, tx.amount)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                aria-label={`Copy ${tx.from} → ${tx.to} ${currency} ${tx.amount.toFixed(2)}`}
              >
                <MdContentCopy className="w-4 h-4" />
              </IconButton>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}