// modules/settings/DeletedItems.tsx
import React from 'react';
import { MdDeleteSweep, MdRestore, MdDelete, MdInfo } from 'react-icons/md';
import { DeletedItem } from './types';

interface DeletedItemsProps {
  items: DeletedItem[];
  onRestore: (itemId: string) => void;
  onPermanentDelete: (itemId: string) => void;
  onClearAll: () => void;
  getDaysRemaining: (expiresAt: string) => number;
  formatSize: (bytes: number) => string;
}

export const DeletedItems: React.FC<DeletedItemsProps> = ({
  items,
  onRestore,
  onPermanentDelete,
  onClearAll,
  getDaysRemaining,
  formatSize,
}) => {
  // ─── 🔥 Get a readable label for each item ────────────────
  const getItemLabel = (item: DeletedItem): string => {
    const type = item.type || 'unknown';

    // Case 1: Owner Charge
    if (type === 'owner-charge' && item.originalData?.name) {
      return `${item.originalData.name} (Owner Charge)`;
    }

    // Case 2: Tenant Charge
    if (type === 'tenant-charge' && item.originalData?.name) {
      return `${item.originalData.name} (Tenant Charge)`;
    }

    // Case 3: Group
    if (type === 'group' && item.data?.groups?.length > 0) {
      return `${item.data.groups[0].name} (Group)`;
    }

    // Case 4: Tenant
    if (type === 'tenant' && item.data?.name) {
      return `${item.data.name} (Tenant)`;
    }

    // Case 5: Image
    if (type === 'image' && item.data?.tenantName && item.data?.fileName) {
      return `${item.data.tenantName} - ${item.data.fileName} (Image)`;
    }

    // ─── Fallback: Parse the filename ──────────────────────
    // Example: "charge_Electricity_Owner_abc123.json" -> "Electricity (Owner)"
    if (item.id) {
      const fileName = item.id.replace('.json', '');
      const parts = fileName.split('_');
      if (parts.length >= 3) {
        // parts = ['charge', 'Electricity', 'Owner', 'abc123']
        const typePrefix = parts[0]; // charge, group, tenant
        const namePart = parts.slice(1, -1).join(' '); // Electricity Owner
        let typeLabel = '';
        if (typePrefix === 'charge') {
          const subType = parts[parts.length - 2] || '';
          typeLabel = subType === 'Owner' ? 'Owner Charge' : 'Tenant Charge';
          return `${namePart} (${typeLabel})`;
        } else if (typePrefix === 'group') {
          return `${namePart} (Group)`;
        } else if (typePrefix === 'tenant') {
          if (parts.includes('image')) {
            return `${namePart} (Image)`;
          }
          return `${namePart} (Tenant)`;
        }
      }
      return item.id.replace('.json', '');
    }

    return 'Unknown Item';
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MdDeleteSweep className="text-gray-500" size={20} />
          <h2 className="font-semibold text-gray-700 dark:text-gray-300">Deleted Items</h2>
          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        {items.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-red-500 hover:text-red-600 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-gray-400 py-4 text-center">
          <MdInfo className="inline mr-1" /> No deleted items. Data is automatically kept for <strong>15 days</strong>.
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {items.map((item) => {
            const daysLeft = getDaysRemaining(item.expiresAt);
            const label = getItemLabel(item);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    {/* ─── 🔥 SHOW THE NAME INSTEAD OF COUNTS ─── */}
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      {label}
                    </div>
                    <div className="text-xs text-gray-400">
                      Deleted: {new Date(item.deletedAt).toLocaleDateString()} ·
                      {daysLeft > 0 ? (
                        <span className="text-green-500"> {daysLeft} days left</span>
                      ) : (
                        <span className="text-red-500"> Expired</span>
                      )}
                      · Size: {formatSize(item.size || 0)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {daysLeft > 0 && (
                    <button
                      onClick={() => onRestore(item.id)}
                      className="p-1.5 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Restore"
                    >
                      <MdRestore size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => onPermanentDelete(item.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Permanently delete"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};