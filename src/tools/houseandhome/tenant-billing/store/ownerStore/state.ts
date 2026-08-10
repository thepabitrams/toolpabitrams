// src/tools/houseandhome/tenant-billing/store/ownerStore/state.ts
import { OwnerState } from './types';

export const initialState: OwnerState = {
  groups: [],
  selectedGroupId: null,
  isLoading: false,
  ownerCharges: [],
};