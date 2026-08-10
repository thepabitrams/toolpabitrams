// src/tools/houseandhome/tenant-billing/core/types/index.ts

export interface Owner {
  id: string;
  name: string;
  rates: {
    electricity: number;
    water: number;
    maintenance: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  ownerId: string;
  name: string;
  phone: string;
  photo?: string;
  address?: string;
  note?: string;
  bills: Record<string, Bill>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  expiresAt?: string | null;
}

export interface Bill {
  month: string;
  charges: Charge[];
  total: number;
  paid: boolean;
  paidAt?: string | null;
}

export interface Charge {
  id: string;
  name: string;
  type: 'meter' | 'fixed' | 'one-time' | 'pay-later';
  note?: string;
  paid: boolean;
  paidAt?: string | null;
  duration: Duration;
  
  // Meter
  prevReading?: number;
  currentReading?: number;
  unitsUsed?: number;
  rate?: number;
  overrideRate?: number | null;
  finalRate?: number;
  
  // Fixed
  lastMonthPaid?: number;
  overrideAmount?: number | null;
  
  // One-Time
  totalAmount?: number;
  splitAmong?: string[];
  eachPays?: number;
  
  // Pay-Later
  decrementAmount?: number;
  remainingAmount?: number;
  startBalance?: number;
  
  amount: number;
  ownerChargeId?: string;
}

export interface Duration {
  type: 'permanent' | 'custom' | 'one-time';
  startMonth?: string;
  endMonth?: string;
}

export type MonthStatus = 'past' | 'current' | 'future';

export interface PayLaterResult {
  currentAmount: number;
  remainingAmount: number;
  isComplete: boolean;
  monthsRemaining: number;
}

export interface GroupMeta {
  id: string;
  name: string;
  tenantCount: number;
  updatedAt: string;
}

export interface TenantMeta {
  id: string;
  groupId: string;
  name: string;
  phone: string;
  hasPhoto: boolean;
  photo?: string;
  updatedAt: string;
}

export interface BillMeta {
  id: string;
  tenantId: string;
  month: string;
  total: number;
  paid: boolean;
  paidAt?: string | null;
}

// ─── 🔥 UPDATED: Added paid and paidAt ──────────────────────
export interface OwnerCharge {
  id: string;
  groupId: string;
  name: string;
  type: 'meter' | 'fixed' | 'one-time' | 'pay-later';
  note?: string;
  duration: Duration;
  
  // Meter
  totalBill?: number;
  totalUnits?: number;
  rate?: number;
  
  // Fixed
  fixedAmount?: number;
  
  // One-Time
  totalAmount?: number;
  splitAmong?: string[];
  eachPays?: number;
  
  // Pay-Later
  decrementAmount?: number;
  remainingAmount?: number;
  startBalance?: number;
  
  // ─── 🔥 NEW ──────────────────────────────────────────────────
  paid?: boolean;        // Whether the owner has paid this bill
  paidAt?: string | null; // When the owner paid
  
  applyTo: 'all' | 'selected';
  selectedTenants?: string[];
  createdAt: string;
  updatedAt: string;
}