// src/tools/houseandhome/tenant-billing/services/copy.ts
import { Tenant, Charge, OwnerCharge } from '../core/types';
import { formatCurrency } from '../core/utils/formatters';
import { formatMonth } from '../core/constants';

export class CopyService {
  // ... existing methods ...

  // ─── NEW: Owner summary range ─────────────────────────────
  copyOwnerSummaryRange(ownerCharges: OwnerCharge[], fromMonth: string, toMonth: string): string {
    const lines = [
      `📊 Owner Charges Summary`,
      `Range: ${formatMonth(fromMonth)} → ${formatMonth(toMonth)}`,
      `Total charges: ${ownerCharges.length}`,
      '─'.repeat(40),
      '',
    ];

    ownerCharges.forEach((charge, idx) => {
      lines.push(`${idx + 1}. ${charge.name} (${charge.type})`);
      lines.push(`   Amount: ${formatCurrency(charge.amount || 0)}`);
      if (charge.note) lines.push(`   Note: ${charge.note}`);
      if (charge.duration) {
        const dur = charge.duration;
        if (dur.type === 'permanent') lines.push('   Duration: Permanent');
        else if (dur.type === 'one-time') lines.push(`   Duration: One-time (${formatMonth(dur.startMonth || '')})`);
        else if (dur.type === 'custom') {
          lines.push(`   Duration: ${formatMonth(dur.startMonth || '')} → ${formatMonth(dur.endMonth || '')}`);
        }
      }
      const tenantCount = charge.applyTo === 'all' ? 'All tenants' : `${charge.selectedTenants?.length || 0} tenants selected`;
      lines.push(`   Applied to: ${tenantCount}`);
      lines.push(`   Paid: ${charge.paid ? '✅' : '❌'}`);
      lines.push('');
    });

    if (ownerCharges.length === 0) {
      lines.push('No owner charges found in this range.');
    }

    return lines.join('\n');
  }

  // ─── NEW: Tenant range summary ─────────────────────────────
  copyTenantRange(tenant: Tenant, fromMonth: string, toMonth: string): string {
    // Get all months between fromMonth and toMonth
    const months = this.getMonthsInRange(fromMonth, toMonth);
    const lines = [
      `🏢 Tenant: ${tenant.name}`,
      `Range: ${formatMonth(fromMonth)} → ${formatMonth(toMonth)}`,
      '─'.repeat(40),
      '',
    ];

    let grandTotal = 0;
    let totalPaid = 0;
    let totalUnpaid = 0;

    months.forEach((month) => {
      const bill = tenant.bills[month];
      if (!bill) {
        lines.push(`📆 ${formatMonth(month)}: No bill`);
        return;
      }
      const monthTotal = bill.total || 0;
      const paid = bill.paid || false;
      grandTotal += monthTotal;
      if (paid) totalPaid += monthTotal;
      else totalUnpaid += monthTotal;

      lines.push(`📆 ${formatMonth(month)} — Total: ${formatCurrency(monthTotal)} ${paid ? '✅ Paid' : '❌ Unpaid'}`);
      if (bill.charges && bill.charges.length > 0) {
        bill.charges.forEach((c: Charge, idx: number) => {
          const paidMark = c.paid ? '✅' : '❌';
          lines.push(`   ${idx + 1}. ${c.name} (${c.type}) ${paidMark}  ${formatCurrency(c.amount)}`);
          if (c.note) lines.push(`      Note: ${c.note}`);
          if (c.type === 'meter') {
            lines.push(`      Reading: ${c.prevReading || 0} → ${c.currentReading || 0} (${c.unitsUsed || 0} units)`);
          }
        });
      } else {
        lines.push('   No charges');
      }
      lines.push('');
    });

    lines.push('─'.repeat(40));
    lines.push(`Grand Total: ${formatCurrency(grandTotal)}`);
    lines.push(`Paid: ${formatCurrency(totalPaid)}`);
    lines.push(`Unpaid: ${formatCurrency(totalUnpaid)}`);

    return lines.join('\n');
  }

  // ─── Helper: get months in range ──────────────────────────
  private getMonthsInRange(from: string, to: string): string[] {
    const months: string[] = [];
    let current = from;
    while (current <= to) {
      months.push(current);
      const [year, month] = current.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      date.setMonth(date.getMonth() + 1);
      current = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    return months;
  }
}

export const copyService = new CopyService();