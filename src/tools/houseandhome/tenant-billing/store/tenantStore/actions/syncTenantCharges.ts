// src/tools/houseandhome/tenant-billing/store/tenantStore/actions/syncTenantCharges.ts
import { storage } from '../../../services/storage';
import { OwnerCharge } from '../../../core/types';
import { shouldChargeBeInMonth, buildTenantChargeFromOwner } from '../helpers';

const getPreviousMonth = (month: string): string => {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1, 1);
  date.setMonth(date.getMonth() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const syncTenantCharges = (set: any, get: any) => async (
  tenantId: string,
  groupId: string,
  month: string,
  tenantData?: any
) => {
  try {
    let tenant = tenantData;
    if (!tenant) {
      const meta = get().tenants.find((t: any) => t.id === tenantId);
      if (!meta) {
        console.warn('⚠️ Tenant meta not found for sync');
        return;
      }
      const profile = await storage.readTenantProfile(groupId, meta.name);
      if (!profile) return;
      const bills: any = {};
      try {
        const tenantFolder = await storage.getTenantPath(groupId, meta.name);
        for await (const entry of tenantFolder.values()) {
          if (entry.kind === 'file' && entry.name !== 'profile.json' && entry.name !== 'images') {
            const year = entry.name.replace('.json', '');
            const data = await storage.readTenantYear(groupId, meta.name, year);
            if (data && data.bills) Object.assign(bills, data.bills);
          }
        }
      } catch (e) {}
      tenant = { id: tenantId, ownerId: groupId, ...profile, bills };
    }

    // ─── Read owner charges from YEARLY file ──────────────────
    const year = month.substring(0, 4);
    const yearlyData = await storage.readOwnerYear(groupId, year);
    const ownerCharges = yearlyData?.charges || [];

    if (!tenant.bills[month]) {
      tenant.bills[month] = { month, charges: [], total: 0, paid: false };
    }

    const bill = tenant.bills[month];
    const prevMonth = getPreviousMonth(month);
    const prevBill = tenant.bills[prevMonth];

    // ─── Preserve personal charges ────────────────────────────
    const personalCharges = bill.charges.filter((c: any) => !c.ownerChargeId);
    bill.charges = [...personalCharges];

    let tenantUpdated = false;

    for (const ownerCharge of ownerCharges) {
      // ─── 🔥 Check if the charge is active for this month ──
      // shouldChargeBeInMonth handles the duration, including endMonth (soft delete)
      const shouldAppear = shouldChargeBeInMonth(ownerCharge, month);
      let isTenantSelected = true;
      if (ownerCharge.applyTo === 'selected') {
        const selectedTenants = ownerCharge.selectedTenants || [];
        isTenantSelected = selectedTenants.includes(tenantId);
      }

      const existingIndex = bill.charges.findIndex((c: any) => c.ownerChargeId === ownerCharge.id);

      if (shouldAppear && isTenantSelected) {
        const rate = ownerCharge.rate || 0;
        const eachPays = ownerCharge.eachPays || 0;

        let prevTotal = 0;
        if (prevBill) {
          const prevCharge = prevBill.charges.find((c: any) => c.ownerChargeId === ownerCharge.id);
          if (prevCharge) prevTotal = prevCharge.amount || 0;
        }

        if (existingIndex !== -1) {
          const existing = bill.charges[existingIndex];
          if (!existing.ownerChargeId) {
            existing.ownerChargeId = ownerCharge.id;
            tenantUpdated = true;
          }
          existing.name = ownerCharge.name;
          existing.type = ownerCharge.type;
          existing.note = ownerCharge.note;
          existing.duration = ownerCharge.duration || { type: 'permanent', startMonth: month };

          if (ownerCharge.type === 'meter') {
            existing.rate = rate;
            existing.finalRate = rate;
            if (existing.overrideRate == null) {
              const units = Math.max(0, (existing.currentReading || 0) - (existing.prevReading || 0));
              existing.amount = units * rate;
            }
          } else if (ownerCharge.type === 'fixed') {
            let baseAmount = ownerCharge.fixedAmount || 0;
            if (prevTotal > 0) baseAmount = prevTotal;
            existing.lastMonthPaid = baseAmount;
            existing.overrideAmount = null;
            existing.amount = baseAmount;
          } else if (ownerCharge.type === 'pay-later') {
            existing.startBalance = ownerCharge.startBalance || existing.startBalance;
            existing.decrementAmount = ownerCharge.decrementAmount || existing.decrementAmount;
            const currentRemaining = existing.remainingAmount || existing.startBalance || 0;
            const decrement = existing.decrementAmount || 0;
            const newRemaining = Math.max(0, currentRemaining - decrement);
            existing.remainingAmount = newRemaining;
            existing.amount = Math.min(decrement, currentRemaining);
            existing.isComplete = newRemaining <= 0;
            if (newRemaining <= 0) {
              existing.paid = true;
              existing.paidAt = new Date().toISOString();
            }
          }
        } else {
          const newCharge = buildTenantChargeFromOwner(ownerCharge, month, rate, eachPays);
          if (ownerCharge.type === 'fixed' && prevTotal > 0) {
            newCharge.lastMonthPaid = prevTotal;
            newCharge.overrideAmount = null;
            newCharge.amount = prevTotal;
          }
          bill.charges.push(newCharge);
          tenantUpdated = true;
          console.log(`   ➕ Added "${ownerCharge.name}" to ${month}`);
        }
      } else {
        if (existingIndex !== -1) {
          bill.charges.splice(existingIndex, 1);
          tenantUpdated = true;
        }
      }
    }

    // ─── Backfill ownerChargeId for old charges ──────────────
    for (const charge of bill.charges) {
      if (!charge.ownerChargeId && charge.type !== 'pay-later') {
        const matchingOwner = ownerCharges.find(
          (oc: any) => oc.name === charge.name && oc.type === charge.type
        );
        if (matchingOwner) {
          charge.ownerChargeId = matchingOwner.id;
          tenantUpdated = true;
        }
      }
    }

    bill.total = bill.charges.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

    if (tenantUpdated) {
      await get().saveTenantFull(tenant);
      console.log(`✅ Synced tenant ${tenant.name} for month ${month} (${bill.charges.length} charges)`);
    } else {
      console.log(`✅ Synced tenant ${tenant.name} for month ${month} (no changes, ${bill.charges.length} charges)`);
    }

    return tenant;
  } catch (error) {
    console.error('❌ Failed to sync tenant charges:', error);
  }
};