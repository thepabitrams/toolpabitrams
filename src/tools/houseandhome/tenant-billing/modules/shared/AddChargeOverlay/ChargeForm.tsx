// src/tools/houseandhome/tenant-billing/modules/shared/AddChargeOverlay/ChargeForm.tsx
import React from 'react';
import { Input } from '@/core/components/ui/Input';
import { Select } from '@/core/components/ui/Select';

interface ChargeFormProps {
  name: string;
  setName: (val: string) => void;
  chargeType: 'meter' | 'fixed' | 'one-time' | 'pay-later';
  setChargeType: (val: any) => void;
  note: string;
  setNote: (val: string) => void;
  totalBill: number;
  setTotalBill: (val: number) => void;
  totalUnits: number;
  setTotalUnits: (val: number) => void;
  fixedAmount: number;
  setFixedAmount: (val: number) => void;
  totalAmount: number;
  setTotalAmount: (val: number) => void;
  decrementAmount: number;
  setDecrementAmount: (val: number) => void;
  startBalance: number;
  setStartBalance: (val: number) => void;
  mode: 'owner' | 'tenant';
}

export const ChargeForm: React.FC<ChargeFormProps> = ({
  name,
  setName,
  chargeType,
  setChargeType,
  note,
  setNote,
  totalBill,
  setTotalBill,
  totalUnits,
  setTotalUnits,
  fixedAmount,
  setFixedAmount,
  totalAmount,
  setTotalAmount,
  decrementAmount,
  setDecrementAmount,
  startBalance,
  setStartBalance,
  mode,
}) => {
  // ─── Charge Type Options ──────────────────────────────────
  const typeOptions = [
    { value: 'meter', label: 'Meter Reading' },
    { value: 'fixed', label: 'Fixed Amount' },
    { value: 'one-time', label: 'One-Time' },
    { value: 'pay-later', label: 'Pay Later (Decrement)' }, // 🔥 NEW
  ];

  // ─── Render pattern-specific fields ──────────────────────
  const renderPatternFields = () => {
    switch (chargeType) {
      case 'meter':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Bill ($)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={totalBill || ''}
                onChange={(e) => setTotalBill(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Units
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={totalUnits || ''}
                onChange={(e) => setTotalUnits(parseFloat(e.target.value) || 0)}
              />
            </div>
            {totalUnits > 0 && (
              <div className="col-span-2 text-sm text-gray-500">
                Per unit rate: ${(totalBill / totalUnits).toFixed(4)}
              </div>
            )}
          </div>
        );

      case 'fixed':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fixed Amount ($)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={fixedAmount || ''}
              onChange={(e) => setFixedAmount(parseFloat(e.target.value) || 0)}
            />
          </div>
        );

      case 'one-time':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Amount ($)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={totalAmount || ''}
              onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
            />
          </div>
        );

      case 'pay-later':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Starting Balance ($)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={startBalance || ''}
                onChange={(e) => setStartBalance(parseFloat(e.target.value) || 0)}
                placeholder="e.g., 1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Decrement Amount ($)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={decrementAmount || ''}
                onChange={(e) => setDecrementAmount(parseFloat(e.target.value) || 0)}
                placeholder="e.g., 200"
              />
            </div>
            {startBalance > 0 && decrementAmount > 0 && (
              <div className="col-span-2 text-sm text-gray-500">
                Months to pay: {Math.ceil(startBalance / decrementAmount)}
                &nbsp;· Last payment: ${(startBalance % decrementAmount || decrementAmount).toFixed(2)}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* ─── Charge Name ────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Charge Name
        </label>
        <Input
          placeholder="e.g., Electricity Bill"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
        />
      </div>

      {/* ─── Charge Type ────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Type
        </label>
        <Select
          options={typeOptions}
          value={chargeType}
          onChange={(value) => setChargeType(value as any)}
          className="w-full"
        />
      </div>

      {/* ─── Pattern-specific Fields ────────────────────────── */}
      {renderPatternFields()}

      {/* ─── Note ────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Note (optional)
        </label>
        <Input
          placeholder="e.g., Sub-meter reading"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
};