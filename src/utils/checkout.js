import { API_BASE_URL } from '../config/api';
import { isBillingPeriod, isPaidPlanId, DEFAULT_PERIOD } from '../config/plans';

const PENDING_KEY = 'kslt_pending_checkout';

export const checkoutPath = (plan, period = DEFAULT_PERIOD) =>
  `/checkout?plan=${encodeURIComponent(plan)}&period=${encodeURIComponent(period)}`;

/** Remembers the plan a signed-out visitor picked, so it can be opened right after sign-in. */
export const savePendingCheckout = (plan, period) => {
  if (!isPaidPlanId(plan)) return;
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ plan, period: isBillingPeriod(period) ? period : DEFAULT_PERIOD }));
  } catch {
    /* storage unavailable: the visitor can pick the plan again after signing in */
  }
};

export const takePendingCheckout = () => {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_KEY);
    const parsed = JSON.parse(raw);
    return isPaidPlanId(parsed.plan) ? { plan: parsed.plan, period: isBillingPeriod(parsed.period) ? parsed.period : DEFAULT_PERIOD } : null;
  } catch {
    return null;
  }
};

export const hasPendingCheckout = () => {
  try {
    return Boolean(sessionStorage.getItem(PENDING_KEY));
  } catch {
    return false;
  }
};

let configPromise = null;

/** Billing availability from the server (cached for the session). */
export const fetchBillingConfig = () => {
  if (!configPromise) {
    configPromise = fetch(`${API_BASE_URL}/api/billing/config`)
      .then((res) => res.json())
      .then((data) => ({
        enabled: Boolean(data?.enabled),
        testMode: Boolean(data?.testMode),
        trial: Boolean(data?.trial),
      }))
      .catch(() => ({ enabled: false, testMode: false, trial: false }));
  }
  return configPromise;
};

export const resetBillingConfigCache = () => {
  configPromise = null;
};
