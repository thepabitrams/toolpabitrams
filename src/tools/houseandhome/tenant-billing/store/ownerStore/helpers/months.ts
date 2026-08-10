// src/tools/houseandhome/tenant-billing/store/ownerStore/helpers/months.ts
import { OwnerCharge } from '../../../core/types';

export function getMonthsInRange(startMonth: string, endMonth: string): string[] {
  const months: string[] = [];
  let current = startMonth;
  
  while (current <= endMonth) {
    months.push(current);
    const [year, month] = current.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() + 1);
    current = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  
  return months;
}

export function getPropagationMonths(
  duration: { type: 'permanent' | 'custom' | 'one-time'; startMonth?: string; endMonth?: string },
  currentMonth: string
): string[] {
  if (duration.type === 'permanent') {
    const startMonth = duration.startMonth || currentMonth;
    const endMonth = new Date(startMonth);
    endMonth.setMonth(endMonth.getMonth() + 12);
    const endMonthStr = `${endMonth.getFullYear()}-${String(endMonth.getMonth() + 1).padStart(2, '0')}`;
    return getMonthsInRange(startMonth, endMonthStr);
  }
  
  if (duration.type === 'custom') {
    if (duration.startMonth && duration.endMonth) {
      return getMonthsInRange(duration.startMonth, duration.endMonth);
    }
    return [];
  }
  
  if (duration.type === 'one-time') {
    const month = duration.startMonth || currentMonth;
    return [month];
  }
  
  return [];
}

export function shouldChargeBeInMonth(
  duration: { type: 'permanent' | 'custom' | 'one-time'; startMonth?: string; endMonth?: string },
  month: string
): boolean {
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