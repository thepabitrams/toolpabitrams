// src/tools/houseandhome/tenant-billing/services/metadata.ts
import { GroupMeta, TenantMeta, BillMeta } from '../core/types';

const DB_NAME = 'TenantBillingDB';
const DB_VERSION = 2; // 👈 Version 2 for new structure

class MetadataService {
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;

        // ─── Groups store ────────────────────────────────────
        if (!db.objectStoreNames.contains('groups')) {
          const store = db.createObjectStore('groups', { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
        }

        // ─── Tenants store ──────────────────────────────────
        if (!db.objectStoreNames.contains('tenants')) {
          const store = db.createObjectStore('tenants', { keyPath: 'id' });
          store.createIndex('groupId', 'groupId', { unique: false });
          store.createIndex('name', 'name', { unique: false });
        }

        // ─── Bills store ────────────────────────────────────
        if (!db.objectStoreNames.contains('bills')) {
          const store = db.createObjectStore('bills', { keyPath: 'id' });
          store.createIndex('tenantId', 'tenantId', { unique: false });
          store.createIndex('month', 'month', { unique: false });
          store.createIndex('paid', 'paid', { unique: false });
        }

        // ─── Recycle store (NEW) ────────────────────────────
        if (!db.objectStoreNames.contains('recycle')) {
          const store = db.createObjectStore('recycle', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('groupId', 'groupId', { unique: false });
          store.createIndex('deletedAt', 'deletedAt', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
      req.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };
      req.onerror = () => reject(req.error);
    });
  }

  private async getStore(name: string, mode: IDBTransactionMode = 'readonly') {
    const db = await this.init();
    return db.transaction(name, mode).objectStore(name);
  }

  // ─── GROUPS ──────────────────────────────────────────────────
  async saveGroups(groups: GroupMeta[]) {
    const store = await this.getStore('groups', 'readwrite');
    await this.clearStore('groups');
    for (const g of groups) store.add(g);
  }

  async getGroups(): Promise<GroupMeta[]> {
    const store = await this.getStore('groups');
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve([]);
    });
  }

  async getGroup(id: string): Promise<GroupMeta | null> {
    const store = await this.getStore('groups');
    return new Promise((resolve) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  // ─── TENANTS ──────────────────────────────────────────────────
  async saveTenants(tenants: TenantMeta[]) {
    const store = await this.getStore('tenants', 'readwrite');
    await this.clearStore('tenants');
    for (const t of tenants) store.add(t);
  }

  async getTenants(): Promise<TenantMeta[]> {
    const store = await this.getStore('tenants');
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve([]);
    });
  }

  async getTenantsByGroup(groupId: string): Promise<TenantMeta[]> {
    const store = await this.getStore('tenants');
    return new Promise((resolve) => {
      const idx = store.index('groupId');
      const req = idx.getAll(groupId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve([]);
    });
  }

  async saveTenant(tenant: TenantMeta) {
    const store = await this.getStore('tenants', 'readwrite');
    store.put(tenant);
  }

  async deleteTenant(id: string) {
    const store = await this.getStore('tenants', 'readwrite');
    store.delete(id);
  }

  // ─── BILLS ────────────────────────────────────────────────────
  async saveBill(bill: BillMeta) {
    const store = await this.getStore('bills', 'readwrite');
    store.put(bill);
  }

  async getBillsByTenant(tenantId: string): Promise<BillMeta[]> {
    const store = await this.getStore('bills');
    return new Promise((resolve) => {
      const idx = store.index('tenantId');
      const req = idx.getAll(tenantId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve([]);
    });
  }

  async getAllBills(): Promise<BillMeta[]> {
    const store = await this.getStore('bills');
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve([]);
    });
  }

  async updateBillPaid(tenantId: string, month: string, paid: boolean, paidAt?: string) {
    const id = `${tenantId}-${month}`;
    const store = await this.getStore('bills', 'readwrite');
    const req = store.get(id);
    return new Promise((resolve) => {
      req.onsuccess = () => {
        const bill = req.result;
        if (bill) {
          bill.paid = paid;
          bill.paidAt = paidAt || null;
          store.put(bill);
          resolve(true);
        } else resolve(false);
      };
      req.onerror = () => resolve(false);
    });
  }

  // ─── RECYCLE (NEW) ────────────────────────────────────────────
  async saveRecycleItem(item: any) {
    const store = await this.getStore('recycle', 'readwrite');
    store.put(item);
  }

  async getRecycleItems(): Promise<any[]> {
    const store = await this.getStore('recycle');
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve([]);
    });
  }

  async getRecycleItemsByType(type: string): Promise<any[]> {
    const store = await this.getStore('recycle');
    return new Promise((resolve) => {
      const idx = store.index('type');
      const req = idx.getAll(type);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve([]);
    });
  }

  async deleteRecycleItem(id: string) {
    const store = await this.getStore('recycle', 'readwrite');
    store.delete(id);
  }

  async clearExpiredRecycleItems(): Promise<number> {
    const items = await this.getRecycleItems();
    const now = new Date();
    let deleted = 0;
    for (const item of items) {
      if (new Date(item.expiresAt) < now) {
        await this.deleteRecycleItem(item.id);
        deleted++;
      }
    }
    return deleted;
  }

  // ─── CLEAR ────────────────────────────────────────────────────
  async clearAll() {
    await this.clearStore('groups');
    await this.clearStore('tenants');
    await this.clearStore('bills');
    await this.clearStore('recycle');
  }

  private async clearStore(storeName: string) {
    const store = await this.getStore(storeName, 'readwrite');
    store.clear();
  }
}

export const metadata = new MetadataService();