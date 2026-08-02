// src/core/components/layout/AdBanner.tsx

import { useEffect, useRef } from 'react';

// 🔴 SET THIS TO 'true' WHEN YOU'RE READY TO SHOW REAL ADS
// For now, keep it false while developing
const ADS_ENABLED = false; // 👈 CHANGE TO 'true' BEFORE PRODUCTION

export function AdBanner() {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only run if ads are enabled and not already initialized
    if (!ADS_ENABLED || initializedRef.current) return;

    // Wait a moment for the DOM to be ready
    const timer = setTimeout(() => {
      try {
        if (typeof window.adsbygoogle !== 'undefined') {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          initializedRef.current = true;
          console.log('✅ AdSense initialized');
        }
      } catch (error) {
        console.warn('AdSense initialization error:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // If ads are disabled, render nothing
  if (!ADS_ENABLED) {
    return null;
  }

  return (
    <div ref={adContainerRef} className="w-full max-w-7xl mx-auto px-4 mt-2 mb-4">
      <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 text-center min-h-[90px] flex items-center justify-center transition-all duration-200">
        {/* ✅ GOOGLE ADSENSE AD UNIT */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9469903624940946"
          data-ad-slot="YOUR_AD_SLOT_ID" // ⚠️ REPLACE WITH YOUR ACTUAL SLOT ID
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}