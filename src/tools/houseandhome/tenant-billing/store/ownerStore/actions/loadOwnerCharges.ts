// src/tools/houseandhome/tenant-billing/store/ownerStore/actions/loadOwnerCharges.ts
import { storage } from '../../../services/storage';

export const loadOwnerCharges = (set: any) => async (groupId: string) => {
  try {
    const ownerPath = await storage.getOwnerPath(groupId);
    const files: string[] = [];
    for await (const entry of ownerPath.values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.json')) {
        files.push(entry.name);
      }
    }

    let allCharges: any[] = [];
    for (const file of files) {
      const year = file.replace('.json', '');
      const data = await storage.readOwnerYear(groupId, year);
      if (data && data.charges) {
        allCharges = [...allCharges, ...data.charges];
      }
    }

    set({ ownerCharges: allCharges });
    return allCharges;
  } catch {
    set({ ownerCharges: [] });
    return [];
  }
};