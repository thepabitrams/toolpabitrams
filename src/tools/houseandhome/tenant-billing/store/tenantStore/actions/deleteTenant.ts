// src/tools/houseandhome/tenant-billing/store/tenantStore/actions/deleteTenant.ts
import { storage } from '../../../services/storage';
import { metadata } from '../../../services/metadata';

export const deleteTenant = (set: any, get: any) => async (id: string, groupId: string) => {
  const meta = get().tenants.find((t: any) => t.id === id);
  if (!meta) return;

  // ─── Read full tenant data (profile + all years) ──────────
  const profile = await storage.readTenantProfile(groupId, meta.name);
  if (!profile) return;

  // ─── Collect all yearly bills ──────────────────────────────
  const tenantFolder = await storage.getTenantPath(groupId, meta.name);
  const allBills: any = {};
  for await (const entry of tenantFolder.values()) {
    if (entry.kind === 'file' && entry.name !== 'profile.json' && entry.name !== 'images') {
      const year = entry.name.replace('.json', '');
      const data = await storage.readTenantYear(groupId, meta.name, year);
      if (data && data.bills) {
        Object.assign(allBills, data.bills);
      }
    }
  }

  // ─── Build full tenant object ──────────────────────────────
  const tenantData = {
    ...profile,
    bills: allBills,
  };

  // ─── Move to recycle ───────────────────────────────────────
  await storage.moveToRecycle({
    type: 'tenant',
    groupId,
    name: meta.name,
    id: meta.id,
    data: tenantData,
  });

  // ─── Delete tenant folder ──────────────────────────────────
  const groupPath = await storage.getGroupPath(groupId);
  const tenantsFolder = await groupPath.getDirectoryHandle('tenants', { create: false });
  try {
    await tenantsFolder.removeEntry(meta.name, { recursive: true });
  } catch (e) {
    console.warn('Could not delete tenant folder:', e);
  }

  // ─── Remove from tenants.json index ────────────────────────
  const index = await storage.readTenantsIndex(groupId);
  const newIndex = index.filter((t: any) => t.id !== id);
  await storage.writeTenantsIndex(groupId, newIndex);

  // ─── Remove from metadata ──────────────────────────────────
  await metadata.deleteTenant(id);

  // ─── Update group tenant count ─────────────────────────────
  const groups = await metadata.getGroups();
  const group = groups.find((g: any) => g.id === groupId);
  if (group && group.tenantCount > 0) {
    group.tenantCount -= 1;
    await metadata.saveGroups(groups);
    const ownerStore = (await import('../../ownerStore')).useOwnerStore.getState();
    ownerStore.loadGroups();
  }

  // ─── Update local store ────────────────────────────────────
  set((state: any) => ({
    tenants: state.tenants.filter((t: any) => t.id !== id),
  }));

  console.log(`🗑️ Tenant "${meta.name}" moved to recycle (expires in 15 days)`);
};