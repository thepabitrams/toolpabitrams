// src/tools/houseandhome/tenant-billing/modules/owner/OwnerChargesCard/FixedCharge.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Input } from '@/core/components/ui/Input';
import { MdContentCopy, MdEdit, MdCheck, MdClose } from 'react-icons/md';
import { copyService } from '../../../services/copy';
import { formatMonth } from '../../../core/constants';

interface FixedChargeProps {
  charge: any;
  onUpdate: (c: any) => void;
  onEdit: () => void;
  onTogglePaid?: () => void;
  isReadOnly?: boolean;
}

export const FixedCharge: React.FC<FixedChargeProps> = ({
  charge,
  onUpdate,
  onEdit,
  onTogglePaid,
  isReadOnly = false,
}) => {
  const [fixedAmount, setFixedAmount] = useState(charge.fixedAmount ?? 0);
  const [note, setNote] = useState(charge.note ?? '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFixedAmount(charge.fixedAmount ?? 0);
    setNote(charge.note ?? '');
  }, [charge]);

  useEffect(() => {
    onUpdate({ ...charge, fixedAmount, note });
  }, [fixedAmount, note]);

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

  const tenantCount = charge.applyTo === 'all' ? 'All tenants' : `${charge.selectedTenants?.length || 0} tenants selected`;

  const handleCopy = async () => {
    const text = `${charge.name}\nAmount: $${fixedAmount.toFixed(2)}`;
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
            {getDurationLabel() || 'Fixed'}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={onEdit} className="p-1.5 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors duration-200" title="Edit charge"><MdEdit size={18} /></button>
          <button onClick={handleCopy} className={`p-1.5 rounded-full transition-all duration-200 ${copied ? 'text-green-500 bg-green-50 scale-110' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`} title="Copy to clipboard"><MdContentCopy size={18} />{copied && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-gray-800 text-white px-2 py-0.5 rounded whitespace-nowrap">Copied!</span>}</button>
          {onTogglePaid && (
            <button onClick={onTogglePaid} className={`p-1.5 rounded-full transition-colors ${charge.paid ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`} title={charge.paid ? 'Mark as unpaid' : 'Mark as paid'}>
              <MdCheck size={20} className={charge.paid ? 'text-green-500' : 'opacity-30'} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mt-2">
        <div>
          <label className="text-xs text-gray-500 block">Amount ($)</label>
          <Input type="number" step="0.01" value={fixedAmount} onChange={(e) => setFixedAmount(parseFloat(e.target.value) || 0)} className={`w-full text-sm ${isReadOnly ? 'bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed opacity-60' : ''}`} disabled={isReadOnly} placeholder="0.00" />
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
          <div className="text-xs text-gray-400">{tenantCount}</div>
        </div>
      </div>
    </Card>
  );
};