// src/tools/houseandhome/tenant-billing/services/backup.ts
import { storage } from './storage';
import { metadata } from './metadata';
import { GroupMeta, TenantMeta, BillMeta, Tenant } from '../core/types';

export interface BackupData {
  version: string;
  exportedAt: string;
  groups: GroupMeta[];
  tenants: TenantMeta[];
  bills: BillMeta[];
  tenantFullData: { [id: string]: Tenant };
  groupsJson: any;
}

export type RestoreStrategy = 'merge' | 'overwrite' | 'cancel';

export class BackupService {
  async exportBackup(): Promise<Blob> {
    const groups = await metadata.getGroups();
    const tenants = await metadata.getTenants();
    const bills = await metadata.getAllBills();

    const tenantFullData: { [id: string]: Tenant } = {};
    for (const t of tenants) {
      const data = await storage.readFile<Tenant>(`groups/${t.groupId}/tenants/${t.id}.json`);
      if (data) tenantFullData[t.id] = data;
    }

    // ─── 🔥 FIX: Use metadata groups instead of old groups.json ──
    const groupsJson = groups; // Use metadata groups, not old file

    const backup: BackupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      groups,
      tenants,
      bills,
      tenantFullData,
      groupsJson: groupsJson || [],
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    return blob;
  }

  async importBackup(file: File, strategy: RestoreStrategy = 'overwrite'): Promise<void> {
    const text = await file.text();
    const backup = JSON.parse(text) as BackupData;

    if (strategy === 'cancel') {
      console.log('❌ Restore cancelled by user');
      return;
    }

    if (strategy === 'overwrite') {
      try {
        await metadata.clearAll();
        await storage.clearAll();
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        console.warn('Clear step failed, continuing:', e);
      }
    }

    // ─── groups.json ──────────────────────────────────────────
    if (backup.groupsJson) {
      if (strategy === 'overwrite') {
        await storage.writeFile('groups.json', backup.groupsJson);
      } else {
        const existingGroups = await storage.readFile<any[]>('groups.json') || [];
        const mergedGroups = [...existingGroups];
        for (const g of backup.groupsJson) {
          const exists = mergedGroups.some(e => e.id === g.id);
          if (!exists) mergedGroups.push(g);
        }
        await storage.writeFile('groups.json', mergedGroups);
      }
    }

    // ─── Tenant files ─────────────────────────────────────────
    for (const [tenantId, tenantData] of Object.entries(backup.tenantFullData)) {
      if (!tenantData.ownerId) {
        console.warn(`Skipping tenant ${tenantId}: no ownerId`);
        continue;
      }

      const path = `groups/${tenantData.ownerId}/tenants/${tenantId}.json`;

      if (strategy === 'overwrite') {
        await storage.writeFile(path, tenantData);
      } else {
        const existingTenant = await storage.readFile<Tenant>(path);
        if (existingTenant) {
          const mergedBills = { ...existingTenant.bills };
          for (const [month, bill] of Object.entries(tenantData.bills || {})) {
            if (mergedBills[month]) {
              const existingCharges = mergedBills[month].charges || [];
              const newCharges = (bill as any).charges || [];
              for (const newCharge of newCharges) {
                const exists = existingCharges.some((c: any) => c.id === newCharge.id);
                if (!exists) existingCharges.push(newCharge);
              }
              mergedBills[month].charges = existingCharges;
              mergedBills[month].total = existingCharges.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
            } else {
              mergedBills[month] = bill;
            }
          }
          const mergedTenant = {
            ...existingTenant,
            ...tenantData,
            bills: mergedBills,
            updatedAt: new Date().toISOString(),
          };
          await storage.writeFile(path, mergedTenant);
        } else {
          await storage.writeFile(path, tenantData);
        }
      }
    }

    // ─── Metadata ─────────────────────────────────────────────
    if (strategy === 'overwrite') {
      try {
        await metadata.saveGroups(backup.groups);
        await metadata.saveTenants(backup.tenants);
        for (const bill of backup.bills) {
          await metadata.saveBill(bill);
        }
      } catch (e) {
        console.error('Metadata restore failed:', e);
        throw new Error('Metadata restore failed: ' + (e as Error).message);
      }
    } else {
      try {
        const existingGroups = await metadata.getGroups();
        const mergedGroups = [...existingGroups];
        for (const g of backup.groups) {
          const exists = mergedGroups.some(e => e.id === g.id);
          if (!exists) mergedGroups.push(g);
        }
        await metadata.saveGroups(mergedGroups);

        const existingTenants = await metadata.getTenants();
        const mergedTenants = [...existingTenants];
        for (const t of backup.tenants) {
          const exists = mergedTenants.some(e => e.id === t.id);
          if (!exists) mergedTenants.push(t);
        }
        await metadata.saveTenants(mergedTenants);

        const existingBills = await metadata.getAllBills();
        const mergedBills = [...existingBills];
        for (const b of backup.bills) {
          const exists = mergedBills.some(e => e.id === b.id);
          if (!exists) mergedBills.push(b);
        }
        for (const bill of mergedBills) {
          await metadata.saveBill(bill);
        }
      } catch (e) {
        console.error('Metadata merge failed:', e);
        throw new Error('Metadata merge failed: ' + (e as Error).message);
      }
    }

    console.log(`✅ Restore completed successfully with strategy: ${strategy}`);
  }

  async hasExistingData(): Promise<boolean> {
    try {
      const groups = await metadata.getGroups();
      const tenants = await metadata.getTenants();
      return groups.length > 0 || tenants.length > 0;
    } catch {
      return false;
    }
  }
}

export const backup = new BackupService();