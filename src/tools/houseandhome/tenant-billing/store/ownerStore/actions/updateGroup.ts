// src/tools/houseandhome/tenant-billing/store/ownerStore/actions/updateGroup.ts
import { storage } from '../../../services/storage';
import { metadata } from '../../../services/metadata';

export const updateGroup = (set: any, get: any) => async (id: string, name: string) => {
  const groups = get().groups;
  const idx = groups.findIndex(g => g.id === id);
  if (idx === -1) return;
  const updated = { ...groups[idx], name, updatedAt: new Date().toISOString() };
  const newGroups = [...groups];
  newGroups[idx] = updated;
  const existing = await storage.readFile<any[]>('groups.json') || [];
  const updatedExisting = existing.map(g => g.id === id ? { ...g, name } : g);
  await storage.writeFile('groups.json', updatedExisting);
  await metadata.saveGroups(newGroups);
  set({ groups: newGroups });
  console.log('Group updated');
};