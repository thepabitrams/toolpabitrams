// src/tools/houseandhome/tenant-billing/store/ownerStore/types.ts
import { GroupMeta, OwnerCharge } from '../../core/types';

export interface OwnerState {
  groups: GroupMeta[];
  selectedGroupId: string | null;
  isLoading: boolean;
  ownerCharges: OwnerCharge[];
}

export interface OwnerActions {
  loadGroups: () => Promise<void>;
  loadOwnerCharges: () => Promise<void>;
  createOwnerCharge: (charge: Omit<OwnerCharge, 'id' | 'createdAt' | 'updatedAt' | 'rate' | 'eachPays' | 'paid' | 'paidAt'>) => Promise<OwnerCharge>;
  updateOwnerCharge: (id: string, data: Partial<OwnerCharge>) => Promise<void>;
  deleteOwnerCharge: (id: string) => Promise<void>;
  createGroup: (name: string) => Promise<void>;
  updateGroup: (id: string, name: string) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  setSelectedGroupId: (id: string | null) => void;
}

export type OwnerStore = OwnerState & OwnerActions;