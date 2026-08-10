// src/tools/houseandhome/tenant-billing/modules/tenants/TenantDetail/ProfileCard/InfoSection.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/core/components/ui/Button';
import { Input } from '@/core/components/ui/Input';
import { Container } from '@/core/components/ui/Container';
import { MdPhone, MdLocationOn, MdNote, MdSave, MdClose } from 'react-icons/md';

interface InfoSectionProps {
  tenant: any;
  isEditing: boolean;
  onUpdate: (data: any) => void;
  onCancelEdit: () => void;
}

export const InfoSection: React.FC<InfoSectionProps> = ({
  tenant,
  isEditing,
  onUpdate,
  onCancelEdit,
}) => {
  const [editData, setEditData] = useState({
    name: tenant.name || '',
    phone: tenant.phone || '',
    address: tenant.address || '',
    note: tenant.note || '',
  });

  // Sync when tenant changes
  useEffect(() => {
    setEditData({
      name: tenant.name || '',
      phone: tenant.phone || '',
      address: tenant.address || '',
      note: tenant.note || '',
    });
  }, [tenant]);

  const handleSave = () => {
    onUpdate(editData);
    onCancelEdit();
  };

  const handleCancel = () => {
    setEditData({
      name: tenant.name || '',
      phone: tenant.phone || '',
      address: tenant.address || '',
      note: tenant.note || '',
    });
    onCancelEdit();
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Input
          placeholder="Name"
          value={editData.name}
          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          className="w-full text-sm"
        />
        <Input
          placeholder="Phone"
          value={editData.phone}
          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
          className="w-full text-sm"
        />
        <Input
          placeholder="Address"
          value={editData.address}
          onChange={(e) => setEditData({ ...editData, address: e.target.value })}
          className="w-full text-sm"
        />
        <textarea
          placeholder="Note (security deposit, lease terms...)"
          value={editData.note}
          onChange={(e) => setEditData({ ...editData, note: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-y"
        />
        <div className="flex gap-2 mt-2">
          <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleSave}>
            <MdSave className="w-4 h-4 mr-1" /> Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <MdClose className="w-4 h-4 mr-1" /> Cancel
          </Button>
        </div>
      </div>
    );
  }

  // ─── DISPLAY MODE – All info inside gray container (NO border) ──────
  return (
    <Container className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 space-y-2">
      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
        <MdPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span>{tenant.phone || 'No phone'}</span>
      </div>
      
      {tenant.address && (
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <MdLocationOn className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>{tenant.address}</span>
        </div>
      )}
      
      {tenant.note && (
        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
          <MdNote className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="whitespace-pre-wrap">{tenant.note}</span>
        </div>
      )}

      {!tenant.phone && !tenant.address && !tenant.note && (
        <div className="text-sm text-gray-400 text-center py-2">
          No information added yet
        </div>
      )}
    </Container>
  );
};