// src/tools/houseandhome/tenant-billing/store/tenantStore/actions/refreshTenantBills.ts
import { storage } from '../../../services/storage';

export const refreshTenantBills = (set: any, get: any) => async (tenantId: string, groupId: string) => {
  try {
    // ─── 🔥 FIX: Use getTenantFull instead of readFile ──────
    // This works with the yearly file system
    const tenant = await get().getTenantFull(tenantId, groupId);
    if (!tenant) {
      console.error(`❌ Tenant ${tenantId} not found`);
      return;
    }

    const { selectedMonth } = (await import('../../uiStore')).useUIStore.getState();
    const months = Object.keys(tenant.bills);

    // ─── Sync all months ──────────────────────────────────────
    for (const month of months) {
      await get().syncTenantCharges(tenantId, groupId, month);
    }

    // ─── Also sync the current month if it doesn't exist ────
    if (!tenant.bills[selectedMonth]) {
      await get().syncTenantCharges(tenantId, groupId, selectedMonth);
    }

    console.log(`✅ Refreshed all bills for tenant ${tenant.name}`);
  } catch (error) {
    console.error('Failed to refresh tenant bills:', error);
  }
};