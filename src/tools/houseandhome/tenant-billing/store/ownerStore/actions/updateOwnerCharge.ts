// src/tools/houseandhome/tenant-billing/store/ownerStore/actions/updateOwnerCharge.ts
import { storage } from '../../../services/storage';
import { getPropagationMonths } from '../helpers';

export const updateOwnerCharge = (set: any, get: any) => async (id: string, data: any) => {
  const charges = get().ownerCharges;
  const idx = charges.findIndex(c => c.id === id);
  if (idx === -1) return;

  const updated = { ...charges[idx], ...data, updatedAt: new Date().toISOString() };

  if (data.paid !== undefined && data.paid !== charges[idx].paid) {
    updated.paidAt = data.paid ? new Date().toISOString() : null;
  }

  if (updated.type === 'meter' && updated.totalBill && updated.totalUnits) {
    updated.rate = updated.totalBill / updated.totalUnits;
  }

  if (updated.type === 'pay-later' && updated.startBalance !== undefined && updated.decrementAmount !== undefined) {
    updated.remainingAmount = Math.max(0, updated.startBalance - updated.decrementAmount);
  }

  const duration = updated.duration || { type: 'permanent', startMonth: updated.startMonth || new Date().toISOString().slice(0, 7) };
  updated.duration = duration;

  // ─── Update yearly file ──────────────────────────────────────
  const { selectedMonth } = (await import('../../uiStore')).useUIStore.getState();
  const year = selectedMonth.substring(0, 4);
  const yearlyData = await storage.readOwnerYear(updated.groupId, year);
  if (!yearlyData || !yearlyData.charges) {
    console.warn('Yearly file not found for update');
    return;
  }

  const chargeIdx = yearlyData.charges.findIndex(c => c.id === id);
  if (chargeIdx !== -1) {
    yearlyData.charges[chargeIdx] = updated;
    yearlyData.updatedAt = new Date().toISOString();
    await storage.writeOwnerYear(updated.groupId, year, yearlyData);
  }

  // ─── Update store ────────────────────────────────────────────
  const newCharges = [...charges];
  newCharges[idx] = updated;
  set({ ownerCharges: newCharges });

  // ─── Propagate to tenants ───────────────────────────────────
  const { tenants } = (await import('../../tenantStore')).useTenantStore.getState();
  const monthsToUpdate = getPropagationMonths(duration, selectedMonth);

  for (const tenantMeta of tenants) {
    if (tenantMeta.groupId !== updated.groupId) continue;

    const tenantStore = (await import('../../tenantStore')).useTenantStore;
    const tenant = await tenantStore.getState().getTenantFull(tenantMeta.id, updated.groupId);
    if (!tenant) continue;

    let tenantUpdated = false;

    for (const month of monthsToUpdate) {
      const bill = tenant.bills[month];
      if (!bill) continue;

      for (const charge of bill.charges) {
        if (charge.ownerChargeId === id) {
          charge.name = updated.name;
          charge.type = updated.type;
          charge.note = updated.note;
          charge.duration = { ...duration };

          if (updated.type === 'meter' && updated.rate !== undefined) {
            charge.rate = updated.rate;
            charge.finalRate = updated.rate;
            if (charge.overrideRate == null) {
              const units = Math.max(0, (charge.currentReading || 0) - (charge.prevReading || 0));
              charge.amount = units * updated.rate;
            }
          } else if (updated.type === 'fixed') {
            charge.lastMonthPaid = updated.fixedAmount || 0;
            charge.amount = updated.fixedAmount || 0;
          } else if (updated.type === 'pay-later') {
            charge.startBalance = updated.startBalance || 0;
            charge.decrementAmount = updated.decrementAmount || 0;
            charge.remainingAmount = Math.max(0, (updated.startBalance || 0) - (updated.decrementAmount || 0));
            charge.amount = Math.min(updated.decrementAmount || 0, updated.startBalance || 0);
          }

          tenantUpdated = true;
        }
      }

      if (bill.charges.some(c => c.ownerChargeId === id)) {
        bill.total = bill.charges.reduce((s: number, c: any) => s + c.amount, 0);
      }
    }

    if (tenantUpdated) {
      await tenantStore.getState().saveTenantFull(tenant);
    }
  }

  console.log('✅ Owner charge updated');
};