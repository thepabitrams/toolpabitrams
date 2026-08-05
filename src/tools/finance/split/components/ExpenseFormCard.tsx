import React, { useState, useRef } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Input } from '@/core/components/ui/Input';
import { Button } from '@/core/components/ui/Button';
import { useSplitStore } from '../store/useSplitStore';
import { Motion } from '@/core/motion/motion';
import { shake } from '@/core/motion/presets/shake';

export function ExpenseFormCard() {
  const { people, addPerson, addExpense, currency } = useSplitStore();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payerName, setPayerName] = useState('');
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmedPayer = payerName.trim();
    
    // ONLY required field: Name → SHAKE!
    if (!trimmedPayer) {
      setShakeTrigger(prev => prev + 1);
      nameInputRef.current?.focus();
      return;
    }

    const normalizedPayer = trimmedPayer.charAt(0).toUpperCase() + trimmedPayer.slice(1).toLowerCase();
    if (!people.some(p => p.toLowerCase() === normalizedPayer.toLowerCase())) {
      addPerson(normalizedPayer);
    }

    const finalPayer = people.find(p => p.toLowerCase() === normalizedPayer.toLowerCase()) || normalizedPayer;
    const finalDescription = description.trim() || 'Expense';
    const finalAmount = amount.trim() ? parseFloat(amount) : 0;

    addExpense({
      description: finalDescription,
      amount: finalAmount,
      payer: finalPayer,
      participants: people.length > 0 ? people : [finalPayer],
    });

    setDescription('');
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
        {/* Row 1: What for? (Optional) */}
        <Input
          placeholder="What for? (e.g., Dinner)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* Row 2: Amount (Optional) + Who paid? (REQUIRED) */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="number"
            placeholder="Amount"
            prefix={currency}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1"
            onKeyDown={handleKeyDown}
          />
          
          {/* Shake wrapper - only active when shakeTrigger > 0 */}
          <div className="flex-1">
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