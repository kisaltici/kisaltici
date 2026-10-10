/**
 * Billing configuration (server is the single source of truth for prices).
 * The marketing copy on the client (src/config/plans.js) mirrors these numbers for display only;
 * the amount charged is always computed here.
 */
export const BILLING_PLANS = ['starter', 'pro', 'business'];
export const BILLING_PERIODS = ['monthly', 'yearly'];

// TRY per month
export const MONTHLY_PRICE_TRY = { starter: 49, pro: 149, business: 399 };

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
