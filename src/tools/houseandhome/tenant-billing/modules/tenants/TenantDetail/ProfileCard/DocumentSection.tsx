// src/tools/houseandhome/tenant-billing/modules/tenants/TenantDetail/ProfileCard/DocumentSection.tsx
import React, { useState, useRef } from 'react';
import { Container } from '@/core/components/ui/Container';
import { Overlay } from '@/core/components/ui/Overlay';
import { MdAdd, MdDeleteOutline, MdDownload, MdClose as MdCloseIcon, MdDescription } from 'react-icons/md';

interface DocumentSectionProps {
  documents: Array<{ id: string; url: string; label: string }>;
  onAddDocument?: (file: File, label: string) => Promise<void>;
  onDeleteDocument?: (docId: string) => Promise<void>;
}

export const DocumentSection: React.FC<DocumentSectionProps> = ({
  documents = [],
  onAddDocument,
  onDeleteDocument,
}) => {
  const [previewDoc, setPreviewDoc] = useState<{ url: string; label: string } | null>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAddDocument) return;
    try {
      const label = prompt('Enter document label (e.g., Aadhar, Lease, ID Card):', 'Document');
      if (label && label.trim()) {
        await onAddDocument(file, label.trim());
      } else {
        const defaultLabel = `Doc ${documents.length + 1}`;
        await onAddDocument(file, defaultLabel);
      }
    } catch (error) {
      console.error('Document upload failed:', error);
    }
    e.target.value = '';
  };

  const openDocPicker = () => {
    docInputRef.current?.click();
  };

  const openPreview = (doc: { url: string; label: string }) => {
    setPreviewDoc(doc);
  };

  const closePreview = () => {
    setPreviewDoc(null);
  };

  const downloadDoc = (url: string, label: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${label}.png`;
    link.click();
  };

  return (
    <>
      <Container className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <MdDescription className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Documents
            </span>
            <span className="text-xs text-gray-400">({documents.length})</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="relative group cursor-pointer flex-shrink-0"
              onClick={() => openPreview(doc)}
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 hover:border-blue-500 transition-colors">
                <img
                  src={doc.url}
                  alt={doc.label}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-gray-400 bg-white dark:bg-gray-800 px-1 rounded whitespace-nowrap">
                {doc.label}
              </span>
              {onDeleteDocument && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDocument(doc.id);
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MdDeleteOutline className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {onAddDocument && (
            <button
              onClick={openDocPicker}
              className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-colors flex-shrink-0"
              title="Add document"
            >
              <MdAdd className="w-6 h-6" />
            </button>
          )}
          {documents.length === 0 && !onAddDocument && (
            <span className="text-xs text-gray-400">No documents</span>
          )}
        </div>
      </Container>

      {/* ─── DOCUMENT PREVIEW OVERLAY ───────────────────────── */}
      {previewDoc && (
        <Overlay isOpen={!!previewDoc} onClose={closePreview}>
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {previewDoc.label}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadDoc(previewDoc.url, previewDoc.label)}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Download"
                  >
                    <MdDownload className="w-5 h-5" />
                  </button>
                  <button
                    onClick={closePreview}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Close"
                  >
                    <MdCloseIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src={previewDoc.url}
                  alt={previewDoc.label}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        </Overlay>
      )}

      <input
        ref={docInputRef}
        type="file"
        accept="image/*"
        onChange={handleDocumentUpload}
        className="hidden"
      />
    </>
  );
};