import express from 'express';
import rateLimit from 'express-rate-limit';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  BILLING_PLANS,
  BILLING_PERIODS,
  MONTHLY_PRICE_TRY,
  TERMS_VERSION,
  TRIAL_DAYS,
  TRIAL_VERIFY_KURUS,
  isTrialEnabled,
  YEARLY_MONTHS_CHARGED,
  PLAN_NAMES_TR,
  priceFor,
  currencyForRequest,
  paytrCurrency,
  MONTHLY_PRICE_USD,
  toKurus,
  addPeriod,
  getPaytrConfig,
  getAppUrl,
} from '../config/billing.js';
import {
  buildIframeToken,
  verifyCallbackHash,
  newMerchantOid,
  resolveUserIp,
  requestIframeToken,
} from '../utils/paytr.js';
import { startTrial, cancelAutoRenew, resumeAutoRenew, processDueRenewals } from '../utils/subscription.js';

const router = express.Router();

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Çok fazla ödeme denemesi. Lütfen biraz sonra tekrar deneyin.' },
});

/**
 * Starts (or extends) a paid period. Same plan still active -> extends from its expiry;
 * otherwise the new plan starts now (no proration, the remainder of a different plan is not carried over).
 */
export const activateSubscription = async (order) => {
  const now = new Date();
  const user = await User.findOne({ userId: order.userId }).lean();
  let start = now;
  if (
    user &&
    user.membershipPlan === order.plan &&
    user.planExpiresAt &&
    new Date(user.planExpiresAt) > now
  ) {
    start = new Date(user.planExpiresAt);
  }
  const expiresAt = addPeriod(start, order.period);

  await User.updateOne(
    { userId: order.userId },
    {
      $set: {
        membershipPlan: order.plan,
        billingCurrency: order.currency || 'TRY',
        planExpiresAt: expiresAt,
        billingPeriod: order.period,
      },
      $setOnInsert: { subscriptionStartedAt: now },
    },
    { upsert: true }
  );
  return expiresAt;
};

/**
 * GET /api/billing/config
 * Public: whether checkout is available, and the prices (display only; the server recomputes at checkout).
 */
router.get('/config', (req, res) => {
  const config = getPaytrConfig();
  res.json({
    success: true,
    enabled: config.enabled,
    testMode: config.testMode === '1',
    trial: isTrialEnabled(),
    trialDays: TRIAL_DAYS,
    currency: currencyForRequest(req),
    prices: MONTHLY_PRICE_TRY,
    pricesUsd: MONTHLY_PRICE_USD,
    yearlyMonthsCharged: YEARLY_MONTHS_CHARGED,
  });
});

/**
 * POST /api/billing/checkout
 * Creates a pending order and asks PayTR for an iFrame token. The amount is always computed here.
 */
router.post('/checkout', requireAuth, checkoutLimiter, async (req, res, next) => {
  try {
    const config = getPaytrConfig();
    if (!config.enabled) {
      return res.status(503).json({
        success: false,
        code: 'PAYMENTS_DISABLED',
        error: 'Ödeme sistemi şu anda kullanılamıyor.',
      });
    }

    const { plan, period, fullName, phone, address, acceptTerms } = req.body || {};

    if (acceptTerms !== true) {
      return res.status(400).json({
        success: false,
        error: 'Lütfen ön bilgilendirme formunu ve mesafeli satış sözleşmesini onayla.',
      });
    }

    if (!BILLING_PLANS.includes(plan) || !BILLING_PERIODS.includes(period)) {
      return res.status(400).json({ success: false, error: 'Geçersiz plan veya dönem.' });
    }

    const name = typeof fullName === 'string' ? fullName.trim() : '';
    const phoneDigits = typeof phone === 'string' ? phone.replace(/[^\d+]/g, '') : '';
    const addr = typeof address === 'string' ? address.trim() : '';

    if (name.length < 3 || name.length > 60) {
      return res.status(400).json({ success: false, error: 'Lütfen ad ve soyadını gir.' });
    }
    if (phoneDigits.replace('+', '').length < 10 || phoneDigits.length > 20) {
      return res.status(400).json({ success: false, error: 'Lütfen geçerli bir telefon numarası gir.' });
    }
    if (addr.length < 8 || addr.length > 400) {
      return res.status(400).json({ success: false, error: 'Lütfen adresini (en az 8 karakter) gir.' });
    }

    const email = req.user.email;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Hesabında e-posta adresi bulunamadı.' });
    }

    // First checkout of an account that has not used its trial: a card-verification payment starts the trial
    const account = await User.findOne({ userId: req.user.uid }).select('trialUsedAt').lean();
    const isTrial = isTrialEnabled() && !account?.trialUsedAt;
    const currency = currencyForRequest(req);
    const amountKurus = isTrial ? TRIAL_VERIFY_KURUS : toKurus(priceFor(plan, period, currency));
    const orderId = newMerchantOid();
    const appUrl = getAppUrl();
    const periodLabel = period === 'yearly' ? 'Yıllık' : 'Aylık';
    const basket = Buffer.from(
      JSON.stringify([[isTrial ? `Kısaltıcı ${PLAN_NAMES_TR[plan]} deneme doğrulaması` : `Kısaltıcı ${PLAN_NAMES_TR[plan]} (${periodLabel})`, (amountKurus / 100).toFixed(2), 1]])
    ).toString('base64');

    const userIp = resolveUserIp(req.ip);
    const fields = {
      merchant_id: config.merchantId,
      user_ip: userIp,
      merchant_oid: orderId,
      email,
      payment_amount: String(amountKurus),
      user_basket: basket,
      no_installment: '0',
      max_installment: '0',
      currency: paytrCurrency(currency),
      test_mode: config.testMode,
      user_name: name,
      user_address: addr,
      user_phone: phoneDigits,
      merchant_ok_url: `${appUrl}/checkout/success?oid=${orderId}`,
      merchant_fail_url: `${appUrl}/checkout/failed?oid=${orderId}`,
      timeout_limit: '30',
      lang: currency === 'USD' ? 'en' : 'tr',
      debug_on: config.testMode === '1' ? '1' : '0',
    };
    fields.paytr_token = buildIframeToken({
      merchantId: config.merchantId,
      userIp,
      merchantOid: orderId,
      email,
      paymentAmount: fields.payment_amount,
      userBasket: basket,
      noInstallment: fields.no_installment,
      maxInstallment: fields.max_installment,
      currency: fields.currency,
      testMode: fields.test_mode,
      salt: config.salt,
      key: config.key,
    });

    await Order.create({
      orderId,
      userId: req.user.uid,
      plan,
      period,
      kind: isTrial ? 'trial' : 'payment',
      currency,
      amountKurus,
      testMode: config.testMode === '1',
      email,
      fullName: name,
      termsAcceptedAt: new Date(),
      termsVersion: TERMS_VERSION,
    });

    let token;
    try {
      token = await requestIframeToken(config, fields);
    } catch (tokenError) {
      await Order.updateOne({ orderId, status: 'pending' }, { $set: { status: 'failed', failedReasonMsg: tokenError.paytrReason || 'token_request_failed' } });
      console.error('PayTR get-token failed:', tokenError.message);
      return res.status(502).json({
        success: false,
        error: 'Ödeme sayfası şu anda açılamadı. Lütfen biraz sonra tekrar deneyin.',
      });
    }

    return res.status(201).json({
      success: true,
      orderId,
      token,
      iframeUrl: `${config.apiBase}/odeme/guvenli/${token}`,
      amountKurus,
      testMode: config.testMode === '1',
      trial: isTrial,
      trialDays: isTrial ? TRIAL_DAYS : 0,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/billing/paytr/callback
 * PayTR's server-to-server notification. The ONLY place a payment is confirmed.
 * - hash verified, otherwise rejected
 * - idempotent per merchant_oid (PayTR retries until it receives "OK")
 * - must answer plain text "OK" with nothing else
 * No auth/session here: PayTR has none.
 */
router.post('/paytr/callback', async (req, res) => {
  try {
    const config = getPaytrConfig();
    const post = req.body || {};

    if (!config.enabled || !verifyCallbackHash(post, config.key, config.salt)) {
      return res.status(400).type('text/plain').send('PAYTR notification failed: bad hash');
    }

    const orderId = String(post.merchant_oid || '');

    if (post.status === 'success') {
      // Flip pending -> paid atomically so a retried notification does nothing
      const order = await Order.findOneAndUpdate(
        { orderId, status: 'pending' },
        {
          $set: {
            status: 'paid',
            paidAt: new Date(),
            paytrTotalAmount: Number(post.total_amount) || null,
            paytrPaymentType: post.payment_type || null,
          },
        },
        { returnDocument: 'after' }
      );

      if (order) {
        // total_amount may exceed the base amount (installment fee) but must never be lower
        if (Number(post.total_amount) < order.amountKurus) {
          console.error(`PayTR amount mismatch for ${orderId}: paid ${post.total_amount} < ${order.amountKurus}`);
        } else {
          const expiresAt =
            order.kind === 'trial'
              ? await startTrial(order, { utoken: post.utoken, ctoken: post.ctoken })
              : await activateSubscription(order);
          if (expiresAt) await Order.updateOne({ orderId }, { $set: { activatedUntil: expiresAt } });
        }
      }
    } else {
      await Order.updateOne(
        { orderId, status: 'pending' },
        {
          $set: {
            status: 'failed',
            failedReasonCode: post.failed_reason_code || null,
            failedReasonMsg: post.failed_reason_msg || null,
          },
        }
      );
    }

    return res.status(200).type('text/plain').send('OK');
  } catch (error) {
    console.error('PayTR callback error:', error.message);
    // Not "OK": PayTR will retry the notification
    return res.status(500).type('text/plain').send('ERROR');
  }
});

/**
 * GET /api/billing/order/:orderId
 * The owner polls this after returning from PayTR (the browser redirect is not proof of payment).
 */
router.get('/order/:orderId', requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, userId: req.user.uid })
      .select({ status: 1, plan: 1, period: 1, kind: 1, activatedUntil: 1, failedReasonMsg: 1, testMode: 1 })
      .lean();
    if (!order) {
      return res.status(404).json({ success: false, error: 'Sipariş bulunamadı.' });
    }
    return res.json({
      success: true,
      status: order.status,
      plan: order.plan,
      period: order.period,
      expiresAt: order.activatedUntil || null,
      failedReason: order.status === 'failed' ? order.failedReasonMsg || null : null,
      testMode: Boolean(order.testMode),
      trial: order.kind === 'trial',
    });
  } catch (error) {
    next(error);
  }
});

/** POST /api/billing/cancel: stop automatic renewal; access continues until the period ends. */
router.post('/cancel', requireAuth, async (req, res, next) => {
  try {
    const ok = await cancelAutoRenew(req.user.uid);
    return res.json({ success: true, changed: ok });
  } catch (error) {
    next(error);
  }
});

/** POST /api/billing/resume: turn automatic renewal back on (period still running, card on file). */
router.post('/resume', requireAuth, async (req, res, next) => {
  try {
    const ok = await resumeAutoRenew(req.user.uid);
    return res.json({ success: true, changed: ok });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/billing/cron/renew: daily Vercel cron (Authorization: Bearer CRON_SECRET) that charges accounts whose
 * trial or period has ended. Without CRON_SECRET the endpoint stays closed.
 */
router.get('/cron/renew', async (req, res, next) => {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.get('authorization') !== `Bearer ${secret}`) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    if (!isTrialEnabled()) return res.json({ success: true, skipped: 'trial_disabled' });
    const result = await processDueRenewals();
    return res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

export default router;
