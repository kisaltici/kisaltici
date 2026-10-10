import crypto from 'crypto';

/** base64( HMAC-SHA256(key, data) ) */
export const hmacBase64 = (data, key) =>
  crypto.createHmac('sha256', key).update(data).digest('base64');

/**
 * paytr_token for the iFrame API get-token request.
 * hash_str = merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket
 *          + no_installment + max_installment + currency + test_mode
 * paytr_token = base64( HMAC-SHA256(hash_str + merchant_salt, merchant_key) )
 */
export const buildIframeToken = ({
  merchantId,
  userIp,
  merchantOid,
  email,
  paymentAmount,
  userBasket,
  noInstallment,
  maxInstallment,
  currency,
  testMode,
  salt,
  key,
}) =>
  hmacBase64(
    `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}${salt}`,
    key
  );

/**
 * Verifies the notification (callback) hash:
 * base64( HMAC-SHA256(merchant_oid + merchant_salt + status + total_amount, merchant_key) )
 */
export const verifyCallbackHash = (post, key, salt) => {
  if (!post || typeof post.hash !== 'string') return false;
  const expected = hmacBase64(`${post.merchant_oid}${salt}${post.status}${post.total_amount}`, key);
  const a = Buffer.from(expected);
  const b = Buffer.from(post.hash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

/** Unique order id: 4 letters + time + randomness, alphanumeric (PayTR allows up to 64). */
export const newMerchantOid = () =>
  `KSLT${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

/** PayTR needs an IPv4 address; strips the IPv6-mapped prefix and falls back to an optional override. */
export const resolveUserIp = (rawIp) => {
  const ip = String(rawIp || '').replace(/^::ffff:/, '');
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip) && ip !== '127.0.0.1') return ip;
  return process.env.PAYTR_USER_IP_OVERRIDE || ip || '127.0.0.1';
};

/** Requests an iFrame token from PayTR (server side only). Throws with PayTR's reason on failure. */
export const requestIframeToken = async (config, fields) => {
  const body = new URLSearchParams(fields);
  const response = await fetch(`${config.apiBase}/odeme/api/get-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await response.json().catch(() => null);
  if (!data || data.status !== 'success' || !data.token) {
    const error = new Error(data?.reason || 'PayTR token request failed');
    error.paytrReason = data?.reason || null;
    throw error;
  }
  return data.token;
};
