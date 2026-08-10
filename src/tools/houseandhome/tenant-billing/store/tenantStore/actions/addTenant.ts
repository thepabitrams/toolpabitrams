// src/tools/houseandhome/tenant-billing/store/tenantStore/actions/addTenant.ts
import { storage } from '../../../services/storage';
import { metadata } from '../../../services/metadata';
import { TenantMeta } from '../../../core/types';

export const addTenant = (set: any, get: any) => async (groupId: string, tenantData: any) => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // ─── Build tenant profile ──────────────────────────────────
  const profile = {
    id,
    name: tenantData.name,
    phone: tenantData.phone || '',
    address: tenantData.address || '',
    note: tenantData.note || '',
    hasPhoto: false,
    photo: null,
    createdAt: now,
    updatedAt: now,
  };

  // ─── Write profile.json ────────────────────────────────────
  await storage.writeTenantProfile(groupId, tenantData.name, profile);

  // ─── Update tenants.json index ─────────────────────────────
  const index = await storage.readTenantsIndex(groupId);
  const meta: TenantMeta = {
    id,
    groupId,
    name: tenantData.name,
    phone: tenantData.phone || '',
    hasPhoto: false,
    photo: null,
    updatedAt: now,
  };
  index.push(meta);
  await storage.writeTenantsIndex(groupId, index);

  // ─── Save to metadata ──────────────────────────────────────
  await metadata.saveTenant(meta);

  // ─── Update group tenant count ─────────────────────────────
  const groups = await metadata.getGroups();
  const group = groups.find(g => g.id === groupId);
  if (group) {
    group.tenantCount = (group.tenantCount || 0) + 1;
    await metadata.saveGroups(groups);
    // Reload owner store groups
    const ownerStore = (await import('../../ownerStore')).useOwnerStore.getState();
    ownerStore.loadGroups();
  }

  // ─── Update local store ────────────────────────────────────
  set((state: any) => ({ tenants: [...state.tenants, meta] }));

  console.log(`✅ Tenant "${tenantData.name}" added (ID: ${id})`);
};