import React, { useState, useRef } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Input } from '@/core/components/ui/Input';
import { Button } from '@/core/components/ui/Button';
import { useSplitStore } from '../store/useSplitStore';
import { Motion } from '@/core/motion/motion';
import { shake } from '@/core/motion/presets/shake';

export function ExpenseFormCard() {
  const { people, addPerson, addExpense, currency } = useSplitStore();
  const [amount, setAmount] = useState('');
  const [payerName, setPayerName] = useState('');
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmedPayer = payerName.trim();

    // ─── REQUIRED: Name ───
    if (!trimmedPayer) {
      setShakeTrigger(prev => prev + 1);
      nameInputRef.current?.focus();
      return;
    }

    const normalizedPayer = trimmedPayer.charAt(0).toUpperCase() + trimmedPayer.slice(1).toLowerCase();

    // ─── Check if person exists ───
    const personExists = people.some(p => p.toLowerCase() === normalizedPayer.toLowerCase());

    // ─── Build the participants list BEFORE adding expense ───
    let updatedPeople = [...people];

    if (!personExists) {
      addPerson(normalizedPayer);
      updatedPeople = [...people, normalizedPayer];
    }

    // ─── Get final payer from UPDATED list ───
    const finalPayer = updatedPeople.find(p => p.toLowerCase() === normalizedPayer.toLowerCase()) || normalizedPayer;
    const finalAmount = amount.trim() ? parseFloat(amount) : 0;

    // ─── Add expense with UPDATED participants list ───
    addExpense({
      description: 'Expense',
      amount: finalAmount,
      payer: finalPayer,
      participants: updatedPeople.length > 0 ? updatedPeople : [finalPayer],
    });

    setAmount('');
    setPayerName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        {/* Row 1: Amount (Optional) */}
        <Input
          type="number"
          placeholder="Amount"
          prefix={currency}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full"
          onKeyDown={handleKeyDown}
        />

        {/* Row 2: Who paid? (REQUIRED) */}
        <div className="w-full">
          {shakeTrigger > 0 ? (
            <Motion
              key={shakeTrigger}
              preset={shake}
              as="div"
              duration={500}
              easing="ease-in-out"
              className="w-full"
            >
              <Input
                ref={nameInputRef}
                id="payer-name-input"
                placeholder="Who paid? * (PabitraMS)"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                className="w-full"
                onKeyDown={handleKeyDown}
                required
              />
            </Motion>
          ) : (
            <Input
              ref={nameInputRef}
              id="payer-name-input"
              placeholder="Who paid? * (PabitraMS)"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              className="w-full"
              onKeyDown={handleKeyDown}
              required
            />
          )}
        </div>

        {/* Row 3: Add Expense button */}
        <Button
          onClick={handleSubmit}
          className="w-full"
          variant="primary"
        >
          Add Expense
        </Button>
      </div>
    </Card>
  );
}