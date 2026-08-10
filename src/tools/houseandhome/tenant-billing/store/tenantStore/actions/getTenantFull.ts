// src/tools/houseandhome/tenant-billing/store/tenantStore/actions/getTenantFull.ts
import { storage } from '../../../services/storage';

export const getTenantFull = (set: any, get: any) => async (id: string, groupId: string) => {
  try {
    const meta = get().tenants.find((t: any) => t.id === id);
    if (!meta) {
      console.warn('⚠️ Tenant meta not found for id:', id);
      return null;
    }

    const profile = await storage.readTenantProfile(groupId, meta.name);
    if (!profile) {
      console.warn('⚠️ Tenant profile not found for:', meta.name);
      return null;
    }

    const bills: any = {};
    try {
      const tenantFolder = await storage.getTenantPath(groupId, meta.name);
      for await (const entry of tenantFolder.values()) {
        if (entry.kind === 'file' && entry.name !== 'profile.json' && entry.name !== 'images') {
          const year = entry.name.replace('.json', '');
          const data = await storage.readTenantYear(groupId, meta.name, year);
          if (data && data.bills) {
            Object.assign(bills, data.bills);
          }
        }
      }
    } catch (e) {}

    const tenant = {
      id,
      ownerId: groupId,
      ...profile,
      bills,
    };

    const { selectedMonth } = (await import('../../uiStore')).useUIStore.getState();
    const updatedTenant = await get().syncTenantCharges(id, groupId, selectedMonth, tenant);

    return updatedTenant || tenant;
  } catch (error) {
    console.error('❌ getTenantFull error:', error);
    return null;
  }
};