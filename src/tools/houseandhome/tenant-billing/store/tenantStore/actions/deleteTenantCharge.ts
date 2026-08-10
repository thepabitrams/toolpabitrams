// src/tools/houseandhome/tenant-billing/store/tenantStore/actions/deleteTenantCharge.ts
import { storage } from '../../../services/storage';

export const deleteTenantCharge = (set: any, get: any) => async (
  tenantId: string,
  groupId: string,
  chargeId: string
) => {
  try {
    console.log(`🗑️ Hard deleting charge ${chargeId} from tenant ${tenantId}`);

    const meta = get().tenants.find((t: any) => t.id === tenantId);
    if (!meta) {
      console.error('❌ Tenant not found!');
      return;
    }

    const tenant = await get().getTenantFull(tenantId, groupId);
    if (!tenant) {
      console.error('❌ Tenant data not found!');
      return;
    }

    // ─── Find ownerChargeId (if it exists) ──────────────────────
    let targetOwnerChargeId = null;
    let targetName = '';

    for (const month of Object.keys(tenant.bills)) {
      const bill = tenant.bills[month];
      const charge = bill.charges.find((c: any) => c.id === chargeId);
      if (charge) {
        targetOwnerChargeId = charge.ownerChargeId || null;
        targetName = charge.name || '';
        console.log(`✅ Found charge "${targetName}" in month ${month}`);
        break;
      }
    }

    // ─── Save to recycle ────────────────────────────────────────
    await storage.moveToRecycle({
      type: 'tenant-charge',
      tenantId: tenantId,
      groupId: groupId,
      name: targetName || chargeId,
      id: chargeId,
      originalData: { id: chargeId, name: targetName, ownerChargeId: targetOwnerChargeId },
      deletedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    });
    console.log('✅ Saved to recycle bin');

    // ─── 🔥 HARD DELETE: Remove from ALL months ────────────────
    let removedCount = 0;

    for (const month of Object.keys(tenant.bills)) {
      const bill = tenant.bills[month];
      const originalLength = bill.charges.length;
      
      bill.charges = bill.charges.filter((c: any) => {
        // ─── Delete by chargeId (personal charge) ──────────────
        if (c.id === chargeId) {
          console.log(`   🗑️ Removed by chargeId in ${month}`);
          return false;
        }
        // ─── Delete by ownerChargeId (owner-linked charge) ──────
        if (targetOwnerChargeId && c.ownerChargeId === targetOwnerChargeId) {
          console.log(`   🗑️ Removed by ownerChargeId in ${month}`);
          return false;
        }
        return true;
      });

      if (bill.charges.length !== originalLength) {
        bill.total = bill.charges.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
        removedCount++;
        console.log(`   🗑️ Removed from ${month}`);
      }
    }

    if (removedCount > 0) {
      await get().saveTenantFull(tenant);
      set((state: any) => ({
        tenants: state.tenants.map((t: any) =>
          t.id === tenantId ? { ...t, updatedAt: new Date().toISOString() } : t
        ),
      }));
      console.log(`✅ Hard deleted from ${removedCount} months`);
    } else {
      console.log('⚠️ No charges were removed');
    }

    console.log(`✅ deleteTenantCharge completed! (HARD DELETE)`);

  } catch (error) {
    console.error('❌ Delete failed:', error);
    throw error;
  }
};