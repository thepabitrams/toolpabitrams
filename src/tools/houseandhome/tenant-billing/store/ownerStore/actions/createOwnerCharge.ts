// src/tools/houseandhome/tenant-billing/store/ownerStore/actions/createOwnerCharge.ts
import { storage } from '../../../services/storage';
import { OwnerCharge } from '../../../core/types';
import { getPropagationMonths, buildTenantCharge } from '../helpers';

export const createOwnerCharge = (set: any, get: any) => async (chargeData: Omit<OwnerCharge, 'id' | 'createdAt' | 'updatedAt' | 'rate' | 'eachPays' | 'paid' | 'paidAt'>) => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const { selectedMonth } = (await import('../../uiStore')).useUIStore.getState();
  const year = selectedMonth.substring(0, 4);

  let rate: number | undefined;
  let eachPays: number | undefined;

  if (chargeData.type === 'meter' && chargeData.totalUnits && chargeData.totalBill) {
    rate = chargeData.totalBill / chargeData.totalUnits;
  }
  if (chargeData.type === 'one-time' && chargeData.totalAmount && chargeData.splitAmong) {
    eachPays = chargeData.totalAmount / chargeData.splitAmong.length;
  }

  const duration = chargeData.duration || { type: 'permanent', startMonth: selectedMonth };

  const newCharge: OwnerCharge = {
    ...chargeData,
    id,
    rate,
    eachPays,
    paid: false,
    paidAt: null,
    duration,
    createdAt: now,
    updatedAt: now,
  };

  // ─── Write to yearly file ──────────────────────────────────
  let yearlyData = await storage.readOwnerYear(chargeData.groupId, year);
  if (!yearlyData || !yearlyData.charges) {
    yearlyData = { year, charges: [], updatedAt: new Date().toISOString() };
  }

  yearlyData.charges.push(newCharge);
  yearlyData.updatedAt = new Date().toISOString();
  await storage.writeOwnerYear(chargeData.groupId, year, yearlyData);

  // ─── Update store ────────────────────────────────────────────
  const allCharges = get().ownerCharges || [];
  set({ ownerCharges: [...allCharges, newCharge] });

  // ─── Propagate to tenants ───────────────────────────────────
  const { tenants } = (await import('../../tenantStore')).useTenantStore.getState();
  const groupTenants = tenants.filter(t => t.groupId === chargeData.groupId);

  let selectedTenantIds: string[] = [];
  if (chargeData.applyTo === 'all') {
    selectedTenantIds = groupTenants.map(t => t.id);
  } else if (chargeData.applyTo === 'selected' && chargeData.selectedTenants) {
    selectedTenantIds = chargeData.selectedTenants.filter(id =>
      groupTenants.some(t => t.id === id)
    );
  }

  console.log(`🎯 Propagating "${chargeData.name}" to ${selectedTenantIds.length} tenants`);

  const monthsToPropagate = getPropagationMonths(duration, selectedMonth);

  for (const tenantId of selectedTenantIds) {
    const tenantStore = (await import('../../tenantStore')).useTenantStore;
    const tenant = await tenantStore.getState().getTenantFull(tenantId, chargeData.groupId);
    if (!tenant) continue;

    for (const month of monthsToPropagate) {
      const tenantCharge = buildTenantCharge(newCharge, month, rate, eachPays);

      if (!tenant.bills[month]) {
        tenant.bills[month] = { month, charges: [], total: 0, paid: false };
      }

      tenant.bills[month].charges = tenant.bills[month].charges.filter(
        (c: any) => c.ownerChargeId !== id
      );
      tenant.bills[month].charges.push(tenantCharge);
      tenant.bills[month].total = tenant.bills[month].charges.reduce(
        (s: number, c: any) => s + c.amount, 0
      );
    }

    await tenantStore.getState().saveTenantFull(tenant);
  }

  console.log(`✅ Owner charge "${chargeData.name}" created`);
  return newCharge;
};