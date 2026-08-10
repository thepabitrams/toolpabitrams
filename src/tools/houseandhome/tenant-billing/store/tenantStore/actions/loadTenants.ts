// src/tools/houseandhome/tenant-billing/store/tenantStore/actions/loadTenants.ts
import { storage } from '../../../services/storage';
import { metadata } from '../../../services/metadata';

export const loadTenants = (set: any, get: any) => async (groupId: string) => {
  set({ tenants: [], isLoading: true });

  try {
    // ─── Try to read from metadata first ─────────────────────
    let metas = await metadata.getTenantsByGroup(groupId);

    // ─── If metadata empty, read from tenants.json index ────
    if (metas.length === 0) {
      const index = await storage.readTenantsIndex(groupId);
      if (index && index.length > 0) {
        metas = index;
        // Save to metadata for future
        for (const m of metas) {
          await metadata.saveTenant(m);
        }
      }
    }

    set({ tenants: metas });
    console.log(`📋 Loaded ${metas.length} tenants for group ${groupId}`);
  } catch (e) {
    console.error('Failed to load tenants', e);
    set({ tenants: [] });
  } finally {
    set({ isLoading: false });
  }
};