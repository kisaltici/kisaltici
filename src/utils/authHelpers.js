/**
 * Utility functions for user authentication provider identification and formatting.
 */

/**
 * Returns the translation key for the user's primary/linked authentication provider.
 * Reads actual provider information from Firebase User `providerData` and `providerId`.
 *
 * Mapping:
 * - 'google.com' -> 'readOnlyGoogleAccount'
 * - 'password' -> 'readOnlyEmailAccount'
 * - both linked -> 'readOnlyMultipleAccounts'
 * - 'github.com' -> 'readOnlyGithubAccount'
 *
 * @param {object|null} user - Firebase User object
 * @returns {string} Translation key
 */
export function getAccountProviderKey(user) {
  if (!user) return 'readOnlyEmailAccount';

  // Extract provider IDs from providerData array
  const providerIds = Array.isArray(user.providerData)
    ? user.providerData.map((p) => p?.providerId).filter(Boolean)
    : [];

  // Fallback to user.providerId if providerData is empty and not generic 'firebase'
  if (providerIds.length === 0 && user.providerId && user.providerId !== 'firebase') {
    providerIds.push(user.providerId);
  }

  const hasGoogle = providerIds.includes('google.com');
  const hasPassword = providerIds.includes('password');

  // If user has both Google and Password linked
  if (hasGoogle && hasPassword) {
    return 'readOnlyMultipleAccounts';
  }

  // If authenticated via Google
  if (hasGoogle) {
    return 'readOnlyGoogleAccount';
  }

  // If authenticated via Email + Password
  if (hasPassword) {
    return 'readOnlyEmailAccount';
  }

  // Handle GitHub if linked
  if (providerIds.includes('github.com')) {
    return 'readOnlyGithubAccount';
  }

  // Sensible default for direct registration / email-password accounts
  // Ensures an email/password-only account is never falsely labeled as Google
  return 'readOnlyEmailAccount';
}

/**
 * Returns the localized label for the user's authentication provider.
 *
 * @param {object|null} user - Firebase User object
 * @param {function} t - Translation function from useTranslation
 * @returns {string} Localized provider label
 */
export function getAccountProviderLabel(user, t) {
  if (!user) return '';
  const key = getAccountProviderKey(user);
  return typeof t === 'function' ? t(key) : key;
}
