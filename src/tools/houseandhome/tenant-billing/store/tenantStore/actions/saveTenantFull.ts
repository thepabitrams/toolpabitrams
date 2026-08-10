// src/tools/houseandhome/tenant-billing/store/tenantStore/actions/saveTenantFull.ts
import { storage } from '../../../services/storage';
import { metadata } from '../../../services/metadata';

export const saveTenantFull = (set: any, get: any) => async (tenant: any) => {
  const { id, ownerId: groupId, name, bills, ...profileData } = tenant;

  // ─── Find existing meta ────────────────────────────────────
  const meta = get().tenants.find((t: any) => t.id === id);

  // ─── Save profile ──────────────────────────────────────────
  const profile = {
    id,
    name: tenant.name,
    phone: tenant.phone || '',
    address: tenant.address || '',
    note: tenant.note || '',
    hasPhoto: !!tenant.photo,
    photo: tenant.photo || null,
    createdAt: tenant.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await storage.writeTenantProfile(groupId, tenant.name, profile);

  // ─── Save bills by year ────────────────────────────────────
  const billsByYear: { [year: string]: any } = {};
  for (const [month, bill] of Object.entries(bills || {})) {
    const year = month.substring(0, 4);
    if (!billsByYear[year]) {
      billsByYear[year] = { year, bills: {} };
    }
    billsByYear[year].bills[month] = bill;
  }

  for (const [year, data] of Object.entries(billsByYear)) {
    await storage.writeTenantYear(groupId, tenant.name, year, data);
  }

  // ─── Update tenants.json index ─────────────────────────────
  const index = await storage.readTenantsIndex(groupId);
  const idx = index.findIndex((t: any) => t.id === id);
  if (idx !== -1) {
    index[idx] = {
      ...index[idx],
      name: tenant.name,
      phone: tenant.phone,
      hasPhoto: !!tenant.photo,
      photo: tenant.photo,
      updatedAt: profile.updatedAt,
    };
    await storage.writeTenantsIndex(groupId, index);
  }

  // ─── Update metadata ───────────────────────────────────────
  if (meta) {
    const updatedMeta = {
      ...meta,
      name: tenant.name,
      phone: tenant.phone,
      hasPhoto: !!tenant.photo,
      photo: tenant.photo,
      updatedAt: profile.updatedAt,
    };
    await metadata.saveTenant(updatedMeta);
    set((state: any) => ({
      tenants: state.tenants.map((t: any) => t.id === id ? updatedMeta : t),
    }));
  }

  console.log(`💾 Tenant "${tenant.name}" saved`);
};