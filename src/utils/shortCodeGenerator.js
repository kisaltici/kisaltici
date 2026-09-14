/**
 * Generates a random, URL-safe short code containing
 * uppercase letters, lowercase letters, and digits.
 *
 * @param {number} length - Length of the short code (default: 6)
 * @returns {string} The generated short code string
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
