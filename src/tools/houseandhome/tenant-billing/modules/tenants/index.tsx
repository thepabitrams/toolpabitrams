// src/tools/houseandhome/tenant-billing/modules/tenants/index.tsx
import React, { useEffect } from 'react';
import { Container } from '@/core/components/ui/Container';
import { useOwnerStore } from '../../store/ownerStore';
import { useTenantStore } from '../../store/tenantStore';
import { useUIStore } from '../../store/uiStore';
import { TenantAdd } from './TenantAdd';
import { TenantDetail } from './TenantDetail';

export const TenantModule = () => {
  const { selectedGroupId } = useOwnerStore();
  const { loadTenants } = useTenantStore();
  const { selectedTenantId, setSelectedTenantId } = useUIStore();

  useEffect(() => {
    if (selectedGroupId) {
      // ─── 🔥 FIX: Clear everything BEFORE loading ──────────
      setSelectedTenantId(null);
      // ─── Force a reset of tenant store ──────────────────────
      useTenantStore.setState({ tenants: [], isLoading: true });
      // ─── Now load the new tenants ───────────────────────────
      loadTenants(selectedGroupId);
    } else {
      // If no group selected, clear everything
      useTenantStore.setState({ tenants: [], isLoading: false });
      setSelectedTenantId(null);
    }
  }, [selectedGroupId]); // 👈 Runs when group changes

  const handleBack = () => {
    setSelectedTenantId(null);
  };

  return (
    <Container className="space-y-4">
      <div className="flex justify-start">
        <button
          onClick={handleBack}
          className="text-blue-500 hover:underline text-sm"
        >
          ← Back to properties
        </button>
      </div>

      <TenantAdd />

      {selectedTenantId && <TenantDetail />}
    </Container>
  );
};