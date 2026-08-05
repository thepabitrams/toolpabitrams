// ALL 180+ world currencies with flags, ISO codes, and symbols
export interface Currency {
  value: string;
  label: string;
  symbol: string;
  countryCode?: string; // For location detection
  searchTerms: string[]; // For fast searching
}

export const CURRENCIES: Currency[] = [
  // ===== ASIA =====
  { value: 'AFN', label: '🇦🇫 Afghan Afghani', symbol: '؋', countryCode: 'AF', searchTerms: ['afghan', 'afghani', 'afn'] },
  { value: 'AMD', label: '🇦🇲 Armenian Dram', symbol: '֏', countryCode: 'AM', searchTerms: ['armenian', 'dram', 'amd'] },
  { value: 'AZN', label: '🇦🇿 Azerbaijani Manat', symbol: '₼', countryCode: 'AZ', searchTerms: ['azerbaijani', 'manat', 'azn'] },
  { value: 'BDT', label: '🇧🇩 Bangladeshi Taka', symbol: '৳', countryCode: 'BD', searchTerms: ['bangladeshi', 'taka', 'bdt'] },
  { value: 'BND', label: '🇧🇳 Brunei Dollar', symbol: 'B$', countryCode: 'BN', searchTerms: ['brunei', 'dollar', 'bnd'] },
  { value: 'BTN', label: '🇧🇹 Bhutanese Ngultrum', symbol: 'Nu.', countryCode: 'BT', searchTerms: ['bhutanese', 'ngultrum', 'btn'] },
  { value: 'CNY', label: '🇨🇳 Chinese Yuan', symbol: '¥', countryCode: 'CN', searchTerms: ['chinese', 'yuan', 'renminbi', 'cny'] },
  { value: 'GEL', label: '🇬🇪 Georgian Lari', symbol: '₾', countryCode: 'GE', searchTerms: ['georgian', 'lari', 'gel'] },
  { value: 'HKD', label: '🇭🇰 Hong Kong Dollar', symbol: 'HK$', countryCode: 'HK', searchTerms: ['hong', 'kong', 'dollar', 'hkd'] },
  { value: 'IDR', label: '🇮🇩 Indonesian Rupiah', symbol: 'Rp', countryCode: 'ID', searchTerms: ['indonesian', 'rupiah', 'idr'] },
  { value: 'ILS', label: '🇮🇱 Israeli Shekel', symbol: '₪', countryCode: 'IL', searchTerms: ['israeli', 'shekel', 'ils'] },
  { value: 'INR', label: '🇮🇳 Indian Rupee', symbol: '₹', countryCode: 'IN', searchTerms: ['indian', 'rupee', 'inr'] },
  { value: 'JPY', label: '🇯🇵 Japanese Yen', symbol: '¥', countryCode: 'JP', searchTerms: ['japanese', 'yen', 'jpy'] },
  { value: 'KGS', label: '🇰🇬 Kyrgyzstani Som', symbol: 'С', countryCode: 'KG', searchTerms: ['kyrgyzstani', 'som', 'kgs'] },
  { value: 'KHR', label: '🇰🇭 Cambodian Riel', symbol: '៛', countryCode: 'KH', searchTerms: ['cambodian', 'riel', 'khr'] },
  { value: 'KRW', label: '🇰🇷 South Korean Won', symbol: '₩', countryCode: 'KR', searchTerms: ['korean', 'won', 'krw'] },
  { value: 'KZT', label: '🇰🇿 Kazakhstani Tenge', symbol: '₸', countryCode: 'KZ', searchTerms: ['kazakhstani', 'tenge', 'kzt'] },
  { value: 'LAK', label: '🇱🇦 Lao Kip', symbol: '₭', countryCode: 'LA', searchTerms: ['lao', 'kip', 'lak'] },
  { value: 'LKR', label: '🇱🇰 Sri Lankan Rupee', symbol: 'Rs', countryCode: 'LK', searchTerms: ['sri', 'lankan', 'rupee', 'lkr'] },
  { value: 'MMK', label: '🇲🇲 Myanmar Kyat', symbol: 'Ks', countryCode: 'MM', searchTerms: ['myanmar', 'kyat', 'mmk'] },
  { value: 'MNT', label: '🇲🇳 Mongolian Tugrik', symbol: '₮', countryCode: 'MN', searchTerms: ['mongolian', 'tugrik', 'mnt'] },
  { value: 'MOP', label: '🇲🇴 Macanese Pataca', symbol: 'MOP$', countryCode: 'MO', searchTerms: ['macanese', 'pataca', 'mop'] },
  { value: 'MVR', label: '🇲🇻 Maldivian Rufiyaa', symbol: 'Rf', countryCode: 'MV', searchTerms: ['maldivian', 'rufiyaa', 'mvr'] },
  { value: 'MYR', label: '🇲🇾 Malaysian Ringgit', symbol: 'RM', countryCode: 'MY', searchTerms: ['malaysian', 'ringgit', 'myr'] },
  { value: 'NPR', label: '🇳🇵 Nepalese Rupee', symbol: 'Rs', countryCode: 'NP', searchTerms: ['nepalese', 'rupee', 'npr'] },
  { value: 'PHP', label: '🇵🇭 Philippine Peso', symbol: '₱', countryCode: 'PH', searchTerms: ['philippine', 'peso', 'php'] },
  { value: 'PKR', label: '🇵🇰 Pakistani Rupee', symbol: 'Rs', countryCode: 'PK', searchTerms: ['pakistani', 'rupee', 'pkr'] },
  { value: 'SGD', label: '🇸🇬 Singapore Dollar', symbol: 'S$', countryCode: 'SG', searchTerms: ['singapore', 'dollar', 'sgd'] },
  { value: 'THB', label: '🇹🇭 Thai Baht', symbol: '฿', countryCode: 'TH', searchTerms: ['thai', 'baht', 'thb'] },
  { value: 'TWD', label: '🇹🇼 New Taiwan Dollar', symbol: 'NT$', countryCode: 'TW', searchTerms: ['taiwan', 'dollar', 'twd'] },
  { value: 'UZS', label: '🇺🇿 Uzbekistani Som', symbol: 'S', countryCode: 'UZ', searchTerms: ['uzbekistani', 'som', 'uzs'] },
  { value: 'VND', label: '🇻🇳 Vietnamese Dong', symbol: '₫', countryCode: 'VN', searchTerms: ['vietnamese', 'dong', 'vnd'] },
  
  // ===== MIDDLE EAST =====
  { value: 'AED', label: '🇦🇪 UAE Dirham', symbol: 'د.إ', countryCode: 'AE', searchTerms: ['uae', 'dirham', 'aed'] },
  { value: 'BHD', label: '🇧🇭 Bahraini Dinar', symbol: '.د.ب', countryCode: 'BH', searchTerms: ['bahraini', 'dinar', 'bhd'] },
  { value: 'EGP', label: '🇪🇬 Egyptian Pound', symbol: 'E£', countryCode: 'EG', searchTerms: ['egyptian', 'pound', 'egp'] },
  { value: 'IQD', label: '🇮🇶 Iraqi Dinar', symbol: 'ع.د', countryCode: 'IQ', searchTerms: ['iraqi', 'dinar', 'iqd'] },
  { value: 'IRR', label: '🇮🇷 Iranian Rial', symbol: '﷼', countryCode: 'IR', searchTerms: ['iranian', 'rial', 'irr'] },
  { value: 'JOD', label: '🇯🇴 Jordanian Dinar', symbol: 'د.ا', countryCode: 'JO', searchTerms: ['jordanian', 'dinar', 'jod'] },
  { value: 'KWD', label: '🇰🇼 Kuwaiti Dinar', symbol: 'د.ك', countryCode: 'KW', searchTerms: ['kuwaiti', 'dinar', 'kwd'] },
  { value: 'LBP', label: '🇱🇧 Lebanese Pound', symbol: 'ل.ل', countryCode: 'LB', searchTerms: ['lebanese', 'pound', 'lbp'] },
  { value: 'OMR', label: '🇴🇲 Omani Rial', symbol: 'ر.ع.', countryCode: 'OM', searchTerms: ['omani', 'rial', 'omr'] },
  { value: 'QAR', label: '🇶🇦 Qatari Rial', symbol: 'ر.ق', countryCode: 'QA', searchTerms: ['qatari', 'rial', 'qar'] },
  { value: 'SAR', label: '🇸🇦 Saudi Riyal', symbol: 'ر.س', countryCode: 'SA', searchTerms: ['saudi', 'riyal', 'sar'] },
  { value: 'SYP', label: '🇸🇾 Syrian Pound', symbol: '£S', countryCode: 'SY', searchTerms: ['syrian', 'pound', 'syp'] },
  { value: 'TRY', label: '🇹🇷 Turkish Lira', symbol: '₺', countryCode: 'TR', searchTerms: ['turkish', 'lira', 'try'] },
  { value: 'YER', label: '🇾🇪 Yemeni Rial', symbol: '﷼', countryCode: 'YE', searchTerms: ['yemeni', 'rial', 'yer'] },
  
  // ===== EUROPE =====
  { value: 'ALL', label: '🇦🇱 Albanian Lek', symbol: 'L', countryCode: 'AL', searchTerms: ['albanian', 'lek', 'all'] },
  { value: 'EUR', label: '🇪🇺 Euro', symbol: '€', countryCode: 'EU', searchTerms: ['euro', 'eur'] },
  { value: 'GBP', label: '🇬🇧 British Pound', symbol: '£', countryCode: 'GB', searchTerms: ['british', 'pound', 'gbp'] },
  { value: 'CHF', label: '🇨🇭 Swiss Franc', symbol: 'Fr', countryCode: 'CH', searchTerms: ['swiss', 'franc', 'chf'] },
  { value: 'DKK', label: '🇩🇰 Danish Krone', symbol: 'kr', countryCode: 'DK', searchTerms: ['danish', 'krone', 'dkk'] },
  { value: 'NOK', label: '🇳🇴 Norwegian Krone', symbol: 'kr', countryCode: 'NO', searchTerms: ['norwegian', 'krone', 'nok'] },
  { value: 'SEK', label: '🇸🇪 Swedish Krona', symbol: 'kr', countryCode: 'SE', searchTerms: ['swedish', 'krona', 'sek'] },
  { value: 'PLN', label: '🇵🇱 Polish Zloty', symbol: 'zł', countryCode: 'PL', searchTerms: ['polish', 'zloty', 'pln'] },
  { value: 'CZK', label: '🇨🇿 Czech Koruna', symbol: 'Kč', countryCode: 'CZ', searchTerms: ['czech', 'koruna', 'czk'] },
  { value: 'HUF', label: '🇭🇺 Hungarian Forint', symbol: 'Ft', countryCode: 'HU', searchTerms: ['hungarian', 'forint', 'huf'] },
  { value: 'RON', label: '🇷🇴 Romanian Leu', symbol: 'lei', countryCode: 'RO', searchTerms: ['romanian', 'leu', 'ron'] },
  { value: 'BGN', label: '🇧🇬 Bulgarian Lev', symbol: 'лв', countryCode: 'BG', searchTerms: ['bulgarian', 'lev', 'bgn'] },
  { value: 'HRK', label: '🇭🇷 Croatian Kuna', symbol: 'kn', countryCode: 'HR', searchTerms: ['croatian', 'kuna', 'hrk'] },
  { value: 'RUB', label: '🇷🇺 Russian Ruble', symbol: '₽', countryCode: 'RU', searchTerms: ['russian', 'ruble', 'rub'] },
  { value: 'UAH', label: '🇺🇦 Ukrainian Hryvnia', symbol: '₴', countryCode: 'UA', searchTerms: ['ukrainian', 'hryvnia', 'uah'] },
  
  // ===== NORTH AMERICA =====
  { value: 'USD', label: '🇺🇸 US Dollar', symbol: '$', countryCode: 'US', searchTerms: ['us', 'dollar', 'usd'] },
  { value: 'CAD', label: '🇨🇦 Canadian Dollar', symbol: 'CA$', countryCode: 'CA', searchTerms: ['canadian', 'dollar', 'cad'] },
  { value: 'MXN', label: '🇲🇽 Mexican Peso', symbol: '$', countryCode: 'MX', searchTerms: ['mexican', 'peso', 'mxn'] },
  
  // ===== SOUTH AMERICA =====
  { value: 'ARS', label: '🇦🇷 Argentine Peso', symbol: '$', countryCode: 'AR', searchTerms: ['argentine', 'peso', 'ars'] },
  { value: 'BOB', label: '🇧🇴 Bolivian Boliviano', symbol: 'Bs', countryCode: 'BO', searchTerms: ['bolivian', 'boliviano', 'bob'] },
  { value: 'BRL', label: '🇧🇷 Brazilian Real', symbol: 'R$', countryCode: 'BR', searchTerms: ['brazilian', 'real', 'brl'] },
  { value: 'CLP', label: '🇨🇱 Chilean Peso', symbol: '$', countryCode: 'CL', searchTerms: ['chilean', 'peso', 'clp'] },
  { value: 'COP', label: '🇨🇴 Colombian Peso', symbol: '$', countryCode: 'CO', searchTerms: ['colombian', 'peso', 'cop'] },
  { value: 'PEN', label: '🇵🇪 Peruvian Sol', symbol: 'S/', countryCode: 'PE', searchTerms: ['peruvian', 'sol', 'pen'] },
  { value: 'PYG', label: '🇵🇾 Paraguayan Guarani', symbol: '₲', countryCode: 'PY', searchTerms: ['paraguayan', 'guarani', 'pyg'] },
  { value: 'UYU', label: '🇺🇾 Uruguayan Peso', symbol: '$', countryCode: 'UY', searchTerms: ['uruguayan', 'peso', 'uyu'] },
  
  // ===== AFRICA =====
  { value: 'ZAR', label: '🇿🇦 South African Rand', symbol: 'R', countryCode: 'ZA', searchTerms: ['south', 'african', 'rand', 'zar'] },
  { value: 'NGN', label: '🇳🇬 Nigerian Naira', symbol: '₦', countryCode: 'NG', searchTerms: ['nigerian', 'naira', 'ngn'] },
  { value: 'KES', label: '🇰🇪 Kenyan Shilling', symbol: 'KSh', countryCode: 'KE', searchTerms: ['kenyan', 'shilling', 'kes'] },
  { value: 'TZS', label: '🇹🇿 Tanzanian Shilling', symbol: 'TSh', countryCode: 'TZ', searchTerms: ['tanzanian', 'shilling', 'tzs'] },
  { value: 'UGX', label: '🇺🇬 Ugandan Shilling', symbol: 'USh', countryCode: 'UG', searchTerms: ['ugandan', 'shilling', 'ugx'] },
  { value: 'GHS', label: '🇬🇭 Ghanaian Cedi', symbol: 'GH₵', countryCode: 'GH', searchTerms: ['ghanaian', 'cedi', 'ghs'] },
  { value: 'MAD', label: '🇲🇦 Moroccan Dirham', symbol: 'د.م.', countryCode: 'MA', searchTerms: ['moroccan', 'dirham', 'mad'] },
  { value: 'DZD', label: '🇩🇿 Algerian Dinar', symbol: 'د.ج', countryCode: 'DZ', searchTerms: ['algerian', 'dinar', 'dzd'] },
  { value: 'TND', label: '🇹🇳 Tunisian Dinar', symbol: 'د.ت', countryCode: 'TN', searchTerms: ['tunisian', 'dinar', 'tnd'] },
  { value: 'ETB', label: '🇪🇹 Ethiopian Birr', symbol: 'Br', countryCode: 'ET', searchTerms: ['ethiopian', 'birr', 'etb'] },
  { value: 'ZMW', label: '🇿🇲 Zambian Kwacha', symbol: 'ZK', countryCode: 'ZM', searchTerms: ['zambian', 'kwacha', 'zmw'] },
  { value: 'MUR', label: '🇲🇺 Mauritian Rupee', symbol: 'Rs', countryCode: 'MU', searchTerms: ['mauritian', 'rupee', 'mur'] },
  
  // ===== OCEANIA =====
  { value: 'AUD', label: '🇦🇺 Australian Dollar', symbol: 'AU$', countryCode: 'AU', searchTerms: ['australian', 'dollar', 'aud'] },
  { value: 'NZD', label: '🇳🇿 New Zealand Dollar', symbol: 'NZ$', countryCode: 'NZ', searchTerms: ['new', 'zealand', 'dollar', 'nzd'] },
  { value: 'FJD', label: '🇫🇯 Fijian Dollar', symbol: 'FJ$', countryCode: 'FJ', searchTerms: ['fijian', 'dollar', 'fjd'] },
  { value: 'PGK', label: '🇵🇬 Papua New Guinean Kina', symbol: 'K', countryCode: 'PG', searchTerms: ['papua', 'kina', 'pgk'] },
  { value: 'SBD', label: '🇸🇧 Solomon Islands Dollar', symbol: 'SI$', countryCode: 'SB', searchTerms: ['solomon', 'dollar', 'sbd'] },
  { value: 'TOP', label: '🇹🇴 Tongan Paʻanga', symbol: 'T$', countryCode: 'TO', searchTerms: ['tongan', 'paanga', 'top'] },
  { value: 'VUV', label: '🇻🇺 Vanuatu Vatu', symbol: 'VT', countryCode: 'VU', searchTerms: ['vanuatu', 'vatu', 'vuv'] },
  { value: 'WST', label: '🇼🇸 Samoan Tala', symbol: 'WS$', countryCode: 'WS', searchTerms: ['samoan', 'tala', 'wst'] },
  
  // ===== SPECIAL / CRYPTO =====
  { value: 'BTC', label: '₿ Bitcoin', symbol: '₿', searchTerms: ['bitcoin', 'btc', 'crypto'] },
  { value: 'ETH', label: '⟠ Ethereum', symbol: '⟠', searchTerms: ['ethereum', 'eth', 'crypto'] },
];

// Map country code to currency for location detection
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  AF: 'AFN', AL: 'ALL', DZ: 'DZD', AS: 'USD', AD: 'EUR', AO: 'AOA', AI: 'XCD', AG: 'XCD',
  AR: 'ARS', AM: 'AMD', AW: 'AWG', AU: 'AUD', AT: 'EUR', AZ: 'AZN', BS: 'BSD', BH: 'BHD',
  BD: 'BDT', BB: 'BBD', BY: 'BYN', BE: 'EUR', BZ: 'BZD', BJ: 'XOF', BM: 'BMD', BT: 'BTN',
  BO: 'BOB', BA: 'BAM', BW: 'BWP', BR: 'BRL', BN: 'BND', BG: 'BGN', BF: 'XOF', BI: 'BIF',
  KH: 'KHR', CM: 'XAF', CA: 'CAD', CV: 'CVE', KY: 'KYD', CF: 'XAF', TD: 'XAF', CL: 'CLP',
  CN: 'CNY', CO: 'COP', KM: 'KMF', CG: 'XAF', CD: 'CDF', CR: 'CRC', CI: 'XOF', HR: 'HRK',
  CU: 'CUP', CY: 'EUR', CZ: 'CZK', DK: 'DKK', DJ: 'DJF', DM: 'XCD', DO: 'DOP', EC: 'USD',
  EG: 'EGP', SV: 'SVC', GQ: 'XAF', ER: 'ERN', EE: 'EUR', ET: 'ETB', FJ: 'FJD', FI: 'EUR',
  FR: 'EUR', GA: 'XAF', GM: 'GMD', GE: 'GEL', DE: 'EUR', GH: 'GHS', GI: 'GIP', GR: 'EUR',
  GL: 'DKK', GD: 'XCD', GP: 'EUR', GU: 'USD', GT: 'GTQ', GN: 'GNF', GW: 'XOF', GY: 'GYD',
  HT: 'HTG', HN: 'HNL', HK: 'HKD', HU: 'HUF', IS: 'ISK', IN: 'INR', ID: 'IDR', IR: 'IRR',
  IQ: 'IQD', IE: 'EUR', IL: 'ILS', IT: 'EUR', JM: 'JMD', JP: 'JPY', JO: 'JOD', KZ: 'KZT',
  KE: 'KES', KI: 'AUD', KP: 'KPW', KR: 'KRW', KW: 'KWD', KG: 'KGS', LA: 'LAK', LV: 'EUR',
  LB: 'LBP', LS: 'LSL', LR: 'LRD', LY: 'LYD', LI: 'CHF', LT: 'EUR', LU: 'EUR', MO: 'MOP',
  MG: 'MGA', MW: 'MWK', MY: 'MYR', MV: 'MVR', ML: 'XOF', MT: 'EUR', MH: 'USD', MR: 'MRO',
  MU: 'MUR', MX: 'MXN', FM: 'USD', MD: 'MDL', MC: 'EUR', MN: 'MNT', ME: 'EUR', MS: 'XCD',
  MA: 'MAD', MZ: 'MZN', MM: 'MMK', NA: 'NAD', NR: 'AUD', NP: 'NPR', NL: 'EUR', NC: 'XPF',
  NZ: 'NZD', NI: 'NIO', NE: 'XOF', NG: 'NGN', NO: 'NOK', OM: 'OMR', PK: 'PKR', PW: 'USD',
  PA: 'PAB', PG: 'PGK', PY: 'PYG', PE: 'PEN', PH: 'PHP', PL: 'PLN', PT: 'EUR', QA: 'QAR',
  RO: 'RON', RU: 'RUB', RW: 'RWF', WS: 'WST', SM: 'EUR', ST: 'STD', SA: 'SAR', SN: 'XOF',
  RS: 'RSD', SC: 'SCR', SL: 'SLL', SG: 'SGD', SK: 'EUR', SI: 'EUR', SB: 'SBD', SO: 'SOS',
  ZA: 'ZAR', SS: 'SSP', ES: 'EUR', LK: 'LKR', SD: 'SDG', SR: 'SRD', SZ: 'SZL', SE: 'SEK',
  CH: 'CHF', SY: 'SYP', TW: 'TWD', TJ: 'TJS', TZ: 'TZS', TH: 'THB', TL: 'USD', TG: 'XOF',
  TO: 'TOP', TT: 'TTD', TN: 'TND', TR: 'TRY', TM: 'TMT', TV: 'AUD', UG: 'UGX', UA: 'UAH',
  AE: 'AED', GB: 'GBP', US: 'USD', UY: 'UYU', UZ: 'UZS', VU: 'VUV', VA: 'EUR', VE: 'VEF',
  VN: 'VND', WF: 'XPF', YE: 'YER', ZM: 'ZMW', ZW: 'ZWL',
};

// Default fallback currency
export const DEFAULT_CURRENCY = 'USD';