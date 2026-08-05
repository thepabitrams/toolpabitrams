import React, { useEffect, useState } from 'react';
import { Card } from '@/core/components/ui/Card';
import { BSSelect } from './BSSelect';  // 👈 Your Bill Select tool
import { useSplitStore } from '../store/useSplitStore';
import { CURRENCIES } from '../data/currencyData';
import { useUserCurrency } from '../hooks/useUserCurrency';

export function CurrencyCard() {
  const { currency, setCurrency } = useSplitStore();
  const { detectedCurrency, isLoading } = useUserCurrency();
  const [hasSetDefault, setHasSetDefault] = useState(false);

  useEffect(() => {
    if (!isLoading && detectedCurrency && !currency && !hasSetDefault) {
      setCurrency(detectedCurrency);
      setHasSetDefault(true);
    }
  }, [detectedCurrency, isLoading, currency, setCurrency, hasSetDefault]);

  const selectedCurrency = CURRENCIES.find(c => c.value === currency);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className="text-lg font-medium text-gray-500 dark:text-gray-400 min-w-[28px] text-center flex-shrink-0">
          {selectedCurrency?.symbol || '💱'}
        </span>

        {/* BSSelect in action */}
        <BSSelect
          value={currency}
          onChange={setCurrency}
          options={CURRENCIES}
          placeholder="Select currency..."
          searchable={true}
          detectedValue={detectedCurrency}
          detectedLabel="Detected"
          renderOption={(option) => (
            <span className="flex items-center gap-2">
              <span className="text-base text-gray-500">{option.symbol}</span>
              <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
            </span>
          )}
          renderSelected={(option) => (
            <span className="flex items-center gap-2">
              <span className="text-base text-gray-500">{option.symbol}</span>
              <span className="text-gray-900 dark:text-gray-100">{option.label}</span>
            </span>
          )}
        />
      </div>
    </Card>
  );
}