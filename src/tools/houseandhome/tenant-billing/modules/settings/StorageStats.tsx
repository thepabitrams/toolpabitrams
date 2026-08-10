// modules/settings/StorageStats.tsx
import React from 'react';
import { MdStorage } from 'react-icons/md';

interface StorageStatsProps {
  stats: {
    groups: number;
    tenants: number;
    charges: number;
    folders: number;
    files: number;
  };
  isLoading: boolean;
}

export const StorageStats: React.FC<StorageStatsProps> = ({ stats, isLoading }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <MdStorage className="text-gray-500" size={20} />
        <h2 className="font-semibold text-gray-700 dark:text-gray-300">Storage Overview</h2>
      </div>
      {isLoading ? (
        <div className="text-sm text-gray-400">Loading stats...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
            <div className="text-xs text-gray-500">Groups</div>
            <div className="text-lg font-bold text-gray-700">{stats.groups}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
            <div className="text-xs text-gray-500">Tenants</div>
            <div className="text-lg font-bold text-gray-700">{stats.tenants}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
            <div className="text-xs text-gray-500">Charges</div>
            <div className="text-lg font-bold text-gray-700">{stats.charges}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
            <div className="text-xs text-gray-500">Files / Folders</div>
            <div className="text-lg font-bold text-gray-700">
              {stats.files} / {stats.folders}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};