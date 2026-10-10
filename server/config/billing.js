/**
 * Billing configuration (server is the single source of truth for prices).
 * The marketing copy on the client (src/config/plans.js) mirrors these numbers for display only;
 * the amount charged is always computed here.
 */
// Version of the legal texts the buyer accepts at checkout (keep in sync with LEGAL_VERSION in src/config/legal.js)
export const TERMS_VERSION = '1.1';

// Free trial before the first charge (card required). Keep in sync with TRIAL_DAYS in src/config/plans.js.
export const TRIAL_DAYS = 7;

/**
 * Trials (card required, automatic charge when the trial ends) need PayTR card storage + recurring payment
 * authorization. Keep PAYTR_TRIAL unset until PayTR has enabled it and utils/paytr.js chargeStoredCard is implemented.
 */
export const isTrialEnabled = () => process.env.PAYTR_TRIAL === '1';

// Amount (kuruş) of the card-verification payment taken when a trial starts (placeholder until PayTR's card-storage flow is confirmed)
export const TRIAL_VERIFY_KURUS = Number(process.env.PAYTR_TRIAL_VERIFY_KURUS) || 100;

export const BILLING_PLANS = ['starter', 'pro', 'business'];
export const BILLING_PERIODS = ['monthly', 'yearly'];

// TRY per month
export const MONTHLY_PRICE_TRY = { starter: 49, pro: 149, business: 399 };
// USD per month for customers outside Türkiye (only when INTL_PRICING=1 and PayTR has enabled USD on the store)
export const MONTHLY_PRICE_USD = { starter: 3, pro: 5, business: 10 };

export const isIntlPricingEnabled = () => process.env.INTL_PRICING === '1';

/**
 * Currency a request pays in. Türkiye (and anything unknown, e.g. local development) pays in TRY; other countries in USD
 * once INTL_PRICING is on. Vercel provides the visitor's country in x-vercel-ip-country.
 */
export const currencyForRequest = (req) => {
  if (!isIntlPricingEnabled()) return 'TRY';
  const country = String(req.get('x-vercel-ip-country') || '').toUpperCase();
  return country && country !== 'TR' ? 'USD' : 'TRY';
};

/** Price in whole currency units for a plan, period and currency. */
export const priceFor = (plan, period, currency = 'TRY') => {
  const table = currency === 'USD' ? MONTHLY_PRICE_USD : MONTHLY_PRICE_TRY;
  return period === 'yearly' ? table[plan] * YEARLY_MONTHS_CHARGED : table[plan];
};

/** Currency code PayTR expects ('TL' for Turkish lira). */
export const paytrCurrency = (currency) => (currency === 'USD' ? 'USD' : 'TL');

// Yearly billing charges 10 months and gives 12 ("2 months free")
export const YEARLY_MONTHS_CHARGED = 10;

export const PLAN_NAMES_TR = { starter: 'Başlangıç', pro: 'Profesyonel', business: 'Kurumsal' };

export const priceTry = (plan, period) =>
  period === 'yearly' ? MONTHLY_PRICE_TRY[plan] * YEARLY_MONTHS_CHARGED : MONTHLY_PRICE_TRY[plan];

/** PayTR expects integer minor units (34.56 TL -> 3456). */
export const toKurus = (amountTry) => Math.round(amountTry * 100);

/** End of a paid period: +1 calendar month or +1 calendar year. */
export const addPeriod = (from, period) => {
  const date = new Date(from);
  if (period === 'yearly') date.setFullYear(date.getFullYear() + 1);
  else date.setMonth(date.getMonth() + 1);
  return date;
};

/** PayTR credentials and mode from the environment. */
export const getPaytrConfig = () => {
  const merchantId = process.env.PAYTR_MERCHANT_ID || '';
  const key = process.env.PAYTR_MERCHANT_KEY || '';
  const salt = process.env.PAYTR_MERCHANT_SALT || '';
  return {
    merchantId,
    key,
    salt,
    enabled: Boolean(merchantId && key && salt),
    // Test mode stays ON until PAYTR_TEST_MODE=0 is set explicitly
    testMode: process.env.PAYTR_TEST_MODE === '0' ? '0' : '1',
    apiBase: (process.env.PAYTR_API_BASE || 'https://www.paytr.com').replace(/\/+$/, ''),
  };
};

/** Public site URL used for PayTR return URLs. */
export const getAppUrl = () => {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, '');
  if (process.env.VERCEL) return 'https://kisaltici.com';
  return (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim().replace(/\/+$/, '');
};
