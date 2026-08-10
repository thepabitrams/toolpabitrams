// src/tools/houseandhome/tenant-billing/modules/owner/OwnerChargesCard/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import { Button } from '@/core/components/ui/Button';
import { useOwnerStore } from '../../../store/ownerStore';
import { useTenantStore } from '../../../store/tenantStore';
import { useUIStore } from '../../../store/uiStore';
import { formatMonth } from '../../../core/constants';
import { shouldChargeBeInMonth } from '../../../store/ownerStore/helpers';
import { AddChargeOverlay } from '../../shared/AddChargeOverlay';
import { MeterCharge } from './MeterCharge';
import { FixedCharge } from './FixedCharge';
import { OneTimeCharge } from './OneTimeCharge';
import { PayLaterCharge } from './PayLaterCharge';
import { MdAdd } from 'react-icons/md';
import { Motion } from '@/core/motion/motion';
import { zoomIn } from '@/core/motion/presets/zoomIn';
import { zoomOut } from '@/core/motion/presets/zoomOut';

export const OwnerCharges = () => {
  const { selectedGroupId, ownerCharges, updateOwnerCharge, loadOwnerCharges } = useOwnerStore();
  const { tenants } = useTenantStore();
  const { selectedMonth } = useUIStore();
  const [showOverlay, setShowOverlay] = useState(false);
  const [chargeToEdit, setChargeToEdit] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localCharges, setLocalCharges] = useState<any[]>([]);
  const prevChargeCount = useRef(ownerCharges.length);
  const overlayCloseTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const allGroupCharges = ownerCharges.filter(c => c.groupId === selectedGroupId);
    const active = allGroupCharges.filter(charge => 
      shouldChargeBeInMonth(charge.duration, selectedMonth)
    );
    setLocalCharges(active);
  }, [ownerCharges, selectedGroupId, selectedMonth]);

  useEffect(() => {
    const currentCount = ownerCharges.length;
    if (currentCount > prevChargeCount.current && showOverlay) {
      setShowOverlay(false);
      setChargeToEdit(null);
      if (overlayCloseTimer.current) {
        clearTimeout(overlayCloseTimer.current);
        overlayCloseTimer.current = null;
      }
    }
    prevChargeCount.current = currentCount;
  }, [ownerCharges, showOverlay]);

  const handleRefresh = () => {
    if (selectedGroupId) {
      loadOwnerCharges(selectedGroupId);
    }
  };

  const isPastMonth = (): boolean => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return selectedMonth < currentMonth;
  };

  const groupTenants = tenants.filter(t => t.groupId === selectedGroupId);

  const handleChargeUpdate = async (chargeId: string, updatedCharge: any) => {
    await updateOwnerCharge(chargeId, updatedCharge);
    handleRefresh();
  };

  const handleEditCharge = (charge: any) => {
    setChargeToEdit(charge);
    setShowOverlay(true);
  };

  const handleCloseOverlay = () => {
    setShowOverlay(false);
    setChargeToEdit(null);
  };

  const handleTogglePaid = async (chargeId: string) => {
    const charge = ownerCharges.find(c => c.id === chargeId);
    if (!charge) return;
    const newPaid = !charge.paid;
    await updateOwnerCharge(chargeId, {
      paid: newPaid,
      paidAt: newPaid ? new Date().toISOString() : null,
    });
    handleRefresh();
  };

  const renderCharge = (charge: any) => {
    const isDeleting = deletingId === charge.id;
    const props = {
      charge,
      onUpdate: (updated: any) => handleChargeUpdate(charge.id, updated),
      onEdit: () => handleEditCharge(charge),
      onTogglePaid: () => handleTogglePaid(charge.id),
      isReadOnly: isPastMonth(),
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
            {selectedGroupId ? (
              <span className="ml-2 text-xs text-gray-400">
                {groupTenants.length} tenants
              </span>
            ) : (
              <span className="ml-2 text-xs text-gray-400">No group selected</span>
            )}
          </h3>
          <span className="text-xs text-gray-400">{localCharges.length} charges</span>
        </div>

        <Container className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-3 max-h-[400px] overflow-y-auto">
          {!selectedGroupId ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
              Select a property to see charges.
            </div>
          ) : localCharges.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
              No active charges for {formatMonth(selectedMonth)}.
            </div>
          ) : (
            localCharges.map(charge => renderCharge(charge))
          )}
        </Container>

        <div className="flex justify-end mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setChargeToEdit(null);
              setShowOverlay(true);
            }}
            className="flex items-center gap-1 text-blue-500 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
            disabled={!selectedGroupId || isPastMonth()}
          >
            <MdAdd size={16} /> Add Charge
          </Button>
        </div>
      </Card>

      <AddChargeOverlay
        isOpen={showOverlay}
        onClose={handleCloseOverlay}
        mode="owner"
        groupId={selectedGroupId!}
        editingCharge={chargeToEdit}
        onSuccess={handleRefresh}
      />
    </>
  );
};

export default OwnerCharges;