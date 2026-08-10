// src/tools/houseandhome/tenant-billing/services/image.ts
import { Tenant, Charge, OwnerCharge } from '../core/types';
import { formatCurrency } from '../core/utils/formatters';
import { formatMonth } from '../core/constants';

export class ImageService {
  // ... existing methods ...

  // ─── NEW: Owner range image ───────────────────────────────
  async generateOwnerRangeImage(ownerCharges: OwnerCharge[], fromMonth: string, toMonth: string): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const width = 700;
    const lineHeight = 28;
    let height = 200 + ownerCharges.length * (lineHeight * 4) + 100;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('Owner Charges Summary', 20, 50);
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(`Range: ${formatMonth(fromMonth)} → ${formatMonth(toMonth)}`, 20, 80);

    let y = 120;
    if (ownerCharges.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText('No owner charges found.', 20, y);
    } else {
      ownerCharges.forEach((charge, idx) => {
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.fillText(`${idx + 1}. ${charge.name} (${charge.type})`, 20, y);
        y += lineHeight;
        ctx.font = '13px system-ui, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText(`   Amount: ${formatCurrency(charge.amount || 0)}`, 30, y);
        y += lineHeight;
        if (charge.note) {
          ctx.fillText(`   Note: ${charge.note}`, 30, y);
          y += lineHeight;
        }
        const dur = charge.duration;
        let durText = '';
        if (dur.type === 'permanent') durText = 'Permanent';
        else if (dur.type === 'one-time') durText = `One-time (${formatMonth(dur.startMonth || '')})`;
        else if (dur.type === 'custom') durText = `${formatMonth(dur.startMonth || '')} → ${formatMonth(dur.endMonth || '')}`;
        ctx.fillText(`   Duration: ${durText}`, 30, y);
        y += lineHeight;
        const tenantCount = charge.applyTo === 'all' ? 'All tenants' : `${charge.selectedTenants?.length || 0} tenants selected`;
        ctx.fillText(`   Applied to: ${tenantCount}`, 30, y);
        y += lineHeight;
        ctx.fillStyle = charge.paid ? '#22c55e' : '#ef4444';
        ctx.fillText(`   Paid: ${charge.paid ? '✅' : '❌'}`, 30, y);
        y += lineHeight + 8;
      });
    }

    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(`Generated: ${new Date().toLocaleString()}`, 20, height - 20);

    return canvas.toDataURL('image/png');
  }

  // ─── NEW: Tenant range image ──────────────────────────────
  async generateTenantRangeImage(tenant: Tenant, fromMonth: string, toMonth: string): Promise<string> {
    const months = this.getMonthsInRange(fromMonth, toMonth);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const width = 700;
    const lineHeight = 26;
    let totalLines = 10; // header + footer
    months.forEach((m) => {
      const bill = tenant.bills[m];
      if (bill) totalLines += 3 + (bill.charges?.length || 0) * 2;
      else totalLines += 2;
    });
    const height = 100 + totalLines * lineHeight + 40;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Header
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(`Tenant: ${tenant.name}`, 20, 50);
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(`Range: ${formatMonth(fromMonth)} → ${formatMonth(toMonth)}`, 20, 80);

    let y = 120;
    let grandTotal = 0;
    let totalPaid = 0;
    let totalUnpaid = 0;

    months.forEach((month) => {
      const bill = tenant.bills[month];
      if (!bill) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px system-ui, sans-serif';
        ctx.fillText(`📆 ${formatMonth(month)}: No bill`, 20, y);
        y += lineHeight;
        return;
      }
      const monthTotal = bill.total || 0;
      const paid = bill.paid || false;
      grandTotal += monthTotal;
      if (paid) totalPaid += monthTotal;
      else totalUnpaid += monthTotal;

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText(`📆 ${formatMonth(month)} — Total: ${formatCurrency(monthTotal)} ${paid ? '✅ Paid' : '❌ Unpaid'}`, 20, y);
      y += lineHeight;
      if (bill.charges && bill.charges.length > 0) {
        bill.charges.forEach((c: Charge) => {
          ctx.fillStyle = '#475569';
          ctx.font = '13px system-ui, sans-serif';
          const paidMark = c.paid ? '✅' : '❌';
          ctx.fillText(`   ${c.name} (${c.type}) ${paidMark}  ${formatCurrency(c.amount)}`, 30, y);
          y += lineHeight;
          if (c.note) {
            ctx.fillStyle = '#64748b';
            ctx.font = '12px system-ui, sans-serif';
            ctx.fillText(`      Note: ${c.note}`, 40, y);
            y += lineHeight;
          }
          if (c.type === 'meter') {
            ctx.fillStyle = '#64748b';
            ctx.font = '12px system-ui, sans-serif';
            ctx.fillText(`      Reading: ${c.prevReading || 0} → ${c.currentReading || 0} (${c.unitsUsed || 0} units)`, 40, y);
            y += lineHeight;
          }
        });
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px system-ui, sans-serif';
        ctx.fillText('   No charges', 30, y);
        y += lineHeight;
      }
      y += 8;
    });

    // Summary
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(`Grand Total: ${formatCurrency(grandTotal)}`, 20, y);
    y += lineHeight;
    ctx.fillStyle = '#22c55e';
    ctx.fillText(`Paid: ${formatCurrency(totalPaid)}`, 20, y);
    y += lineHeight;
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`Unpaid: ${formatCurrency(totalUnpaid)}`, 20, y);

    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(`Generated: ${new Date().toLocaleString()}`, 20, height - 20);

    return canvas.toDataURL('image/png');
  }

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

  // ... existing methods ...
}

export const imageService = new ImageService();