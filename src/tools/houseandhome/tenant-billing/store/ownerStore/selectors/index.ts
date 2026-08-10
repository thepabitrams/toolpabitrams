// src/tools/houseandhome/tenant-billing/store/ownerStore/selectors/index.ts
import { OwnerState } from '../types';

export const getGroupCharges = (state: OwnerState, groupId: string) => {
  return state.ownerCharges.filter(c => c.groupId === groupId);
};

export const getSelectedGroup = (state: OwnerState) => {
  return state.groups.find(g => g.id === state.selectedGroupId);
};

export const getTenantCount = (state: OwnerState) => {
  const group = getSelectedGroup(state);
  return group?.tenantCount || 0;
};