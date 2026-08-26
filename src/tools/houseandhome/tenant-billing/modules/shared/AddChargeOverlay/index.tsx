// src/tools/houseandhome/tenant-billing/modules/shared/AddChargeOverlay/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Overlay } from '@/core/components/ui/Overlay';
import { Button } from '@/core/components/ui/Button';
import { Container } from '@/core/components/ui/Container';
import { useOwnerStore } from '../../../store/ownerStore';
import { useTenantStore } from '../../../store/tenantStore';
import { useUIStore } from '../../../store/uiStore';
import { ChargeForm } from './ChargeForm';
import { DurationPicker } from './DurationPicker';
import { TenantSelector } from './TenantSelector';

interface AddChargeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'owner' | 'tenant';
  tenantId?: string;
  groupId: string;
  editingCharge?: any;
  onSuccess?: () => void;
}

export const AddChargeOverlay: React.FC<AddChargeOverlayProps> = ({
  isOpen,
  onClose,
  mode,
  tenantId,
  groupId,
  editingCharge,
  onSuccess,
}) => {
  const { createOwnerCharge, updateOwnerCharge, deleteOwnerCharge } = useOwnerStore();
  const { tenants, addChargeToTenant, deleteTenantCharge } = useTenantStore();
  const { selectedMonth } = useUIStore();
  const isSubmitting = useRef(false);

  // ─── Form State ──────────────────────────────────────────
  const [chargeType, setChargeType] = useState<'meter' | 'fixed' | 'one-time' | 'pay-later'>('meter');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  const [durationType, setDurationType] = useState<'permanent' | 'custom' | 'one-time'>('permanent');
  const [startMonth, setStartMonth] = useState<string>(selectedMonth);
  const [endMonth, setEndMonth] = useState<string>(selectedMonth);

  const [totalBill, setTotalBill] = useState<number>(0);
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [fixedAmount, setFixedAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [decrementAmount, setDecrementAmount] = useState<number>(0);
  const [startBalance, setStartBalance] = useState<number>(0);

  const [applyTo, setApplyTo] = useState<'all' | 'selected'>('all');
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const groupTenants = tenants.filter(t => t.groupId === groupId);

  // ─── Pre-fill form when editing ──────────────────────────
  useEffect(() => {
    if (isOpen && editingCharge) {
      setName(editingCharge.name || '');
      setChargeType(editingCharge.type || 'meter');
      setNote(editingCharge.note || '');
      setDurationType(editingCharge.duration?.type || 'permanent');
      setStartMonth(editingCharge.duration?.startMonth || selectedMonth);
      setEndMonth(editingCharge.duration?.endMonth || selectedMonth);
      setApplyTo(editingCharge.applyTo || 'all');
      setSelectedTenants(editingCharge.selectedTenants || []);
      
      if (editingCharge.type === 'meter') {
        setTotalBill(editingCharge.totalBill || 0);
        setTotalUnits(editingCharge.totalUnits || 0);
      } else if (editingCharge.type === 'fixed') {
        setFixedAmount(editingCharge.fixedAmount || 0);
      } else if (editingCharge.type === 'one-time') {
        setTotalAmount(editingCharge.totalAmount || 0);
      } else if (editingCharge.type === 'pay-later') {
        setDecrementAmount(editingCharge.decrementAmount || 0);
        setStartBalance(editingCharge.startBalance || 0);
      }
    } else if (isOpen) {
      setName('');
      setNote('');
      setDurationType('permanent');
      setStartMonth(selectedMonth);
      setEndMonth(selectedMonth);
      setTotalBill(0);
      setTotalUnits(0);
      setFixedAmount(0);
      setTotalAmount(0);
      setDecrementAmount(0);
      setStartBalance(0);
      setApplyTo('all');
      setSelectedTenants([]);
      setChargeType('meter');
    }
    if (!isOpen) {
      isSubmitting.current = false;
    }
  }, [isOpen, editingCharge, selectedMonth]);

  // ─── Submit ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (isSubmitting.current) {
      console.log('⏳ Already submitting...');
      return;
    }

    if (!name.trim()) {
      alert('Please enter a charge name.');
      return;
    }

    if (applyTo === 'selected' && selectedTenants.length === 0) {
      alert('Please select at least one tenant.');
      return;
    }

    isSubmitting.current = true;

    const duration = {
      type: durationType,
      startMonth: durationType === 'custom' || durationType === 'permanent' ? startMonth : undefined,
      endMonth: durationType === 'custom' ? endMonth : undefined,
    };

    let success = false;

    try {
      if (mode === 'owner') {
        const chargeData: any = {
          groupId,
          name: name.trim(),
          type: chargeType,
          note: note.trim() || undefined,
          duration,
          applyTo,
          selectedTenants: applyTo === 'selected' ? selectedTenants : undefined,
        };

        if (chargeType === 'meter') {
          if (totalBill <= 0 || totalUnits <= 0) {
            alert('Please enter valid bill amount and units.');
            isSubmitting.current = false;
            return;
          }
          chargeData.totalBill = totalBill;
          chargeData.totalUnits = totalUnits;
        } else if (chargeType === 'fixed') {
          if (fixedAmount <= 0) {
            alert('Please enter a valid fixed amount.');
            isSubmitting.current = false;
            return;
          }
          chargeData.fixedAmount = fixedAmount;
        } else if (chargeType === 'one-time') {
          if (totalAmount <= 0) {
            alert('Please enter a valid total amount.');
            isSubmitting.current = false;
            return;
          }
          const targetTenants = applyTo === 'all' ? groupTenants.map(t => t.id) : selectedTenants;
          chargeData.totalAmount = totalAmount;
          chargeData.splitAmong = targetTenants;
        } else if (chargeType === 'pay-later') {
          if (startBalance <= 0 || decrementAmount <= 0) {
            alert('Please enter valid values.');
            isSubmitting.current = false;
            return;
          }
          chargeData.startBalance = startBalance;
          chargeData.decrementAmount = decrementAmount;
          chargeData.totalAmount = startBalance;
          chargeData.splitAmong = applyTo === 'all' ? groupTenants.map(t => t.id) : selectedTenants;
        }

        if (editingCharge) {
          await updateOwnerCharge(editingCharge.id, chargeData);
        } else {
          await createOwnerCharge(chargeData);
        }
        success = true;
      } else if (mode === 'tenant' && tenantId) {
        const chargePayload: any = {
          name: name.trim(),
          type: chargeType,
          note: note.trim() || undefined,
          duration,
          paid: false,
          paidAt: null,
          amount: 0,
        };

        if (chargeType === 'meter') {
          chargePayload.prevReading = 0;
          chargePayload.currentReading = 0;
          chargePayload.unitsUsed = 0;
          chargePayload.rate = 0;
          chargePayload.overrideRate = null;
          chargePayload.finalRate = 0;
          chargePayload.amount = 0;
        } else if (chargeType === 'fixed') {
          if (fixedAmount <= 0) {
            alert('Please enter a valid fixed amount.');
            isSubmitting.current = false;
            return;
          }
          chargePayload.amount = fixedAmount;
          chargePayload.lastMonthPaid = fixedAmount;
          chargePayload.overrideAmount = null;
        } else if (chargeType === 'one-time') {
          if (totalAmount <= 0) {
            alert('Please enter a valid amount.');
            isSubmitting.current = false;
            return;
          }
          chargePayload.amount = totalAmount;
          chargePayload.totalAmount = totalAmount;
          chargePayload.splitAmong = [];
          chargePayload.eachPays = totalAmount;
        } else if (chargeType === 'pay-later') {
          if (startBalance <= 0 || decrementAmount <= 0) {
            alert('Please enter valid values.');
            isSubmitting.current = false;
            return;
          }
          chargePayload.amount = decrementAmount;
          chargePayload.startBalance = startBalance;
          chargePayload.decrementAmount = decrementAmount;
          chargePayload.remainingAmount = startBalance - decrementAmount;
          chargePayload.totalAmount = startBalance;
        }

        await addChargeToTenant(tenantId, selectedMonth, chargePayload);
        success = true;
      }
    } catch (error) {
      console.error('❌ Failed to add charge:', error);
      alert('Failed to add charge. Please try again.');
    }

    isSubmitting.current = false;

    setTimeout(() => {
      onClose();
    }, 10);

    if (success && onSuccess) {
      setTimeout(() => {
        onSuccess();
      }, 200);
    }
  };

  // ─── 🔥 HARD DELETE HANDLER (for BOTH owner and tenant) ──
  const handleDelete = async () => {
    if (!editingCharge) return;

    const chargeName = editingCharge.name || 'this charge';
    if (!confirm(`Are you sure you want to delete "${chargeName}"? It will be removed from ALL months (past, current, future) and moved to Recycle Bin.`)) {
      return;
    }

    try {
      if (mode === 'owner') {
        await deleteOwnerCharge(editingCharge.id);
      } else if (mode === 'tenant' && tenantId) {
        await deleteTenantCharge(tenantId, groupId, editingCharge.id);
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete charge. Please try again.');
    }
  };

  const isEditing = !!editingCharge;
  const title = isEditing 
    ? 'Edit Building Charge' 
    : (mode === 'owner' ? 'Add Building Charge' : 'Add Personal Charge');
  const buttonLabel = isEditing ? 'Save Changes' : 'Add Charge';

  return (
    <Overlay isOpen={isOpen} onClose={onClose}>
      <Container className="max-w-2xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          {title}
        </h2>

        <div className="space-y-4">
          <ChargeForm
            name={name}
            setName={setName}
            chargeType={chargeType}
            setChargeType={setChargeType}
            note={note}
            setNote={setNote}
            totalBill={totalBill}
            setTotalBill={setTotalBill}
            totalUnits={totalUnits}
            setTotalUnits={setTotalUnits}
            fixedAmount={fixedAmount}
            setFixedAmount={setFixedAmount}
            totalAmount={totalAmount}
            setTotalAmount={setTotalAmount}
            decrementAmount={decrementAmount}
            setDecrementAmount={setDecrementAmount}
            startBalance={startBalance}
            setStartBalance={setStartBalance}
            mode={mode}
          />

          <DurationPicker
            durationType={durationType}
            setDurationType={setDurationType}
            startMonth={startMonth}
            setStartMonth={setStartMonth}
            endMonth={endMonth}
            setEndMonth={setEndMonth}
            selectedMonth={selectedMonth}
          />

          {mode === 'owner' && (
            <TenantSelector
              tenants={groupTenants}
              applyTo={applyTo}
              setApplyTo={setApplyTo}
              selectedTenants={selectedTenants}
              toggleTenant={(id) => {
                setSelectedTenants(prev =>
                  prev.includes(id)
                    ? prev.filter(t => t !== id)
                    : [...prev, id]
                );
              }}
            />
          )}

          {/* ─── 🔥 MODIFIED FOOTER ────────────────────────────── */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Left side – Delete button (only when editing) */}
            {isEditing && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </Button>
            )}

            {/* Right side – Cancel / Save */}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-blue-500 text-white hover:bg-blue-600"
                disabled={isSubmitting.current}
              >
                {isSubmitting.current ? 'Saving...' : buttonLabel}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Overlay>
  );
};