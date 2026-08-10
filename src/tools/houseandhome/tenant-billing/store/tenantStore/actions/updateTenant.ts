// src/tools/houseandhome/tenant-billing/store/tenantStore/actions/updateTenant.ts
import { storage } from '../../../services/storage';
import { metadata } from '../../../services/metadata';

export const updateTenant = (set: any, get: any) => async (id: string, data: any) => {
  const meta = get().tenants.find((t: any) => t.id === id);
  if (!meta) return;

  // ─── Read current profile ──────────────────────────────────
  const profile = await storage.readTenantProfile(meta.groupId, meta.name);
  if (!profile) return;

  // ─── Update profile ────────────────────────────────────────
  const updatedProfile = {
    ...profile,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await storage.writeTenantProfile(meta.groupId, meta.name, updatedProfile);

  // ─── Update tenants.json index ─────────────────────────────
  const index = await storage.readTenantsIndex(meta.groupId);
  const idx = index.findIndex((t: any) => t.id === id);
  if (idx !== -1) {
    index[idx] = {
      ...index[idx],
      name: updatedProfile.name,
      phone: updatedProfile.phone,
      hasPhoto: !!updatedProfile.photo,
      photo: updatedProfile.photo,
      updatedAt: updatedProfile.updatedAt,
    };
    await storage.writeTenantsIndex(meta.groupId, index);
  }

  // ─── Update metadata ───────────────────────────────────────
  const updatedMeta = {
    ...meta,
    name: updatedProfile.name,
    phone: updatedProfile.phone,
    hasPhoto: !!updatedProfile.photo,
    photo: updatedProfile.photo,
    updatedAt: updatedProfile.updatedAt,
  };
  await metadata.saveTenant(updatedMeta);

  // ─── Update local store ────────────────────────────────────
  set((state: any) => ({
    tenants: state.tenants.map((t: any) => t.id === id ? updatedMeta : t),
  }));

  console.log(`✅ Tenant "${updatedProfile.name}" updated`);
};