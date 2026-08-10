// src/tools/houseandhome/tenant-billing/store/ownerStore/actions/deleteOwnerCharge.ts
import { storage } from '../../../services/storage';

export const deleteOwnerCharge = (set: any, get: any) => async (id: string) => {
  const charge = get().ownerCharges.find((c: any) => c.id === id);
  if (!charge) {
    console.error('❌ Charge not found');
    return;
  }

  console.log(`🗑️ Hard deleting charge "${charge.name}" (ID: ${id}) – all months, recycle`);

  // ─── Step 1: Save original charge to recycle bin ────────────
  await storage.moveToRecycle({
    type: 'owner-charge',
    groupId: charge.groupId,
    name: charge.name,
    id: charge.id,
    originalData: charge,
    deletedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days
  });

  // ─── Step 2: Remove from ALL owner yearly files ─────────────
  const groupId = charge.groupId;
  const ownerPath = await storage.getOwnerPath(groupId);
  const files: string[] = [];
  for await (const entry of ownerPath.values()) {
    if (entry.kind === 'file' && entry.name.endsWith('.json')) {
      files.push(entry.name);
    }
  }

  for (const file of files) {
    const year = file.replace('.json', '');
    const yearlyData = await storage.readOwnerYear(groupId, year);
    if (yearlyData && yearlyData.charges) {
      const originalLen = yearlyData.charges.length;
      yearlyData.charges = yearlyData.charges.filter((c: any) => c.id !== id);
      if (yearlyData.charges.length !== originalLen) {
        yearlyData.updatedAt = new Date().toISOString();
        await storage.writeOwnerYear(groupId, year, yearlyData);
        console.log(`   🗑️ Removed from ${year}.json`);
      }
    }
  }

  // ─── Step 3: Remove from ALL tenant bills (all months) ──────
  const { tenants } = (await import('../../tenantStore')).useTenantStore.getState();
  const groupTenants = tenants.filter((t: any) => t.groupId === groupId);

  for (const tenantMeta of groupTenants) {
    const tenantStore = (await import('../../tenantStore')).useTenantStore;
    const tenant = await tenantStore.getState().getTenantFull(tenantMeta.id, groupId);
    if (!tenant) continue;

    let tenantUpdated = false;
    for (const month of Object.keys(tenant.bills)) {
      const bill = tenant.bills[month];
      const originalLen = bill.charges.length;
      bill.charges = bill.charges.filter((c: any) => c.ownerChargeId !== id);
      if (bill.charges.length !== originalLen) {
        bill.total = bill.charges.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
        tenantUpdated = true;
      }
    }

    if (tenantUpdated) {
      await tenantStore.getState().saveTenantFull(tenant);
      console.log(`   🗑️ Removed from tenant "${tenant.name}"`);
    }
  }

  // ─── Step 4: Update store ────────────────────────────────────
  const newCharges = get().ownerCharges.filter((c: any) => c.id !== id);
  set({ ownerCharges: newCharges });

  console.log(`✅ Hard deleted charge "${charge.name}" – moved to recycle (expires in 15 days)`);
};