/**
 * Generates a clean, human-readable display title from a URL.
 * Examples:
 *   https://www.youtube.com/watch?v=123 -> "YouTube"
 *   https://instagram.com/p/abc         -> "Instagram"
 *   https://github.com/facebook/react   -> "GitHub"
 *
 * @param {string} urlStr - Original URL
 * @returns {string} Clean title
 */
export function generateTitleFromUrl(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') {
    return 'Shortened Link';
  }

  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');

    const knownDomains = {
      'youtube.com': 'YouTube',
      'youtu.be': 'YouTube',
      'instagram.com': 'Instagram',
      'github.com': 'GitHub',
      'twitter.com': 'X / Twitter',
      'x.com': 'X / Twitter',
      'linkedin.com': 'LinkedIn',
      'facebook.com': 'Facebook',
      'google.com': 'Google',
      'drive.google.com': 'Google Drive',
      'docs.google.com': 'Google Docs',
      'medium.com': 'Medium',
      'wikipedia.org': 'Wikipedia',
      'reddit.com': 'Reddit',
      'amazon.com': 'Amazon',
      'netflix.com': 'Netflix',
      'spotify.com': 'Spotify',
      'figma.com': 'Figma',
      'notion.so': 'Notion',
    };

    if (knownDomains[hostname]) {
      return knownDomains[hostname];
    }

    // Extract main domain name and capitalize
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const mainName = parts[parts.length - 2];
      if (mainName.length > 2) {
        return mainName.charAt(0).toUpperCase() + mainName.slice(1);
      }
    }

    return hostname;
  } catch (error) {
    return 'Shortened Link';
  }
}
