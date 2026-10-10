import User from '../models/User.js';
import { PLAN_IDS } from '../config/plans.js';
import { isAdminUser } from './admin.js';

/**
 * The plan a stored user document is entitled to right now.
 * A paid plan whose period has ended falls back to 'free' (the document keeps the old value for history;
 * links and data are never touched). A paid plan without planExpiresAt never expires.
 */
export const effectivePlanOf = (userDoc) => {
  const stored = PLAN_IDS.includes(userDoc?.membershipPlan) ? userDoc.membershipPlan : 'free';
  if (stored === 'free') return 'free';
  if (userDoc.planExpiresAt && new Date(userDoc.planExpiresAt) <= new Date()) return 'free';
  return stored;
};

/** Subscription summary sent to the client. */
export const subscriptionOf = (userDoc) => {
  const stored = PLAN_IDS.includes(userDoc?.membershipPlan) ? userDoc.membershipPlan : 'free';
  const trialAvailable = !userDoc?.trialUsedAt;
  if (stored === 'free') return { plan: 'free', status: 'none', period: null, expiresAt: null, autoRenew: false, trialAvailable, currency: userDoc?.billingCurrency || 'TRY' };
  if (!userDoc.planExpiresAt) {
    return { plan: stored, status: 'manual', period: null, expiresAt: null, autoRenew: false, trialAvailable, currency: userDoc?.billingCurrency || 'TRY' };
  }
  const active = new Date(userDoc.planExpiresAt) > new Date();
  const stateful = ['trialing', 'canceled', 'past_due'].includes(userDoc.subscriptionStatus)
    ? userDoc.subscriptionStatus
    : 'active';
  return {
    plan: stored,
    status: active ? stateful : 'expired',
    period: userDoc.billingPeriod || null,
    expiresAt: userDoc.planExpiresAt,
    autoRenew: Boolean(userDoc.autoRenew),
    trialAvailable,
    currency: userDoc.billingCurrency || 'TRY',
  };
};

/**
 * Effective plan for a request: 'guest' (no token), 'admin' (configured admins),
 * otherwise the plan the stored membership currently entitles ('free' | 'starter' | 'pro' | 'business').
 */
export const resolvePlan = async (authUser) => {
  if (!authUser?.uid) return 'guest';
  if (isAdminUser(authUser)) return 'admin';
  const doc = await User.findOne({ userId: authUser.uid })
    .select('membershipPlan planExpiresAt')
    .lean();
  return effectivePlanOf(doc);
};
