/**
 * Admin identity is defined by server-side configuration only:
 * - ADMIN_UIDS:   comma-separated Firebase UIDs
 * - ADMIN_EMAILS: comma-separated emails (default: kisaltici@gmail.com); the token's
 *                 email must be verified by Firebase (email_verified), so an
 *                 unverified email/password signup can never claim admin.
 */
const parseList = (value) =>
  (value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

const ADMIN_UIDS = parseList(process.env.ADMIN_UIDS);
const ADMIN_EMAILS = parseList(process.env.ADMIN_EMAILS || 'kisaltici@gmail.com').map((e) =>
  e.toLowerCase()
);

/**
 * @param {{ uid?: string, email?: string, email_verified?: boolean } | null | undefined} user
 *   Decoded Firebase ID token (req.user)
 */
export const isAdminUser = (user) => {
  if (!user || !user.uid) return false;
  if (ADMIN_UIDS.includes(user.uid)) return true;
  return Boolean(
    user.email && user.email_verified === true && ADMIN_EMAILS.includes(user.email.toLowerCase())
  );
};
