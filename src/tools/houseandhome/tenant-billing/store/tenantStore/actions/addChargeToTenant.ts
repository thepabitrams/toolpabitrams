// src/tools/houseandhome/tenant-billing/store/tenantStore/actions/addChargeToTenant.ts
import { getPropagationMonths } from '../../ownerStore/helpers';

export const addChargeToTenant = (set: any, get: any) => async (tenantId: string, month: string, chargeData: any) => {
  const meta = get().tenants.find((t: any) => t.id === tenantId);
  if (!meta) {
    console.error('Tenant not found');
    return;
  }

  const tenant = await get().getTenantFull(tenantId, meta.groupId);
  if (!tenant) {
    console.error('Tenant data not found');
    return;
  }

  const duration = chargeData.duration || { 
    type: 'permanent', 
    startMonth: month 
  };
  if (!duration.startMonth) {
    duration.startMonth = month;
  }

  const monthsToAdd = getPropagationMonths(duration, month);
  if (monthsToAdd.length === 0) {
    monthsToAdd.push(month);
  }

  const prevMonth = getPreviousMonth(month);
  let prevTotal = 0;
  if (tenant.bills[prevMonth]) {
    const prevCharge = tenant.bills[prevMonth].charges.find(
      (c: any) => c.name === chargeData.name && c.type === chargeData.type
    );
    if (prevCharge) {
      prevTotal = prevCharge.amount || 0;
    }
  }

  // ─── 🔥 ONE chargeId for ALL months ──────────────────────────
  const chargeId = crypto.randomUUID();

  for (const m of monthsToAdd) {
    const newCharge = {
      id: chargeId, // 👈 SAME ID for ALL months!
      groupId: crypto.randomUUID(),
      ...chargeData,
      duration: { ...duration },
      paid: false,
      paidAt: null,
      amount: 0,
    };

    if (chargeData.type === 'fixed') {
      if (prevTotal > 0) {
        newCharge.lastMonthPaid = prevTotal;
        newCharge.overrideAmount = null;
        newCharge.amount = prevTotal;
        newCharge.fixedAmount = prevTotal;
      } else {
        newCharge.lastMonthPaid = chargeData.fixedAmount || 0;
        newCharge.overrideAmount = null;
        newCharge.amount = chargeData.fixedAmount || 0;
        newCharge.fixedAmount = chargeData.fixedAmount || 0;
      }
    }

    if (!tenant.bills[m]) {
      tenant.bills[m] = { month: m, charges: [], total: 0, paid: false };
    }

    const exists = tenant.bills[m].charges.some((c: any) => c.id === chargeId);
    if (!exists) {
      tenant.bills[m].charges.push(newCharge);
      tenant.bills[m].total = tenant.bills[m].charges.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
    }
  }

  await get().saveTenantFull(tenant);
  console.log(`✅ Personal charge "${chargeData.name}" added to ${tenant.name} for ${monthsToAdd.length} months`);
};

const getPreviousMonth = (month: string): string => {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1, 1);
  date.setMonth(date.getMonth() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};