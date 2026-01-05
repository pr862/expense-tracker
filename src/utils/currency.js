// Currency conversion utilities
// Exchange rates relative to USD (as base currency)
export const EXCHANGE_RATES = {
  USD: 1,
  INR: 83,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110,
  CAD: 1.25,
  AUD: 1.35,
  CHF: 0.92,
  CNY: 6.45,
  SEK: 8.5,
  NZD: 1.4,
  MXN: 20,
  SGD: 1.35,
  HKD: 7.8,
  NOK: 8.6,
  KRW: 1180,
  TRY: 8.5,
  RUB: 75,
  BRL: 5.2,
  ZAR: 14.5,
};

// Currency symbols
export const CURRENCY_SYMBOLS = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  SEK: 'kr',
  NZD: 'NZ$',
  MXN: '$',
  SGD: 'S$',
  HKD: 'HK$',
  NOK: 'kr',
  KRW: '₩',
  TRY: '₺',
  RUB: '₽',
  BRL: 'R$',
  ZAR: 'R',
};

// Detect currency from text
export const detectCurrency = (text) => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('₹') || lowerText.includes('rs') || lowerText.includes('inr')) {
    return 'INR';
  } else if (lowerText.includes('€') || lowerText.includes('eur')) {
    return 'EUR';
  } else if (lowerText.includes('£') || lowerText.includes('gbp')) {
    return 'GBP';
  } else if (lowerText.includes('¥') || lowerText.includes('jpy') || lowerText.includes('cny')) {
    return 'JPY'; // Note: ¥ is used for both JPY and CNY, but prioritize JPY
  } else if (lowerText.includes('$') || lowerText.includes('usd')) {
    return 'USD';
  } else if (lowerText.includes('cad')) {
    return 'CAD';
  } else if (lowerText.includes('aud')) {
    return 'AUD';
  } else if (lowerText.includes('chf')) {
    return 'CHF';
  } else if (lowerText.includes('sek')) {
    return 'SEK';
  } else if (lowerText.includes('nzd')) {
    return 'NZD';
  } else if (lowerText.includes('mxn')) {
    return 'MXN';
  } else if (lowerText.includes('sgd')) {
    return 'SGD';
  } else if (lowerText.includes('hkd')) {
    return 'HKD';
  } else if (lowerText.includes('nok')) {
    return 'NOK';
  } else if (lowerText.includes('krw')) {
    return 'KRW';
  } else if (lowerText.includes('try')) {
    return 'TRY';
  } else if (lowerText.includes('rub')) {
    return 'RUB';
  } else if (lowerText.includes('brl')) {
    return 'BRL';
  } else if (lowerText.includes('zar')) {
    return 'ZAR';
  }
  return 'USD'; // Default
};

// Convert amount from one currency to another
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (!EXCHANGE_RATES[fromCurrency] || !EXCHANGE_RATES[toCurrency]) {
    return amount; // Return original if currency not found
  }
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
  return amountInUSD * EXCHANGE_RATES[toCurrency];
};

// Format amount with currency symbol
export const formatCurrency = (amount, currency) => {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  return `${symbol}${amount.toLocaleString()}`;
};

// Get currency options for select
export const getCurrencyOptions = () => {
  return Object.keys(EXCHANGE_RATES).map(code => ({
    value: code,
    label: `${code} (${CURRENCY_SYMBOLS[code]})`
  }));
};
