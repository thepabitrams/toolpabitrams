// src/tools/houseandhome/tenant-billing/store/ownerStore/actions/deleteGroup.ts
import { storage } from '../../../services/storage';
import { metadata } from '../../../services/metadata';

export const deleteGroup = (set: any, get: any) => async (id: string) => {
  const group = get().groups.find((g: any) => g.id === id);
  if (!group) return;

  const tenantMetas = await metadata.getTenantsByGroup(id);
  const tenantFullData: { [id: string]: any } = {};
  for (const t of tenantMetas) {
    const full = await storage.readFile(`groups/${id}/tenants/${t.id}.json`);
    if (full) tenantFullData[t.id] = full;
  }

  const charges = get().ownerCharges.filter((c: any) => c.groupId === id);

  // ─── 🔥 MOVED TO RECYCLE (instead of deleted-items.json) ──
  await storage.moveToRecycle({
    type: 'group',
    groupId: id,
    name: group.name,
    data: {
      groups: [group],
      tenants: tenantMetas,
      charges: charges,
      tenantFullData: tenantFullData,
    },
  });

  // ─── Delete physical folder ──────────────────────────────
  await storage.deleteFolder(`groups/${id}`);

  // ─── Update groups.json ───────────────────────────────────
  const existing = await storage.readFile<any[]>('groups.json') || [];
  await storage.writeFile('groups.json', existing.filter((g: any) => g.id !== id));

  const groups = get().groups.filter((g: any) => g.id !== id);
  await metadata.saveGroups(groups);

  for (const t of tenantMetas) {
    await metadata.deleteTenant(t.id);
  }

  const { useTenantStore } = await import('../../tenantStore');
  useTenantStore.setState({ tenants: [] });

  set({ groups, selectedGroupId: null });
  console.log(`🗑️ Group "${group.name}" moved to recycle (expires in 15 days)`);
};