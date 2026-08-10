// src/tools/houseandhome/tenant-billing/store/tenantStore/selectors/index.ts
import { TenantState } from '../types';

export const getTenantsByGroup = (state: TenantState, groupId: string) => {
  return state.tenants.filter((t: any) => t.groupId === groupId);
};

export const getTenantById = (state: TenantState, id: string) => {
  return state.tenants.find((t: any) => t.id === id);
};

export const getTenantCount = (state: TenantState) => {
  return state.tenants.length;
};