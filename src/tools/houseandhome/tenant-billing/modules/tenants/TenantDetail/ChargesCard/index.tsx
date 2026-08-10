// src/tools/houseandhome/tenant-billing/modules/tenants/TenantDetail/ChargesCard/index.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { Button } from '@/core/components/ui/Button';
import { formatMonth } from '../../../../core/constants';
import { AddChargeOverlay } from '../../../shared/AddChargeOverlay';
import { MeterCharge } from './MeterCharge';
import { FixedCharge } from './FixedCharge';
import { OneTimeCharge } from './OneTimeCharge';
import { PayLaterCharge } from './PayLaterCharge';
import { MdAdd, MdLock, MdCheckCircle } from 'react-icons/md';
import { Motion } from '@/core/motion/motion';
import { zoomIn } from '@/core/motion/presets/zoomIn';
import { zoomOut } from '@/core/motion/presets/zoomOut';
import { useTenantStore } from '../../../../store/tenantStore';

interface ChargesCardProps {
  tenantId: string;
  groupId: string;
  charges: any[];
  onChargesChange: (charges: any[]) => void;
  selectedMonth: string;
  isReadOnly?: boolean;
  onRefresh?: () => void;
}

export const ChargesCard: React.FC<ChargesCardProps> = ({
  tenantId,
  groupId,
  charges,
  onChargesChange,
  selectedMonth,
  isReadOnly = false,
  onRefresh,
}) => {
  const { deleteTenantCharge } = useTenantStore();
  const [showOverlay, setShowOverlay] = useState(false);
  const [chargeToEdit, setChargeToEdit] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localCharges, setLocalCharges] = useState(charges);

  // ─── Watch charges prop ──────────────────────────────────────
  useEffect(() => {
    setLocalCharges(charges);
  }, [charges]);

  const handleEditCharge = (charge: any) => {
    setChargeToEdit(charge);
    setShowOverlay(true);
  };

  const handleCloseOverlay = () => {
    setShowOverlay(false);
    setChargeToEdit(null);
  };

  const handleChargeUpdate = (chargeId: string, updatedCharge: any) => {
    const updatedCharges = localCharges.map(c => 
      c.id === chargeId ? updatedCharge : c
    );
    setLocalCharges(updatedCharges);
    onChargesChange(updatedCharges);
  };

  // ─── 🔥 DELETE HANDLER FOR OVERLAY (hard delete) ──────────
  const handleDeleteFromOverlay = async (chargeId: string) => {
    if (!confirm('Delete this charge from ALL months? It will go to Recycle Bin.')) return;
    
    setDeletingId(chargeId);
    
    setTimeout(async () => {
      try {
        await deleteTenantCharge(tenantId, groupId, chargeId);
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error('Failed to delete charge:', error);
        alert('Failed to delete charge. Please try again.');
      }
      setDeletingId(null);
      setShowOverlay(false);
      setChargeToEdit(null);
    }, 300);
  };

  const handleTogglePaid = (chargeId: string) => {
    const updatedCharges = localCharges.map(c => {
      if (c.id === chargeId) {
        return { 
          ...c, 
          paid: !c.paid, 
          paidAt: !c.paid ? new Date().toISOString() : null 
        };
      }
      return c;
    });
    setLocalCharges(updatedCharges);
    onChargesChange(updatedCharges);
  };

  const allChargesPaid = localCharges.length > 0 && localCharges.every((c: any) => c.paid === true);
  const total = localCharges.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

  const renderCharge = (charge: any) => {
    const isDeleting = deletingId === charge.id;
    const props = {
      charge,
      onUpdate: (updated: any) => handleChargeUpdate(charge.id, updated),
      onTogglePaid: () => handleTogglePaid(charge.id),
      onEdit: () => handleEditCharge(charge),
      isReadOnly,
    };

    let ChargeComponent;
    switch (charge.type) {
      case 'meter':
        ChargeComponent = MeterCharge;
        break;
      case 'fixed':
        ChargeComponent = FixedCharge;
        break;
      case 'one-time':
        ChargeComponent = OneTimeCharge;
        break;
      case 'pay-later':
        ChargeComponent = PayLaterCharge;
        break;
      default:
        return null;
    }

    return (
      <Motion
        key={charge.id}
        preset={isDeleting ? zoomOut : zoomIn}
        delay={0}
        style={{ opacity: 0, transform: 'scale(0.95)' }}
      >
        <ChargeComponent {...props} />
      </Motion>
    );
  };

  return (
    <>
      <Card className="p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {formatMonth(selectedMonth)}
            {isReadOnly && (
              <span className="ml-2 text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <MdLock className="w-3 h-3" size={12} />
                Read-Only
              </span>
            )}
          </h3>
          <span className="text-xs text-gray-400">{localCharges.length} charges</span>
        </div>

        <Container className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-3 max-h-[400px] overflow-y-auto">
          {localCharges.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
              No charges for this month.
            </div>
          ) : (
            localCharges.map(charge => renderCharge(charge))
          )}
        </Container>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Total: ${total.toFixed(2)}
            </span>
            {allChargesPaid && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                <MdCheckCircle className="w-3.5 h-3.5" />
                Paid
              </span>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setChargeToEdit(null);
              setShowOverlay(true);
            }}
            className="flex items-center gap-1 text-blue-500 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
            disabled={isReadOnly}
          >
            <MdAdd size={16} /> Add Personal Charge
          </Button>
        </div>
      </Card>

      <AddChargeOverlay
        isOpen={showOverlay}
        onClose={handleCloseOverlay}
        mode="tenant"
        tenantId={tenantId}
        groupId={groupId}
        editingCharge={chargeToEdit}
        onSuccess={onRefresh}
        onDeleteCharge={handleDeleteFromOverlay}  // 👈 Pass delete handler
      />
    </>
  );
};