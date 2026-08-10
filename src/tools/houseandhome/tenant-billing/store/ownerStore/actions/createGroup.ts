// src/tools/houseandhome/tenant-billing/store/ownerStore/actions/createGroup.ts
import { storage } from '../../../services/storage';
import { metadata } from '../../../services/metadata';
import { GroupMeta } from '../../../core/types';

export const createGroup = (set: any, get: any) => async (name: string) => {
  const id = crypto.randomUUID();
  const newGroup: GroupMeta = {
    id,
    name,
    tenantCount: 0,
    updatedAt: new Date().toISOString(),
  };
  
  // ─── 🔥 REMOVED: groups.json write (OLD system) ──────────
  // Just save to metadata and store
  const groups = get().groups;
  await metadata.saveGroups([...groups, newGroup]);
  
  set({ groups: [...groups, newGroup], selectedGroupId: id });
  console.log(`✅ Group "${name}" created (ID: ${id})`);
};