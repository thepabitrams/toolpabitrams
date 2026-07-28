// src/core/components/layout/AdBanner.tsx

const ADS_ENABLED = false; // 🔴 SET TO false FOR NOW

export function AdBanner() {
  // If ads are disabled, render NOTHING
  if (!ADS_ENABLED) {
    return null;
  }

  // Show placeholder (only when ADS_ENABLED = true)
  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-2 mb-4">
      <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 text-center min-h-[90px] flex items-center justify-center transition-all duration-200">
        <div className="text-sm text-gray-400 dark:text-gray-500">
          <span className="block text-xs uppercase tracking-wider font-medium">Advertisement</span>
          <span className="text-xs">Google Ad Placeholder (970 x 90)</span>
        </div>
      </div>
    </div>
  );
}