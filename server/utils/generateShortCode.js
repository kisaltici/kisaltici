/**
 * Generates a random, URL-safe 6-character short code.
 *
 * @param {number} length - Length of short code (default: 6)
 * @returns {string} Short code
 */
export function generateShortCode(length = 6) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortCode = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    shortCode += characters.charAt(randomIndex);
  }

  return shortCode;
}
