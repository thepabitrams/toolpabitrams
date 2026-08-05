import React from 'react';
import { Card } from '@/core/components/ui/Card';
import { useSplitStore } from '../store/useSplitStore';
import { useSettlement } from '../hooks/useSettlement';

export function TotalsCard() {
  const { currency } = useSplitStore();
  const { total, perPerson } = useSettlement();

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-sm text-gray-500">Total Spent</div>
          <div className="text-2xl font-bold text-green-700">
            {currency} {total.toFixed(2)}
          </div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-500">Per Person</div>
          <div className="text-2xl font-bold text-blue-700">
            {currency} {perPerson.toFixed(2)}
          </div>
        </div>
      </div>
    </Card>
  );
}