// src/tools/houseandhome/tenant-billing/store/ownerStore/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialState } from './state';
import { OwnerStore } from './types';
import * as actions from './actions';

export const useOwnerStore = create<OwnerStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      loadGroups: actions.loadGroups(set, get),
      loadOwnerCharges: actions.loadOwnerCharges(set), // 👈 Now accepts groupId
      createOwnerCharge: actions.createOwnerCharge(set, get),
      updateOwnerCharge: actions.updateOwnerCharge(set, get),
      deleteOwnerCharge: actions.deleteOwnerCharge(set, get),
      createGroup: actions.createGroup(set, get),
      updateGroup: actions.updateGroup(set, get),
      deleteGroup: actions.deleteGroup(set, get),
      setSelectedGroupId: actions.setSelectedGroupId(set),
    }),
    {
      name: 'owner-store',
      partialize: (state) => ({ selectedGroupId: state.selectedGroupId }),
    }
  )
);

export * as selectors from './selectors';