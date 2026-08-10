// src/tools/houseandhome/tenant-billing/modules/tenants/TenantDetail/ChargesCard/MeterCharge.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Input } from '@/core/components/ui/Input';
import { MdContentCopy, MdCheck, MdEdit, MdClose } from 'react-icons/md';
import { copyService } from '../../../../services/copy';
import { formatMonth } from '../../../../core/constants';

interface MeterChargeProps {
  charge: any;
  onUpdate: (c: any) => void;
  onTogglePaid: () => void;
  onEdit: () => void;
  isReadOnly?: boolean;
}

export const MeterCharge: React.FC<MeterChargeProps> = ({
  charge,
  onUpdate,
  onTogglePaid,
  onEdit,
  isReadOnly = false,
}) => {
  const [prevReading, setPrevReading] = useState(charge.prevReading ?? 0);
  const [currentReading, setCurrentReading] = useState(charge.currentReading ?? 0);
  const [overrideRate, setOverrideRate] = useState(charge.overrideRate ?? null);
  const [note, setNote] = useState(charge.note ?? '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPrevReading(charge.prevReading ?? 0);
    setCurrentReading(charge.currentReading ?? 0);
    setOverrideRate(charge.overrideRate ?? null);
    setNote(charge.note ?? '');
  }, [charge]);

  const units = Math.max(0, currentReading - prevReading);
  const effectiveRate = overrideRate !== null ? overrideRate : charge.rate || 0;
  const amount = units * effectiveRate;

  useEffect(() => {
    onUpdate({
      ...charge,
      prevReading,
      currentReading,
      unitsUsed: units,
      overrideRate,
      finalRate: effectiveRate,
      amount,
      note,
    });
  }, [prevReading, currentReading, overrideRate, note, units, effectiveRate, amount]);

  const getDurationLabel = () => {
    const d = charge.duration;
    if (!d) return '';
    if (d.type === 'permanent') return 'Permanent';
    if (d.type === 'one-time') return 'One-Time';
    if (d.type === 'custom' && d.startMonth && d.endMonth) {
      return `Custom: ${formatMonth(d.startMonth)} → ${formatMonth(d.endMonth)}`;
    }
    return '';
  };

  const handleCopy = async () => {
    const text = `${charge.name}: ${units} units × $${effectiveRate.toFixed(4)} = $${amount.toFixed(2)}`;
    await copyService.copyText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const paidAtText = charge.paidAt ? new Date(charge.paidAt).toLocaleString() : '';

  return (
    <Card className="p-4 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{charge.name}</span>
          <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
            {getDurationLabel() || 'Meter'}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={onEdit} className="p-1.5 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors duration-200" title="Edit charge"><MdEdit size={18} /></button>
          <button onClick={handleCopy} className={`p-1.5 rounded-full transition-all duration-200 ${copied ? 'text-green-500 bg-green-50 scale-110' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`} title="Copy to clipboard"><MdContentCopy size={18} />{copied && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-gray-800 text-white px-2 py-0.5 rounded whitespace-nowrap">Copied!</span>}</button>
          <button onClick={onTogglePaid} className={`p-1.5 rounded-full transition-colors ${charge.paid ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`} title={charge.paid ? 'Mark as unpaid' : 'Mark as paid'}>
            <MdCheck size={20} className={charge.paid ? 'text-green-500' : 'opacity-30'} />
          </button>
          {/* ❌ DELETE BUTTON REMOVED */}
        </div>
      </div>

      <div className="space-y-2 mt-2">
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="text-xs text-gray-500 block">Prev</label>
            <Input type="number" step="0.01" value={prevReading} onChange={(e) => setPrevReading(parseFloat(e.target.value) || 0)} className={`w-full text-sm ${isReadOnly ? 'bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed opacity-60' : ''}`} disabled={isReadOnly} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block">Curr</label>
            <Input type="number" step="0.01" value={currentReading} onChange={(e) => setCurrentReading(parseFloat(e.target.value) || 0)} className={`w-full text-sm ${isReadOnly ? 'bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed opacity-60' : ''}`} disabled={isReadOnly} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block">Rate</label>
            <Input type="number" step="0.001" value={charge.rate ?? 0} className="w-full text-sm bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed opacity-60" disabled />
          </div>
          <div>
            <label className="text-xs text-gray-500 block">Override</label>
            <Input type="number" step="0.001" value={overrideRate !== null ? overrideRate : ''} onChange={(e) => setOverrideRate(e.target.value ? parseFloat(e.target.value) : null)} className={`w-full text-sm ${isReadOnly ? 'bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed opacity-60' : ''}`} disabled={isReadOnly} placeholder="Default" />
          </div>
        </div>

        <div>
          <Input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className={`w-full text-xs ${isReadOnly ? 'bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed opacity-60' : ''}`} disabled={isReadOnly} />
        </div>

        <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {charge.paid ? (
              <>
                <MdCheck className="text-green-500" size={18} />
                <span className="text-xs text-green-600 font-medium">Paid</span>
                {paidAtText && <span className="text-xs text-gray-500">on {paidAtText}</span>}
              </>
            ) : (
              <>
                <MdClose className="text-red-500" size={18} />
                <span className="text-xs text-red-500 font-medium">Unpaid</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Units: {units}</span>
            <span className="text-xs text-gray-500">Total:</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">${amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};