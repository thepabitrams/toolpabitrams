// src/tools/houseandhome/tenant-billing/store/ownerStore/actions/loadGroups.ts
import { storage } from '../../../services/storage';
import { metadata } from '../../../services/metadata';

export const loadGroups = (set: any, get: any) => async () => {
  set({ isLoading: true });
  try {
    let groups = await metadata.getGroups();
    if (groups.length === 0) {
      const raw = await storage.readFile<any[]>('groups.json');
      if (raw) {
        groups = raw.map(g => ({ ...g, tenantCount: g.tenantCount || 0 }));
        await metadata.saveGroups(groups);
      }
    }
    set({ groups });

    // ─── Load owner charges for the selected group ──────────
    const { selectedGroupId } = get();
    if (selectedGroupId) {
      await get().loadOwnerCharges(selectedGroupId);
    }
  } catch (e) {
    console.error('Failed to load groups', e);
  } finally {
    set({ isLoading: false });
  }
};