// modules/settings/BackupRestore.tsx
import React, { RefObject, useState } from 'react';
import { MdCloudDownload, MdCloudUpload, MdClose } from 'react-icons/md';

interface BackupRestoreProps {
  fileRef: RefObject<HTMLInputElement>;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRestoreWithStrategy?: (strategy: 'merge' | 'overwrite' | 'cancel') => void;
  isRestoring?: boolean;
  selectedFile?: File | null;
  onCancelRestore?: () => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({
  fileRef,
  onExport,
  onImport,
  onRestoreWithStrategy,
  isRestoring = false,
  selectedFile = null,
  onCancelRestore,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setShowOptions(true);
      onImport(e);
    }
  };

  const handleCancel = () => {
    setShowOptions(false);
    if (onCancelRestore) onCancelRestore();
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleStrategy = (strategy: 'merge' | 'overwrite' | 'cancel') => {
    if (strategy === 'cancel') {
      handleCancel();
      return;
    }
    if (onRestoreWithStrategy) {
      onRestoreWithStrategy(strategy);
      setShowOptions(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
        Backup & Restore
      </h2>

      {/* ─── Action Buttons ──────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
        >
          <MdCloudDownload size={18} /> Export Backup
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors shadow-sm"
        >
          <MdCloudUpload size={18} /> Restore Backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <p className="text-xs text-gray-400 text-center mt-2">
        Backup file includes all groups, tenants, charges & bills
      </p>

      {/* ─── Restore Options (Inline) ────────────────────────── */}
      {showOptions && selectedFile && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Restore Options
              </span>
              <span className="text-xs text-gray-400 ml-2">
                ({selectedFile.name})
              </span>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Cancel restore"
            >
              <MdClose size={18} />
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleStrategy('merge')}
              className="w-full text-left px-4 py-3 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="font-medium text-blue-700 dark:text-blue-300 text-sm">Merge</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Add new data, keep existing, update conflicts
              </div>
            </button>

            <button
              onClick={() => handleStrategy('overwrite')}
              className="w-full text-left px-4 py-3 rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <div className="font-medium text-red-700 dark:text-red-300 text-sm">Overwrite</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Replace ALL data with backup (existing data will be lost)
              </div>
            </button>

            <button
              onClick={() => handleStrategy('cancel')}
              className="w-full text-left px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="font-medium text-gray-700 dark:text-gray-300 text-sm">Cancel</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Don't restore anything, keep current data
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};