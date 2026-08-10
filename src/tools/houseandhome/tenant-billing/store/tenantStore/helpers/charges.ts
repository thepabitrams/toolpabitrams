// src/tools/houseandhome/tenant-billing/store/tenantStore/helpers/charges.ts
import { OwnerCharge } from '../../../core/types';

export function shouldChargeBeInMonth(charge: OwnerCharge, month: string): boolean;
export function shouldChargeBeInMonth(duration: any, month: string): boolean;

export function shouldChargeBeInMonth(
  durationOrCharge: any,
  month: string
): boolean {
  // ─── 🔥 FIX: Handle both cases ──────────────────────────────
  // Case 1: Called with a full charge object (old usage)
  // Case 2: Called with just the duration (new usage)
  let duration = durationOrCharge;
  if (durationOrCharge && durationOrCharge.duration) {
    duration = durationOrCharge.duration;
  }

  // ─── If duration is still undefined, use a safe default ────
  if (!duration || typeof duration !== 'object') {
    // No duration means permanent starting from this month
    return true; // Treat as permanent
  }

  // ─── Now safely access duration.type ────────────────────────
  if (duration.type === 'permanent') {
    return !duration.startMonth || month >= duration.startMonth;
  }

  if (duration.type === 'custom') {
    if (!duration.startMonth || !duration.endMonth) return false;
    return month >= duration.startMonth && month <= duration.endMonth;
  }

  if (duration.type === 'one-time') {
    return !!duration.startMonth && month === duration.startMonth;
  }

  return false;
}

export function buildTenantChargeFromOwner(
  ownerCharge: OwnerCharge,
  month: string,
  rate?: number,
  eachPays?: number
): any {
  // ─── Ensure duration exists ──────────────────────────────────
  const duration = ownerCharge.duration || { type: 'permanent', startMonth: month };

  const tenantCharge: any = {
    id: crypto.randomUUID(),
    name: ownerCharge.name,
    type: ownerCharge.type,
    note: ownerCharge.note,
    paid: false,
    paidAt: null,
    duration: { ...duration },
    ownerChargeId: ownerCharge.id,
    amount: 0,
  };

  if (ownerCharge.type === 'meter') {
    tenantCharge.prevReading = 0;
    tenantCharge.currentReading = 0;
    tenantCharge.unitsUsed = 0;
    tenantCharge.rate = rate || 0;
    tenantCharge.overrideRate = null;
    tenantCharge.finalRate = rate || 0;
    tenantCharge.amount = 0;
  } else if (ownerCharge.type === 'fixed') {
    tenantCharge.lastMonthPaid = ownerCharge.fixedAmount || 0;
    tenantCharge.overrideAmount = null;
    tenantCharge.amount = ownerCharge.fixedAmount || 0;
  } else if (ownerCharge.type === 'one-time') {
    tenantCharge.totalAmount = ownerCharge.totalAmount || 0;
    tenantCharge.splitAmong = ownerCharge.splitAmong || [];
    tenantCharge.eachPays = eachPays || 0;
    tenantCharge.amount = eachPays || 0;
  } else if (ownerCharge.type === 'pay-later') {
    const decrementAmount = ownerCharge.decrementAmount || 0;
    const startBalance = ownerCharge.startBalance || 0;
    const remaining = Math.max(0, startBalance - decrementAmount);

    tenantCharge.startBalance = startBalance;
    tenantCharge.decrementAmount = decrementAmount;
    tenantCharge.remainingAmount = remaining;
    tenantCharge.totalAmount = startBalance;
    tenantCharge.amount = Math.min(decrementAmount, startBalance);
    tenantCharge.isComplete = remaining <= 0;
  }

  return tenantCharge;
}