// src/tools/houseandhome/tenant-billing/modules/tenants/TenantDetail/ProfileCard/index.tsx
import React, { useState } from 'react';
import { Card } from '@/core/components/ui/Card';
import { MdEdit, MdDelete } from 'react-icons/md';
import { PhotoSection } from './PhotoSection';
import { InfoSection } from './InfoSection';
import { DocumentSection } from './DocumentSection';

interface ProfileCardProps {
  tenant: any;
  onUpdate: (data: any) => void;
  onDelete: () => void;
  onPhotoUpdate?: (photoData: string) => void;
  onAddDocument?: (file: File, label: string) => Promise<void>;
  onDeleteDocument?: (docId: string) => Promise<void>;
  documents?: Array<{ id: string; url: string; label: string }>;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  tenant,
  onUpdate,
  onDelete,
  onPhotoUpdate,
  onAddDocument,
  onDeleteDocument,
  documents = [],
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <Card className="p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* ─── HEADER ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {tenant.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleEdit}
            className={`p-1.5 rounded-lg transition-colors ${
              isEditing
                ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={isEditing ? 'Close edit' : 'Edit tenant'}
          >
            <MdEdit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Delete tenant"
          >
            <MdDelete className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── BODY ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* ─── PHOTO ────────────────────────────────────────── */}
        <div className="md:col-span-1">
          <PhotoSection 
            tenant={tenant} 
            onPhotoUpdate={onPhotoUpdate}
          />
        </div>

        {/* ─── INFO ─────────────────────────────────────────── */}
        <div className="md:col-span-2">
          <InfoSection
            tenant={tenant}
            isEditing={isEditing}
            onUpdate={onUpdate}
            onCancelEdit={() => setIsEditing(false)}
          />
        </div>

        {/* ─── DOCUMENTS ────────────────────────────────────── */}
        <div className="md:col-span-1">
          {!isEditing && (
            <DocumentSection
              documents={documents}
              onAddDocument={onAddDocument}
              onDeleteDocument={onDeleteDocument}
            />
          )}
        </div>
      </div>
    </Card>
  );
};