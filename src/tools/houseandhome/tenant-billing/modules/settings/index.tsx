// modules/settings/index.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Overlay } from '@/core/motion/components/overlay';
import { useUIStore } from '../../store/uiStore';
import { backup } from '../../services/backup';
import { storage } from '../../services/storage';
import { metadata } from '../../services/metadata';
import { MdSettings } from 'react-icons/md';
import { StorageStats } from './StorageStats';
import { BackupRestore } from './BackupRestore';
import { DeletedItems } from './DeletedItems';
import { DeletedItem } from './types';

export const Settings = () => {
  const { setShowSettings, showSettings } = useUIStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [storageStats, setStorageStats] = useState({
    groups: 0,
    tenants: 0,
    charges: 0,
    folders: 0,
    files: 0,
  });
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (!showSettings) return;
    loadStats();
  }, [showSettings]);

  // ─── 🔥 UPDATED: Reads from recycle/ folder ──────────────────
  const loadStats = async () => {
    setIsLoading(true);
    try {
      const groups = await metadata.getGroups();
      const tenants = await metadata.getTenants();

      // ─── Read ALL files from recycle/ folder ──────────────
      const deletedItems: DeletedItem[] = [];
      const fileNames = await storage.listRecycleItems();

      for (const fileName of fileNames) {
        const item = await storage.readRecycleItem(fileName);
        if (item) {
          deletedItems.push({
            id: fileName,
            deletedAt: item.deletedAt,
            expiresAt: item.expiresAt,
            data: item.data || {},
            size: item.size || 0,
            type: item.type || 'unknown',
            originalData: item.originalData || null,
          });
        }
      }
      setDeletedItems(deletedItems);

      // ─── 🔥 FIX: REMOVED old owner-charges.json read ──────
      // Using yearly files now (group_xxx/owner/2026.json)
      const charges = 0;

      // ─── Count files/folders ──────────────────────────────
      let fileCount = 0;
      let folderCount = 0;
      try {
        const root = await navigator.storage.getDirectory();
        const billingDir = await root.getDirectoryHandle('tenant-billing', { create: false });
        folderCount = await countFolders(billingDir);
        fileCount = await countFiles(billingDir);
      } catch (e) {
        console.log('Could not count storage items');
      }

      setStorageStats({
        groups: groups.length,
        tenants: tenants.length,
        charges: charges,
        folders: folderCount,
        files: fileCount,
      });
    } catch (e) {
      console.error('Failed to load stats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const countFolders = async (dirHandle: any): Promise<number> => {
    let count = 0;
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'directory') {
        count++;
        count += await countFolders(entry);
      }
    }
    return count;
  };

  const countFiles = async (dirHandle: any): Promise<number> => {
    let count = 0;
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') count++;
      if (entry.kind === 'directory') {
        count += await countFiles(entry);
      }
    }
    return count;
  };

  const handleExport = async () => {
    const blob = await backup.exportBackup();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenant_billing_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('Backup exported');
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleRestoreWithStrategy = async (strategy: 'merge' | 'overwrite' | 'cancel') => {
    if (!selectedFile) return;
    if (strategy === 'cancel') {
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setIsRestoring(true);
    try {
      await backup.importBackup(selectedFile, strategy);
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = '';
      alert('Restore successful! Reloading...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error('Restore failed:', (err as Error).message);
      alert('Restore failed: ' + (err as Error).message);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCancelRestore = () => {
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  // ─── 🔥 UPDATED: Restore from recycle/ folder ───────────────
  const handleRestoreDeleted = async (itemId: string) => {
    if (!confirm('Restore this deleted item?')) return;

    try {
      const item = await storage.readRecycleItem(itemId);
      if (!item) {
        alert('Item not found in recycle bin.');
        return;
      }

      console.log(`🔄 Restoring: ${itemId} (Type: ${item.type})`);

      // ─── CASE 1: GROUP ──────────────────────────────────────
      if (item.type === 'group') {
        const data = item.data;

        const existingGroups = await storage.readFile<any[]>('groups.json') || [];
        for (const g of data.groups || []) {
          const exists = existingGroups.some((e: any) => e.id === g.id);
          if (!exists) existingGroups.push(g);
        }
        await storage.writeFile('groups.json', existingGroups);
        await metadata.saveGroups(existingGroups);

        for (const [tenantId, tenantData] of Object.entries(data.tenantFullData || {})) {
          if (tenantData && tenantData.ownerId) {
            await storage.writeFile(`groups/${tenantData.ownerId}/tenants/${tenantId}.json`, tenantData);
          }
        }

        if (data.tenants) {
          for (const t of data.tenants) {
            await metadata.saveTenant(t);
          }
        }

        if (data.charges) {
          const groupId = data.groups?.[0]?.id;
          if (groupId) {
            for (const charge of data.charges) {
              const year = charge.duration?.startMonth?.substring(0, 4) || new Date().toISOString().slice(0, 4);
              const yearlyData = await storage.readOwnerYear(groupId, year);
              if (yearlyData) {
                const exists = yearlyData.charges.some((c: any) => c.id === charge.id);
                if (!exists) {
                  yearlyData.charges.push(charge);
                  yearlyData.updatedAt = new Date().toISOString();
                  await storage.writeOwnerYear(groupId, year, yearlyData);
                }
              }
            }
          }
        }

        const ownerStore = (await import('../../store/ownerStore')).useOwnerStore.getState();
        await ownerStore.loadGroups();
      }

      // ─── CASE 2: OWNER CHARGE ──────────────────────────────
      else if (item.type === 'owner-charge') {
        const original = item.originalData;
        if (!original || !original.groupId) {
          alert('Invalid charge data.');
          return;
        }

        const year = original.duration?.startMonth?.substring(0, 4) || new Date().toISOString().slice(0, 4);
        const yearlyData = await storage.readOwnerYear(original.groupId, year);

        if (yearlyData) {
          const idx = yearlyData.charges.findIndex((c: any) => c.id === original.id);
          if (idx !== -1) {
            yearlyData.charges[idx] = original;
            yearlyData.updatedAt = new Date().toISOString();
            await storage.writeOwnerYear(original.groupId, year, yearlyData);

            const ownerStore = (await import('../../store/ownerStore')).useOwnerStore.getState();
            await ownerStore.loadOwnerCharges(original.groupId);
          } else {
            alert('Charge not found in yearly file.');
          }
        }
      }

      // ─── CASE 3: TENANT CHARGE ──────────────────────────────
      else if (item.type === 'tenant-charge') {
        const original = item.originalData;
        const tenantStore = (await import('../../store/tenantStore')).useTenantStore.getState();
        const tenant = await tenantStore.getTenantFull(item.tenantId, item.groupId);

        if (!tenant) {
          alert('Tenant not found.');
          return;
        }

        const month = original.duration?.startMonth || new Date().toISOString().slice(0, 7);
        if (tenant.bills[month]) {
          const idx = tenant.bills[month].charges.findIndex((c: any) => c.id === original.id);
          if (idx !== -1) {
            tenant.bills[month].charges[idx] = original;
          } else {
            tenant.bills[month].charges.push(original);
          }
          tenant.bills[month].total = tenant.bills[month].charges.reduce((s: number, c: any) => s + c.amount, 0);
          await tenantStore.saveTenantFull(tenant);
        } else {
          tenant.bills[month] = { month, charges: [original], total: original.amount || 0, paid: false };
          await tenantStore.saveTenantFull(tenant);
        }

        const ownerStore = (await import('../../store/ownerStore')).useOwnerStore.getState();
        await ownerStore.loadOwnerCharges(item.groupId);
      }

      // ─── CASE 4: TENANT (Full Person) ──────────────────────
      else if (item.type === 'tenant') {
        const data = item.data;
        if (!data || !data.id || !data.ownerId) {
          alert('Invalid tenant data.');
          return;
        }

        await storage.writeFile(`groups/${data.ownerId}/tenants/${data.id}.json`, data);

        const index = await storage.readTenantsIndex(data.ownerId);
        const exists = index.some((t: any) => t.id === data.id);
        if (!exists) {
          const meta = {
            id: data.id,
            groupId: data.ownerId,
            name: data.name,
            phone: data.phone || '',
            hasPhoto: !!data.photo,
            photo: data.photo || null,
            updatedAt: new Date().toISOString(),
          };
          index.push(meta);
          await storage.writeTenantsIndex(data.ownerId, index);
          await metadata.saveTenant(meta);
        }

        const groups = await metadata.getGroups();
        const group = groups.find((g: any) => g.id === data.ownerId);
        if (group) {
          group.tenantCount = (group.tenantCount || 0) + 1;
          await metadata.saveGroups(groups);
        }

        const ownerStore = (await import('../../store/ownerStore')).useOwnerStore.getState();
        await ownerStore.loadGroups();
        const tenantStore = (await import('../../store/tenantStore')).useTenantStore.getState();
        await tenantStore.loadTenants(data.ownerId);
      }

      // ─── CASE 5: IMAGE ──────────────────────────────────────
      else if (item.type === 'image') {
        const { groupId, tenantName, fileName } = item.data;
        if (item.data && item.data.imageData) {
          await storage.uploadPhoto(groupId, tenantName, fileName, item.data.imageData);
        } else {
          alert('Image data not found in recycle bin. Cannot restore.');
        }
      }

      // ─── Finally: Delete the recycle file ──────────────────
      await storage.deleteRecycleItem(itemId);
      await loadStats();
      alert('✅ Restored successfully!');

    } catch (err) {
      console.error('Restore failed:', err);
      alert('Restore failed: ' + (err as Error).message);
    }
  };

  // ─── 🔥 UPDATED: Permanently delete from recycle/ folder ──
  const handlePermanentDelete = async (itemId: string) => {
    if (!confirm(`Permanently delete this item? Cannot be undone.`)) return;
    try {
      await storage.deleteRecycleItem(itemId);
      await loadStats();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  // ─── 🔥 UPDATED: Clear ALL recycle/ folder ─────────────────
  const handleClearDeleted = async () => {
    if (!confirm('Delete ALL items in recycle bin permanently?')) return;
    try {
      const items = await storage.listRecycleItems();
      for (const fileName of items) {
        await storage.deleteRecycleItem(fileName);
      }
      await loadStats();
    } catch (err) {
      console.error('Failed to clear:', err);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────
  const getDaysRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Overlay isOpen={showSettings} onClose={() => setShowSettings(false)}>
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm py-3 px-4 rounded-xl z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <MdSettings className="text-2xl text-gray-700 dark:text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>
          </div>
          <span className="text-xs text-gray-400">
            {isLoading ? 'Loading...' : `Updated: ${new Date().toLocaleTimeString()}`}
          </span>
        </div>

        <div className="space-y-4">
          <StorageStats stats={storageStats} isLoading={isLoading} />
          <BackupRestore
            fileRef={fileRef}
            onExport={handleExport}
            onImport={handleFileSelected}
            onRestoreWithStrategy={handleRestoreWithStrategy}
            isRestoring={isRestoring}
            selectedFile={selectedFile}
            onCancelRestore={handleCancelRestore}
          />
          <DeletedItems
            items={deletedItems}
            onRestore={handleRestoreDeleted}
            onPermanentDelete={handlePermanentDelete}
            onClearAll={handleClearDeleted}
            getDaysRemaining={getDaysRemaining}
            formatSize={formatSize}
          />
        </div>
      </div>
    </Overlay>
  );
};

export default Settings;