// src/tools/houseandhome/tenant-billing/services/storage.ts

export class StorageService {
  private root: FileSystemDirectoryHandle | null = null;
  private basePath = 'tenant-billing';

  // ─── INIT ──────────────────────────────────────────────────────
  async init() {
    if (this.root) return this.root;
    const root = await navigator.storage.getDirectory();
    this.root = await root.getDirectoryHandle(this.basePath, { create: true });
    return this.root;
  }

  // ─── GROUP PATH ──────────────────────────────────────────────
  async getGroupPath(groupId: string): Promise<FileSystemDirectoryHandle> {
    const root = await this.init();
    return await root.getDirectoryHandle(`group_${groupId}`, { create: true });
  }

  // ─── OWNER PATH ──────────────────────────────────────────────
  async getOwnerPath(groupId: string): Promise<FileSystemDirectoryHandle> {
    const group = await this.getGroupPath(groupId);
    return await group.getDirectoryHandle('owner', { create: true });
  }

  // ─── READ/WRITE OWNER YEARLY ────────────────────────────────
  async readOwnerYear(groupId: string, year: string): Promise<any | null> {
    const owner = await this.getOwnerPath(groupId);
    try {
      const file = await owner.getFileHandle(`${year}.json`);
      const data = await file.getFile();
      return JSON.parse(await data.text());
    } catch {
      return { year, charges: [], updatedAt: new Date().toISOString() };
    }
  }

  async writeOwnerYear(groupId: string, year: string, data: any): Promise<void> {
    const owner = await this.getOwnerPath(groupId);
    const file = await owner.getFileHandle(`${year}.json`, { create: true });
    const writable = await file.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  }

  // ─── TENANT PATH ─────────────────────────────────────────────
  async getTenantPath(groupId: string, tenantName: string): Promise<FileSystemDirectoryHandle> {
    const group = await this.getGroupPath(groupId);
    const tenants = await group.getDirectoryHandle('tenants', { create: true });
    return await tenants.getDirectoryHandle(tenantName, { create: true });
  }

  // ─── READ/WRITE TENANT YEARLY ───────────────────────────────
  async readTenantYear(groupId: string, tenantName: string, year: string): Promise<any | null> {
    const tenant = await this.getTenantPath(groupId, tenantName);
    try {
      const file = await tenant.getFileHandle(`${year}.json`);
      const data = await file.getFile();
      return JSON.parse(await data.text());
    } catch {
      return { year, bills: {}, updatedAt: new Date().toISOString() };
    }
  }

  async writeTenantYear(groupId: string, tenantName: string, year: string, data: any): Promise<void> {
    const tenant = await this.getTenantPath(groupId, tenantName);
    const file = await tenant.getFileHandle(`${year}.json`, { create: true });
    const writable = await file.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  }

  // ─── READ/WRITE TENANT PROFILE ──────────────────────────────
  async readTenantProfile(groupId: string, tenantName: string): Promise<any | null> {
    const tenant = await this.getTenantPath(groupId, tenantName);
    try {
      const file = await tenant.getFileHandle('profile.json');
      const data = await file.getFile();
      return JSON.parse(await data.text());
    } catch {
      return null;
    }
  }

  async writeTenantProfile(groupId: string, tenantName: string, data: any): Promise<void> {
    const tenant = await this.getTenantPath(groupId, tenantName);
    const file = await tenant.getFileHandle('profile.json', { create: true });
    const writable = await file.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  }

  // ─── TENANT INDEX ────────────────────────────────────────────
  async readTenantsIndex(groupId: string): Promise<any[]> {
    const group = await this.getGroupPath(groupId);
    try {
      const file = await group.getFileHandle('tenants/tenants.json');
      const data = await file.getFile();
      return JSON.parse(await data.text());
    } catch {
      return [];
    }
  }

  async writeTenantsIndex(groupId: string, data: any[]): Promise<void> {
    const group = await this.getGroupPath(groupId);
    const tenantsFolder = await group.getDirectoryHandle('tenants', { create: true });
    const file = await tenantsFolder.getFileHandle('tenants.json', { create: true });
    const writable = await file.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  }

  // ─── PHOTOS ──────────────────────────────────────────────────
  async getPhotosPath(groupId: string, tenantName: string): Promise<FileSystemDirectoryHandle> {
    const tenant = await this.getTenantPath(groupId, tenantName);
    return await tenant.getDirectoryHandle('images', { create: true });
  }

  async uploadPhoto(groupId: string, tenantName: string, fileName: string, data: string): Promise<void> {
    const photos = await this.getPhotosPath(groupId, tenantName);
    const file = await photos.getFileHandle(fileName, { create: true });
    const writable = await file.createWritable();
    await writable.write(data);
    await writable.close();
  }

  async deletePhoto(groupId: string, tenantName: string, fileName: string): Promise<void> {
    const photos = await this.getPhotosPath(groupId, tenantName);
    try {
      await photos.removeEntry(fileName);
    } catch {}
  }

  // ─── 🖼️ DELETE PHOTO WITH RECYCLE ──────────────────────────
  async deletePhotoWithRecycle(
    groupId: string,
    tenantName: string,
    fileName: string
  ): Promise<void> {
    const uniqueId = Math.random().toString(36).substring(2, 10);
    
    await this.moveToRecycle({
      type: 'image',
      groupId: groupId,
      tenantName: tenantName,
      fileName: fileName,
      uniqueId: uniqueId,
      data: {
        groupId: groupId,
        tenantName: tenantName,
        fileName: fileName,
      },
    });

    await this.deletePhoto(groupId, tenantName, fileName);
    console.log(`🖼️ Photo "${fileName}" moved to recycle for ${tenantName}`);
  }

  async listPhotos(groupId: string, tenantName: string): Promise<string[]> {
    const photos = await this.getPhotosPath(groupId, tenantName);
    const entries: string[] = [];
    for await (const entry of photos.values()) {
      if (entry.kind === 'file') entries.push(entry.name);
    }
    return entries;
  }

  // ─── RECYCLE BIN (FLAT) ──────────────────────────────────────
  async getRecyclePath(): Promise<FileSystemDirectoryHandle> {
    const root = await this.init();
    return await root.getDirectoryHandle('recycle', { create: true });
  }

  async moveToRecycle(data: any): Promise<void> {
    const recycle = await this.getRecyclePath();
    const type = data.type || 'item';
    
    // ─── 🔥 Get unique ID ──────────────────────────────────────
    let uniqueId = data.id || data.originalData?.id || data.tenantId || data.groupId || data.uniqueId;
    
    if (!uniqueId) {
      uniqueId = Math.random().toString(36).substring(2, 10);
    }
    
    // ─── Clean the name ────────────────────────────────────────
    let name = data.name || data.tenantName || 'unknown';
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
    
    // ─── 🔥 BUILD FILENAME: TYPE_NAME_SUBTYPE_ID.json ────────
    let fileName = '';
    
    if (type === 'owner-charge') {
      // charge_Electricity_Owner_abc123.json
      fileName = `charge_${cleanName}_Owner_${uniqueId}.json`;
    } 
    else if (type === 'tenant-charge') {
      // charge_WiFi_Tenant_abc123.json
      fileName = `charge_${cleanName}_Tenant_${uniqueId}.json`;
    } 
    else if (type === 'group') {
      // group_Mikun_abc123.json
      fileName = `group_${cleanName}_${uniqueId}.json`;
    } 
    else if (type === 'tenant') {
      // tenant_Barsha_abc123.json
      fileName = `tenant_${cleanName}_${uniqueId}.json`;
    } 
    else if (type === 'image') {
      // tenant_Barsha_image_profile_pic_abc123.json
      const tenantClean = data.tenantName ? data.tenantName.replace(/[^a-zA-Z0-9]/g, '_') : 'unknown';
      const fileClean = data.fileName ? data.fileName.replace(/[^a-zA-Z0-9.]/g, '_') : 'unknown';
      fileName = `tenant_${tenantClean}_image_${fileClean}_${uniqueId}.json`;
    } 
    else {
      // Fallback
      fileName = `${type}_${cleanName}_${uniqueId}.json`;
    }

    const file = await recycle.getFileHandle(fileName, { create: true });
    const writable = await file.createWritable();
    await writable.write(
      JSON.stringify(
        {
          ...data,
          deletedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        null,
        2
      )
    );
    await writable.close();

    console.log(`🗑️ Moved to recycle: ${fileName}`);
  }

  async listRecycleItems(): Promise<string[]> {
    const recycle = await this.getRecyclePath();
    const items: string[] = [];
    for await (const entry of recycle.values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.json')) {
        items.push(entry.name);
      }
    }
    return items;
  }

  async readRecycleItem(fileName: string): Promise<any | null> {
    const recycle = await this.getRecyclePath();
    try {
      const file = await recycle.getFileHandle(fileName);
      const data = await file.getFile();
      return JSON.parse(await data.text());
    } catch {
      return null;
    }
  }

  async deleteRecycleItem(fileName: string): Promise<void> {
    const recycle = await this.getRecyclePath();
    try {
      await recycle.removeEntry(fileName);
      console.log(`🗑️ Permanently deleted: ${fileName}`);
    } catch (e) {
      console.error(`Failed to delete ${fileName}:`, e);
    }
  }

  // ─── LEGACY METHODS ──────────────────────────────────────────
  async readFile<T = any>(path: string): Promise<T | null> {
    try {
      const root = await this.init();
      const parts = path.split('/').filter(Boolean);
      let dir = root;
      for (let i = 0; i < parts.length - 1; i++) {
        dir = await dir.getDirectoryHandle(parts[i]);
      }
      const file = await dir.getFileHandle(parts[parts.length - 1]);
      const data = await file.getFile();
      return JSON.parse(await data.text());
    } catch {
      return null;
    }
  }

  async writeFile(path: string, data: any): Promise<void> {
    const root = await this.init();
    const parts = path.split('/').filter(Boolean);
    let dir = root;
    for (let i = 0; i < parts.length - 1; i++) {
      dir = await dir.getDirectoryHandle(parts[i], { create: true });
    }
    const file = await dir.getFileHandle(parts[parts.length - 1], { create: true });
    const writable = await file.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const root = await this.init();
      const parts = path.split('/').filter(Boolean);
      let dir = root;
      for (let i = 0; i < parts.length - 1; i++) {
        dir = await dir.getDirectoryHandle(parts[i]);
      }
      await dir.removeEntry(parts[parts.length - 1]);
    } catch {}
  }

  async deleteFolder(folderPath: string): Promise<void> {
    try {
      const root = await this.init();
      const parts = folderPath.split('/').filter(Boolean);
      let dir = root;
      for (const part of parts) {
        dir = await dir.getDirectoryHandle(part);
      }
      await dir.remove({ recursive: true });
    } catch {}
  }

  async listFiles(folderPath: string): Promise<string[]> {
    const root = await this.init();
    const parts = folderPath.split('/').filter(Boolean);
    let dir = root;
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part);
    }
    const entries: string[] = [];
    for await (const entry of dir.values()) {
      if (entry.kind === 'file') entries.push(entry.name);
    }
    return entries;
  }

  async clearAll(): Promise<void> {
    const root = await this.init();
    try {
      await root.remove({ recursive: true });
    } catch (e) {
      console.warn('ClearAll: could not remove root, maybe it does not exist', e);
    }
    this.root = null;
    await this.init();
  }
}

export const storage = new StorageService();