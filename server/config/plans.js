/**
 * Single source of truth for plan limits (server side).
 * `null` means unlimited. The matching marketing copy lives in src/config/plans.js.
 *
 * - dailyLinks: new short links per day
 * - dailyQr:    distinct QR codes created (downloaded) per day
 * - statsDays:  how far back click history is shown (data is kept, only the view is windowed)
 * - customLinks: allowed to set @user/custom-text addresses
 * - customQr:    allowed to use the custom QR designer (colors, shapes, logo); standard QR is open to all
 * Link lifetime is unlimited on every plan: short links never expire.
 */
export const PLAN_IDS = ['free', 'starter', 'pro', 'business'];

export const PLAN_LIMITS = {
  guest: { dailyLinks: 1, dailyQr: 1, statsDays: 30, customLinks: false, customQr: false },
  // 'free' is the state of an account without an active subscription: existing links keep working and stay
  // manageable, but nothing new can be created until a plan is started.
  free: { dailyLinks: 0, dailyQr: 0, statsDays: 30, customLinks: false, customQr: false },
  starter: { dailyLinks: 30, dailyQr: 20, statsDays: 90, customLinks: false, customQr: true },
  pro: { dailyLinks: 100, dailyQr: 100, statsDays: 365, customLinks: true, customQr: true },
  business: { dailyLinks: 500, dailyQr: 500, statsDays: null, customLinks: true, customQr: true },
  admin: { dailyLinks: null, dailyQr: null, statsDays: null, customLinks: true, customQr: true },
};

export const getLimits = (planId) => PLAN_LIMITS[planId] || PLAN_LIMITS.free;
