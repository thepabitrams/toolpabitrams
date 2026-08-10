// src/tools/houseandhome/tenant-billing/modules/owner/index.tsx
import React, { useState } from 'react';
import { OwnerHeader } from './OwnerHeaderCard';
import { StatusCard } from '../shared/StatusCard';
import { OwnerCharges } from './OwnerChargesCard';
import { FooterCard } from '../shared/FooterCard';
import { useOwnerStore } from '../../store/ownerStore';
import { useTenantStore } from '../../store/tenantStore';
import { useUIStore } from '../../store/uiStore';
import { copyService } from '../../services/copy';
import { imageService } from '../../services/image';
import { formatMonth, getCurrentMonth } from '../../core/constants';

export const OwnerCard = () => {
  const { groups, selectedGroupId, ownerCharges } = useOwnerStore();
  const { tenants } = useTenantStore();
  const { selectedMonth } = useUIStore();

  // ─── Range state ──────────────────────────────────────────
  const currentMonth = getCurrentMonth();
  const [fromMonth, setFromMonth] = useState(currentMonth);
  const [toMonth, setToMonth] = useState(currentMonth);

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

  // ─── Copy & Export Handlers ──────────────────────────────
  const handleCopySummary = () => {
    const text = copyService.copyOwnerSummaryRange(ownerCharges, fromMonth, toMonth);
    copyService.copyText(text);
  };

  const handleExportImage = async () => {
    const dataUrl = await imageService.generateOwnerRangeImage(ownerCharges, fromMonth, toMonth);
    imageService.downloadImage(dataUrl, `owner_summary_${fromMonth}_to_${toMonth}.png`);
  };

  const handleSave = () => {
    console.log('✅ Owner data saved (auto-saved to OPFS + IndexedDB)');
  };

  return (
    <>
      <OwnerHeader />
      <StatusCard />
      <OwnerCharges />
      <FooterCard
        fromMonth={fromMonth}
        toMonth={toMonth}
        onFromMonthChange={handleFromMonthChange}
        onToMonthChange={handleToMonthChange}
        onCopy={handleCopySummary}
        onExport={handleExportImage}
        onSave={handleSave}
        saveLabel="Save"
        isSavePrimary={true}   // ← Blue button
      />
    </>
  );
};

export default OwnerCard;