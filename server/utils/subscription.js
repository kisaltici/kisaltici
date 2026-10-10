import User from '../models/User.js';
import Order from '../models/Order.js';
import { PLAN_IDS } from '../config/plans.js';
import { TRIAL_DAYS, addPeriod, priceFor, toKurus, getPaytrConfig } from '../config/billing.js';
import { newMerchantOid, chargeStoredCard } from './paytr.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const RETRY_AFTER_MS = 60 * 60 * 1000; // never attempt the same account twice within an hour

/**
 * First paid-plan period of a trial: full access for TRIAL_DAYS, then the stored card is charged (see processDueRenewals).
 * Only once per account. Returns the period end, or null when the account already used its trial.
 */
export const startTrial = async (order, tokens = {}) => {
  const now = new Date();
  const endsAt = new Date(now.getTime() + TRIAL_DAYS * DAY_MS);
  const update = {
    membershipPlan: order.plan,
    planExpiresAt: endsAt,
    billingPeriod: order.period,
    subscriptionStatus: 'trialing',
    billingCurrency: order.currency || 'TRY',
    autoRenew: true,
    trialUsedAt: now,
    subscriptionStartedAt: now,
    canceledAt: null,
  };
  if (tokens.utoken) update.paytrUtoken = tokens.utoken;
  if (tokens.ctoken) update.paytrCtoken = tokens.ctoken;
  const res = await User.updateOne({ userId: order.userId, trialUsedAt: null }, { $set: update });
  return res.modifiedCount === 1 ? endsAt : null;
};

/** Turn automatic renewal off. Access continues until planExpiresAt; nothing is charged afterwards. */
export const cancelAutoRenew = async (userId) => {
  const res = await User.updateOne(
    { userId, autoRenew: true },
    { $set: { autoRenew: false, subscriptionStatus: 'canceled', canceledAt: new Date() } }
  );
  return res.modifiedCount === 1;
};

/** Turn automatic renewal back on while the current period is still running (needs a stored card). */
export const resumeAutoRenew = async (userId) => {
  const now = new Date();
  const res = await User.updateOne(
    {
      userId,
      autoRenew: false,
      subscriptionStatus: 'canceled',
      planExpiresAt: { $gt: now },
      paytrCtoken: { $ne: null },
    },
    { $set: { autoRenew: true, subscriptionStatus: 'active', canceledAt: null } }
  );
  return res.modifiedCount === 1;
};

/**
 * Charge every account whose period has ended and that still has auto-renew on.
 * `charger` is injectable for tests; the default charges the stored PayTR card.
 * On success the next period starts at the previous end; on failure the account is marked past_due and
 * auto-renew is switched off (access already lapsed, links and data untouched).
 */
export const processDueRenewals = async ({ charger = chargeStoredCard, now = new Date(), limit = 100 } = {}) => {
  const result = { due: 0, charged: 0, failed: 0 };
  const retryBefore = new Date(now.getTime() - RETRY_AFTER_MS);

  const due = await User.find({
    autoRenew: true,
    subscriptionStatus: { $in: ['trialing', 'active'] },
    membershipPlan: { $in: PLAN_IDS.filter((id) => id !== 'free') },
    planExpiresAt: { $ne: null, $lte: now },
    $or: [{ lastRenewalAttemptAt: null }, { lastRenewalAttemptAt: { $lte: retryBefore } }],
  })
    .select('+paytrUtoken +paytrCtoken')
    .limit(limit)
    .lean();

  for (const user of due) {
    // Claim the account so overlapping cron runs cannot charge it twice
    const claim = await User.updateOne(
      { userId: user.userId, planExpiresAt: user.planExpiresAt, autoRenew: true },
      { $set: { lastRenewalAttemptAt: now } }
    );
    if (claim.modifiedCount !== 1) continue;
    result.due += 1;

    const currency = user.billingCurrency || 'TRY';
    const amountKurus = toKurus(priceFor(user.membershipPlan, user.billingPeriod || 'monthly', currency));
    const order = await Order.create({
      orderId: newMerchantOid(),
      userId: user.userId,
      kind: 'renewal',
      currency,
      plan: user.membershipPlan,
      period: user.billingPeriod || 'monthly',
      amountKurus,
      testMode: getPaytrConfig().testMode === '1',
      email: user.email || '',
      fullName: user.displayName || '',
    });

    let outcome;
    try {
      outcome = await charger({ user, order, amountKurus });
    } catch (error) {
      outcome = { ok: false, reason: error.message };
    }

    if (outcome && outcome.ok) {
      const newEnd = addPeriod(user.planExpiresAt, order.period);
      await Order.updateOne(
        { orderId: order.orderId, status: 'pending' },
        { $set: { status: 'paid', paidAt: now, activatedUntil: newEnd } }
      );
      await User.updateOne(
        { userId: user.userId },
        { $set: { planExpiresAt: newEnd, subscriptionStatus: 'active' } }
      );
      result.charged += 1;
    } else {
      await Order.updateOne(
        { orderId: order.orderId, status: 'pending' },
        { $set: { status: 'failed', failedReasonMsg: String(outcome?.reason || 'charge_failed').slice(0, 200) } }
      );
      await User.updateOne(
        { userId: user.userId },
        { $set: { subscriptionStatus: 'past_due', autoRenew: false } }
      );
      result.failed += 1;
    }
  }
  return result;
};
