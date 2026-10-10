/**
 * Admin identity is defined solely by the ADMIN_UIDS environment variable
 * (comma-separated Firebase UIDs). It is never derived from client-supplied data.
 */
const ADMIN_UIDS = (process.env.ADMIN_UIDS || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

export const isAdminUid = (uid) => Boolean(uid) && ADMIN_UIDS.includes(uid);
