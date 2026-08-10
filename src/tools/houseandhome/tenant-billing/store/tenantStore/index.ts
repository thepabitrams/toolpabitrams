// src/tools/houseandhome/tenant-billing/store/tenantStore/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialState } from './state';
import { TenantStore } from './types';
import * as actions from './actions';

export const useTenantStore = create<TenantStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      loadTenants: actions.loadTenants(set, get),
      addTenant: actions.addTenant(set, get),
      updateTenant: actions.updateTenant(set, get),
      deleteTenant: actions.deleteTenant(set, get),
      getTenantFull: actions.getTenantFull(set, get),
      saveTenantFull: actions.saveTenantFull(set, get),
      addChargeToTenant: actions.addChargeToTenant(set, get),
      deleteTenantCharge: actions.deleteTenantCharge(set, get), // 👈 ADD THIS
      syncTenantCharges: actions.syncTenantCharges(set, get),
      refreshTenantBills: actions.refreshTenantBills(set, get),
    }),
    {
      name: 'tenant-store',
      partialize: (state) => ({ tenants: state.tenants }),
    }
  )
);

export * as selectors from './selectors';