// src/tools/houseandhome/tenant-billing/store/ownerStore/helpers/tenantCharge.ts
import { OwnerCharge } from '../../../core/types';

export function buildTenantCharge(
  ownerCharge: OwnerCharge,
  month: string,
  rate?: number,
  eachPays?: number
): any {
  const tenantCharge: any = {
    id: crypto.randomUUID(),
    name: ownerCharge.name,
    type: ownerCharge.type,
    note: ownerCharge.note,
    paid: false,
    paidAt: null,
    duration: { ...ownerCharge.duration },
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