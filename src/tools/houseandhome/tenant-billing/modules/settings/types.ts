// modules/settings/types.ts
export interface DeletedItem {
  id: string;
  deletedAt: string;
  expiresAt: string;
  data: {
    groups?: any[];
    tenants?: any[];
    charges?: any[];
    tenantFullData?: { [id: string]: any };
    // ─── For images ────────────────────────────────────────
    tenantName?: string;
    fileName?: string;
    imageData?: string;
    groupId?: string;
  };
  size: number;
  // ─── 🔥 ADD THESE ──────────────────────────────────────────
  type?: string;         // 'owner-charge', 'tenant-charge', 'group', 'tenant', 'image'
  originalData?: any;    // The original charge data (has the name!)
}