// src/tools/houseandhome/tenant-billing/modules/tenants/TenantList.tsx
import React, { useEffect } from 'react';
import { useTenantStore } from '../../store/tenantStore';
import { useUIStore } from '../../store/uiStore';

export const TenantList = () => {
  const { tenants } = useTenantStore();
  const { setSelectedTenantId, selectedTenantId } = useUIStore();

  // ─── 🔥 FIX: If selected tenant is not in the list, clear it ──
  useEffect(() => {
    if (selectedTenantId && !tenants.some(t => t.id === selectedTenantId)) {
      setSelectedTenantId(null);
    }
  }, [tenants, selectedTenantId]);

  if (tenants.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
        No tenants yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {tenants.map((t) => (
        <div
          key={t.id}
          onClick={() => setSelectedTenantId(t.id)}
          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 text-center ${
            selectedTenantId === t.id
              ? 'bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-500 shadow-sm'
              : 'bg-white dark:bg-gray-800 border-2 border-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200'
          }`}
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300 text-lg font-bold overflow-hidden">
            {t.photo ? (
              <img
                src={t.photo}
                alt={t.name}
                className="w-full h-full object-cover"
              />
            ) : (
              t.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="mt-1 font-medium text-sm truncate">{t.name}</div>
        </div>
      ))}
    </div>
  );
};