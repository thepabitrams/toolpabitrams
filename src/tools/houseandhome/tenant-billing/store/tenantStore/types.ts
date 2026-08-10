// src/tools/houseandhome/tenant-billing/store/tenantStore/types.ts
import { TenantMeta, Tenant, OwnerCharge } from '../../core/types';

export interface TenantState {
  tenants: TenantMeta[];
  isLoading: boolean;
}

export interface TenantActions {
  loadTenants: (groupId: string) => Promise<void>;
  addTenant: (groupId: string, tenant: Omit<Tenant, 'id' | 'ownerId' | 'bills' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTenant: (id: string, data: Partial<Tenant>) => Promise<void>;
  deleteTenant: (id: string, groupId: string) => Promise<void>;
  getTenantFull: (id: string, groupId: string) => Promise<Tenant | null>;
  saveTenantFull: (tenant: Tenant) => Promise<void>;
  addChargeToTenant: (tenantId: string, month: string, chargeData: any) => Promise<void>;
  deleteTenantCharge: (tenantId: string, groupId: string, chargeId: string) => Promise<void>; // 👈 ADD THIS
  syncTenantCharges: (tenantId: string, groupId: string, month: string) => Promise<void>;
  refreshTenantBills: (tenantId: string, groupId: string) => Promise<void>;
}

export type TenantStore = TenantState & TenantActions;