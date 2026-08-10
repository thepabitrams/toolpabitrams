// src/tools/houseandhome/tenant-billing/modules/tenants/TenantDetail/index.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Card } from '@/core/components/ui/Card';
import { useUIStore } from '../../../store/uiStore';
import { useOwnerStore } from '../../../store/ownerStore';
import { useTenantStore } from '../../../store/tenantStore';
import { copyService } from '../../../services/copy';
import { imageService } from '../../../services/image';
import { compression } from '../../../services/compression';
import { ProfileCard } from './ProfileCard';
import { StatusCard } from '../../shared/StatusCard';
import { FooterCard } from '../../shared/FooterCard';
import { AddChargeOverlay } from '../../shared/AddChargeOverlay';
import { ChargesCard } from './ChargesCard';
import { MdPerson } from 'react-icons/md';
import { getCurrentMonth } from '../../../core/constants';

export const TenantDetail = () => {
  const { selectedTenantId, selectedMonth } = useUIStore();
  const { selectedGroupId, ownerCharges } = useOwnerStore();
  const { getTenantFull, saveTenantFull, deleteTenant, addChargeToTenant } = useTenantStore();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(new Date().toISOString());
  const [showChargeOverlay, setShowChargeOverlay] = useState(false);
  const refreshTimer = useRef<number | null>(null);
  const isRefreshing = useRef<boolean>(false);
  const lastRefreshTime = useRef<number>(0);

  // ─── Range state ──────────────────────────────────────────
  const currentMonth = getCurrentMonth();
  const [fromMonth, setFromMonth] = useState(currentMonth);
  const [toMonth, setToMonth] = useState(currentMonth);

  // ─── Helper: Check if month is past ──────────────────────
  const isPastMonth = (month: string): boolean => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return month < currentMonth;
  };

  const isReadOnly = isPastMonth(selectedMonth);

  // ─── Range Handlers ──────────────────────────────────────
  const handleFromMonthChange = (year: string, month: string) => {
    const newMonth = `${year}-${month}`;
    setFromMonth(newMonth);
    if (newMonth > toMonth) setToMonth(newMonth);
  };

  const handleToMonthChange = (year: string, month: string) => {
    const newMonth = `${year}-${month}`;
    if (newMonth < fromMonth) {
      setFromMonth(newMonth);
    }
    setToMonth(newMonth);
  };

  // ─── Load tenant data ──────────────────────────────────────
  const loadTenantData = async (showLoading = true) => {
    // ─── Safety check: if no tenant or group, clear state ──
    if (!selectedTenantId || !selectedGroupId) {
      console.log('🔍 No tenant or group selected, clearing state');
      setTenant(null);
      setLoading(false);
      return;
    }

    // ─── 🔥 FIX: If refresh flag is stuck, force reset ──────
    // If the flag has been true for more than 10 seconds,
    // it's definitely stuck – force reset it.
    if (isRefreshing.current && (Date.now() - lastRefreshTime.current > 10000)) {
      console.warn('⚠️ Refresh was stuck for >10s, resetting...');
      isRefreshing.current = false;
    }

    if (isRefreshing.current) {
      console.log('⏳ Refresh already in progress, skipping...');
      return;
    }

    isRefreshing.current = true;
    if (showLoading) setLoading(true);
    
    try {
      console.log('📡 Calling getTenantFull for:', selectedTenantId);
      const t = await getTenantFull(selectedTenantId, selectedGroupId);
      console.log('✅ getTenantFull returned:', t ? 'data' : 'null');
      
      if (!t) {
        if (showLoading) setLoading(false);
        console.warn('❌ Tenant data is null');
        return;
      }
      
      if (!t.documents) t.documents = [];
      setTenant(t);
      setUpdatedAt(new Date().toISOString());
      lastRefreshTime.current = Date.now();
      console.log('✅ Tenant loaded successfully:', t.name);
    } catch (error) {
      console.error('❌ Failed to load tenant:', error);
      if (showLoading) setLoading(false);
    } finally {
      if (showLoading) setLoading(false);
      isRefreshing.current = false;
      console.log('🔚 loadTenantData finished');
    }
  };

  // ─── Initial load ──────────────────────────────────────────
  useEffect(() => {
    console.log('🔄 Initial load effect triggered', { selectedTenantId, selectedGroupId });
    // Reset refreshing flag on new tenant selection
    isRefreshing.current = false;
    loadTenantData(true);
  }, [selectedTenantId, selectedGroupId]);

  // ─── Month change: reload data ────────────────────────────
  useEffect(() => {
    if (selectedTenantId && selectedGroupId) {
      console.log('🔄 Month changed to:', selectedMonth);
      loadTenantData(false);
    }
  }, [selectedMonth]);

  // ─── Auto-refresh with debounce and flag ──────────────────
  useEffect(() => {
    if (!tenant || !selectedTenantId || !selectedGroupId) return;

    const relevantCharges = ownerCharges.filter(c => c.groupId === selectedGroupId);
    const hasRecentUpdate = relevantCharges.some(c => {
      const updatedAtTime = new Date(c.updatedAt).getTime();
      const now = Date.now();
      return (now - updatedAtTime) < 3000;
    });

    if (!hasRecentUpdate) return;

    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }

    refreshTimer.current = setTimeout(() => {
      const now = Date.now();
      if (now - lastRefreshTime.current > 1000) {
        console.log('🔄 Auto-refreshing tenant due to owner charge change...');
        loadTenantData(false);
      } else {
        console.log('⏳ Skipping refresh – too soon after previous refresh');
      }
      refreshTimer.current = null;
    }, 500);

    return () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }
    };
  }, [ownerCharges, tenant, selectedTenantId, selectedGroupId]);

  // ─── Handler for when charge is added/edited ──────────────
  const handleChargeSuccess = async () => {
    console.log('📌 Charge success callback triggered');
    // Wait for file system to settle
    await new Promise(resolve => setTimeout(resolve, 350));
    await loadTenantData(false);
  };

  // ─── Handlers ──────────────────────────────────────────────
  const handleUpdateTenant = async (data: any) => {
    if (!tenant) return;
    const updated = { ...tenant, ...data, updatedAt: new Date().toISOString() };
    await saveTenantFull(updated);
    setTenant(updated);
    setUpdatedAt(new Date().toISOString());
  };

  const handleDeleteTenant = async () => {
    if (!tenant) return;
    if (window.confirm(`Delete "${tenant.name}" and all their data?`)) {
      await deleteTenant(tenant.id, tenant.ownerId);
      useUIStore.getState().setSelectedTenantId(null);
    }
  };

  const handlePhotoUpdate = async (photoData: string) => {
    if (!tenant) return;
    const updated = { ...tenant, photo: photoData, updatedAt: new Date().toISOString() };
    await saveTenantFull(updated);
    setTenant(updated);
    setUpdatedAt(new Date().toISOString());
  };

  const handleAddDocument = async (file: File, label: string) => {
    if (!tenant) return;
    try {
      const compressed = await compression.compressImage(file, 300, 0.8);
      const newDoc = {
        id: crypto.randomUUID(),
        url: compressed,
        label: label.trim(),
      };
      const updatedDocs = [...(tenant.documents || []), newDoc];
      const updated = { ...tenant, documents: updatedDocs, updatedAt: new Date().toISOString() };
      await saveTenantFull(updated);
      setTenant(updated);
      setUpdatedAt(new Date().toISOString());
    } catch (error) {
      console.error('Document upload failed:', error);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!tenant) return;
    const updatedDocs = (tenant.documents || []).filter((d: any) => d.id !== docId);
    const updated = { ...tenant, documents: updatedDocs, updatedAt: new Date().toISOString() };
    await saveTenantFull(updated);
    setTenant(updated);
    setUpdatedAt(new Date().toISOString());
  };

  // ─── Charges handler ──────────────────────────────────────
  const handleChargesChange = async (updatedCharges: any[]) => {
    if (!tenant) return;
    const bill = tenant.bills[selectedMonth];
    if (!bill) return;
    bill.charges = updatedCharges;
    bill.total = updatedCharges.reduce((sum: number, c: any) => sum + c.amount, 0);
    await saveTenantFull(tenant);
    setTenant({ ...tenant });
    setUpdatedAt(new Date().toISOString());
  };

  // ─── Save function ──────────────────────────────────────────
  const handleSave = async () => {
    if (!tenant) return;
    await saveTenantFull(tenant);
    setUpdatedAt(new Date().toISOString());
    console.log('✅ Tenant data saved');
  };

  // ─── Range-based Copy ─────────────────────────────────────
  const handleCopyRange = () => {
    if (!tenant) return;
    const text = copyService.copyTenantRange(tenant, fromMonth, toMonth);
    copyService.copyText(text);
  };

  // ─── Range-based Export Image ─────────────────────────────
  const handleExportRangeImage = async () => {
    if (!tenant) return;
    const dataUrl = await imageService.generateTenantRangeImage(tenant, fromMonth, toMonth);
    imageService.downloadImage(dataUrl, `tenant_${tenant.name}_${fromMonth}_to_${toMonth}.png`);
  };

  // ─── Empty state ──────────────────────────────────────────
  if (!selectedTenantId) {
    return (
      <Card className="p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-12 text-gray-400 dark:text-gray-500 text-sm">
          <MdPerson className="w-6 h-6 mr-2" />
          Select a tenant from the list above to view details
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-12 text-gray-400 dark:text-gray-500">Loading...</div>
      </Card>
    );
  }

  if (!tenant) {
    return (
      <Card className="p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-12 text-red-500 text-sm">❌ Tenant not found</div>
      </Card>
    );
  }

  const bill = tenant.bills[selectedMonth] || {
    month: selectedMonth,
    charges: [],
    total: 0,
    paid: false,
  };

  return (
    <div className="space-y-4">
      <ProfileCard
        tenant={tenant}
        onUpdate={handleUpdateTenant}
        onDelete={handleDeleteTenant}
        onPhotoUpdate={handlePhotoUpdate}
        onAddDocument={handleAddDocument}
        onDeleteDocument={handleDeleteDocument}
        documents={tenant.documents || []}
      />

      <StatusCard bill={bill} selectedMonth={selectedMonth} updatedAt={updatedAt} />

      <ChargesCard
        tenantId={tenant.id}
        groupId={tenant.ownerId}
        charges={bill.charges}
        onChargesChange={handleChargesChange}
        selectedMonth={selectedMonth}
        isReadOnly={isReadOnly}
        onRefresh={() => loadTenantData(false)}
      />

      <FooterCard
        fromMonth={fromMonth}
        toMonth={toMonth}
        onFromMonthChange={handleFromMonthChange}
        onToMonthChange={handleToMonthChange}
        onCopy={handleCopyRange}
        onExport={handleExportRangeImage}
        onSave={handleSave}
        saveLabel="Save"
        isSavePrimary={true}
      />

      <AddChargeOverlay
        isOpen={showChargeOverlay}
        onClose={() => setShowChargeOverlay(false)}
        mode="tenant"
        tenantId={tenant.id}
        groupId={tenant.ownerId}
        onSuccess={handleChargeSuccess}
      />
    </div>
  );
};

export default TenantDetail;