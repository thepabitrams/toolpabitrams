import { useState, useEffect } from 'react';
import { CURRENCIES, COUNTRY_TO_CURRENCY, DEFAULT_CURRENCY } from '../data/currencyData';

export function useUserCurrency() {
  const [detectedCurrency, setDetectedCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        // Method 1: Try browser language
        const lang = navigator.language;
        const countryCode = lang.split('-')[1]?.toUpperCase();
        
        if (countryCode && COUNTRY_TO_CURRENCY[countryCode]) {
          setDetectedCurrency(COUNTRY_TO_CURRENCY[countryCode]);
          setIsLoading(false);
          return;
        }

        // Method 2: Try IP-based geolocation
        try {
          const response = await fetch('https://ipapi.co/json/', {
            headers: { 'Accept': 'application/json' }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.country_code) {
              const country = data.country_code.toUpperCase();
              if (COUNTRY_TO_CURRENCY[country]) {
                setDetectedCurrency(COUNTRY_TO_CURRENCY[country]);
                setIsLoading(false);
                return;
              }
            }
          }
        } catch {
          // Fall through
        }

        // Method 3: Try timezone-based detection
        try {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (timezone) {
            const timezoneParts = timezone.split('/');
            if (timezoneParts.length === 2) {
              const region = timezoneParts[1].replace(/_/g, ' ');
              const timezoneMap: Record<string, string> = {
                'India': 'INR',
                'Kolkata': 'INR',
                'New York': 'USD',
                'Los Angeles': 'USD',
                'San Francisco': 'USD',
                'Chicago': 'USD',
                'London': 'GBP',
                'Paris': 'EUR',
                'Berlin': 'EUR',
                'Rome': 'EUR',
                'Madrid': 'EUR',
                'Tokyo': 'JPY',
                'Osaka': 'JPY',
                'Sydney': 'AUD',
                'Melbourne': 'AUD',
                'Singapore': 'SGD',
                'Hong Kong': 'HKD',
                'Dubai': 'AED',
                'Moscow': 'RUB',
                'Shanghai': 'CNY',
                'Beijing': 'CNY',
                'Seoul': 'KRW',
                'Bangkok': 'THB',
                'Jakarta': 'IDR',
                'Kuala Lumpur': 'MYR',
                'Manila': 'PHP',
                'Mumbai': 'INR',
                'Delhi': 'INR',
                'Bangalore': 'INR',
              };
              
              // Try exact match
              if (timezoneMap[region]) {
                setDetectedCurrency(timezoneMap[region]);
                setIsLoading(false);
                return;
              }
              
              // Try partial match
              for (const [key, value] of Object.entries(timezoneMap)) {
                if (region.includes(key) || key.includes(region)) {
                  setDetectedCurrency(value);
                  setIsLoading(false);
                  return;
                }
              }
            }
          }
        } catch {
          // Fall through
        }

        // Fallback: Use default
        setDetectedCurrency(DEFAULT_CURRENCY);
      } catch {
        setDetectedCurrency(DEFAULT_CURRENCY);
      } finally {
        setIsLoading(false);
      }
    };

    detectCurrency();
  }, []);

  return { detectedCurrency, isLoading };
}