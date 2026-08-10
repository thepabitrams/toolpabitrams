// src/tools/houseandhome/tenant-billing/modules/shared/AddChargeOverlay/TenantSelector.tsx
import React from 'react';

interface TenantSelectorProps {
  tenants: any[];
  applyTo: 'all' | 'selected';
  setApplyTo: (val: 'all' | 'selected') => void;
  selectedTenants: string[];
  toggleTenant: (id: string) => void;
}

export const TenantSelector: React.FC<TenantSelectorProps> = ({
  tenants,
  applyTo,
  setApplyTo,
  selectedTenants,
  toggleTenant,
}) => {
  // ─── 🔥 FIX: Clicking a tenant auto-switches to "Selected" ──
  const handleTenantClick = (id: string) => {
    if (applyTo === 'all') {
      setApplyTo('selected'); // 👈 Auto-switch!
    }
    toggleTenant(id); // 👈 Toggle the tenant
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Apply to
      </label>
      
      <div className="flex items-center gap-4 mb-3">
        <label className="flex items-center gap-1 text-sm">
          <input
            type="radio"
            checked={applyTo === 'all'}
            onChange={() => setApplyTo('all')}
          />
          All Tenants
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="radio"
            checked={applyTo === 'selected'}
            onChange={() => setApplyTo('selected')}
          />
          Select Tenants
        </label>
      </div>

      {applyTo === 'selected' && tenants.length > 0 && (
        <div className="max-h-60 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {tenants.map((t) => {
              const isSelected = selectedTenants.includes(t.id);
              return (
                <div
                  key={t.id}
                  onClick={() => handleTenantClick(t.id)} // 👈 Uses the new handler
                  className={`cursor-pointer p-3 rounded-lg transition-all duration-200 text-center ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-500 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200'
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
                  <div className="mt-1 font-medium text-xs truncate">{t.name}</div>
                  {isSelected && (
                    <span className="text-xs text-blue-500">✓ Selected</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {applyTo === 'selected' && tenants.length === 0 && (
        <div className="text-sm text-gray-400 py-4 text-center">
          No tenants in this property.
        </div>
      )}
    </div>
  );
};