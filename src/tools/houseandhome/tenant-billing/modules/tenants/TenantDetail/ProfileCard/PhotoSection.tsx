// src/tools/houseandhome/tenant-billing/modules/tenants/TenantDetail/ProfileCard/PhotoSection.tsx
import React, { useState, useRef } from 'react';
import { Overlay } from '@/core/motion/components/overlay';
import { MdPhotoCamera, MdDownload, MdClose as MdCloseIcon } from 'react-icons/md';
import { compression } from '../../../../services/compression';

interface PhotoSectionProps {
  tenant: any;
  onPhotoUpdate?: (photoData: string) => void;
}

export const PhotoSection: React.FC<PhotoSectionProps> = ({ tenant, onPhotoUpdate }) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── File picker (ONLY opens file picker, NO overlay) ──
  const handleUpdateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compression.compressImage(file, 300, 0.8);
      if (onPhotoUpdate) {
        onPhotoUpdate(compressed);
      }
    } catch (error) {
      console.error('Photo upload failed:', error);
    }
    e.target.value = '';
  };

  // ─── Open photo preview (ONLY overlay, NO file picker) ──
  const openPhotoPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (tenant.photo) {
      setPhotoPreview(tenant.photo);
    }
  };

  const downloadPhoto = () => {
    if (tenant.photo) {
      const link = document.createElement('a');
      link.href = tenant.photo;
      link.download = `${tenant.name}_photo.png`;
      link.click();
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        {/* ─── Photo circle ────────────────────────────────── */}
        <div
          className="relative group cursor-pointer"
          onClick={openPhotoPreview}
        >
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300 text-4xl font-bold overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 transition-colors">
            {tenant.photo ? (
              <img
                src={tenant.photo}
                alt={tenant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              tenant.name.charAt(0).toUpperCase()
            )}
          </div>
          
          {/* ─── Camera icon (update photo) ────────────────── */}
          {onPhotoUpdate && (
            <button
              onClick={handleUpdateClick}
              className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1.5 shadow-lg hover:bg-blue-600 transition-colors"
              title="Update profile photo"
            >
              <MdPhotoCamera className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ─── "Update Photo" text ──────────────────────────── */}
        <button
          onClick={handleUpdateClick}
          className="text-xs text-blue-500 hover:text-blue-600"
          type="button"
        >
          Update Photo
        </button>

        {/* ─── Hidden file input ────────────────────────────── */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>

      {/* ─── PHOTO PREVIEW OVERLAY ─────────────────────────── */}
      {photoPreview && (
        <Overlay isOpen={!!photoPreview} onClose={() => setPhotoPreview(null)}>
          <div className="flex flex-col items-center justify-center h-full w-full p-4">
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {/* ─── Top right buttons ────────────────────── */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  onClick={downloadPhoto}
                  className="p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-lg transition-colors"
                  title="Download"
                >
                  <MdDownload className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setPhotoPreview(null)}
                  className="p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-lg transition-colors"
                  title="Close"
                >
                  <MdCloseIcon className="w-6 h-6" />
                </button>
              </div>
              
              {/* ─── Image ─────────────────────────────────── */}
              <img
                src={photoPreview}
                alt={tenant.name}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
};