// src/tools/houseandhome/tenant-billing/store/ownerStore/actions/setSelectedGroupId.ts
export const setSelectedGroupId = (set: any) => (id: string | null) => {
  set({ selectedGroupId: id });
};