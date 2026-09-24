/**
 * Deep Link Helper for Universal/Custom Scheme App Redirection
 * Automatically maps web URLs (Instagram, YouTube, Twitter/X, Spotify, etc.)
 * to native mobile app URI schemes with seamless web fallback.
 */

const RESERVED_INSTAGRAM_PATHS = new Set([
  'p', 'reel', 'reels', 'stories', 'explore', 'direct', 'accounts',
  'about', 'legal', 'developer', 'static', 'api', 'help', 'privacy',
]);

/**
 * Parses a target URL and returns native deep link configuration if supported.
 * @param {string} rawUrl
 * @returns {{ appName: string, appScheme: string, androidIntent: string, webUrl: string, accentColor: string, iconSvg: string } | null}
 */
export const getDeepLinkInfo = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch (_e) {
    return null;
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const pathname = parsed.pathname;

  // 1. Instagram
  if (hostname === 'instagram.com' || hostname.endsWith('.instagram.com')) {
    const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
    const parts = cleanPath.split('/').filter(Boolean);

    // Profile URL: instagram.com/username
    if (parts.length === 1 && !RESERVED_INSTAGRAM_PATHS.has(parts[0].toLowerCase())) {
      const username = parts[0];
      return {
        appName: 'Instagram',
        appScheme: `instagram://user?username=${encodeURIComponent(username)}`,
        androidIntent: `intent://instagram.com/_u/${encodeURIComponent(username)}#Intent;package=com.instagram.android;scheme=https;end`,
        webUrl: rawUrl,
        accentColor: '#E1306C',
        iconType: 'instagram',
      };
    }

    // Post or Reel: instagram.com/p/CODE or instagram.com/reel/CODE
    if ((parts[0] === 'p' || parts[0] === 'reel' || parts[0] === 'reels') && parts[1]) {
      const mediaCode = parts[1];
      return {
        appName: 'Instagram',
        appScheme: `instagram://media?id=${encodeURIComponent(mediaCode)}`,
        androidIntent: `intent://instagram.com/p/${encodeURIComponent(mediaCode)}#Intent;package=com.instagram.android;scheme=https;end`,
        webUrl: rawUrl,
        accentColor: '#E1306C',
        iconType: 'instagram',
      };
    }
  }

  // 2. YouTube
  if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be') {
    let videoId = null;

    if (hostname === 'youtu.be') {
      videoId = pathname.replace(/^\/+/, '').split('/')[0];
    } else if (pathname === '/watch') {
      videoId = parsed.searchParams.get('v');
    } else if (pathname.startsWith('/shorts/')) {
      videoId = pathname.replace('/shorts/', '').split('/')[0];
    }

    if (videoId) {
      return {
        appName: 'YouTube',
        appScheme: `vnd.youtube:${encodeURIComponent(videoId)}`,
        androidIntent: `intent://www.youtube.com/watch?v=${encodeURIComponent(videoId)}#Intent;package=com.google.android.youtube;scheme=https;end`,
        webUrl: rawUrl,
        accentColor: '#FF0000',
        iconType: 'youtube',
      };
    }

    // YouTube Channel: youtube.com/@channel
    if (pathname.startsWith('/@')) {
      const channel = pathname.slice(2).split('/')[0];
      return {
        appName: 'YouTube',
        appScheme: `vnd.youtube://www.youtube.com/@${encodeURIComponent(channel)}`,
        androidIntent: `intent://www.youtube.com/@${encodeURIComponent(channel)}#Intent;package=com.google.android.youtube;scheme=https;end`,
        webUrl: rawUrl,
        accentColor: '#FF0000',
        iconType: 'youtube',
      };
    }
  }

  // 3. Twitter / X
  if (hostname === 'twitter.com' || hostname === 'x.com') {
    const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
    const parts = cleanPath.split('/').filter(Boolean);

    if (parts.length === 1 && !['home', 'explore', 'notifications', 'messages', 'search', 'i'].includes(parts[0].toLowerCase())) {
      const username = parts[0];
      return {
        appName: 'X (Twitter)',
        appScheme: `twitter://user?screen_name=${encodeURIComponent(username)}`,
        androidIntent: `intent://twitter.com/${encodeURIComponent(username)}#Intent;package=com.twitter.android;scheme=https;end`,
        webUrl: rawUrl,
        accentColor: '#1DA1F2',
        iconType: 'twitter',
      };
    }
  }

  // 4. WhatsApp
  if (hostname === 'wa.me' || (hostname === 'api.whatsapp.com' && pathname.startsWith('/send'))) {
    let phone = '';
    if (hostname === 'wa.me') {
      phone = pathname.replace(/^\/+/, '').split('?')[0];
    } else {
      phone = parsed.searchParams.get('phone') || '';
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone) {
      return {
        appName: 'WhatsApp',
        appScheme: `whatsapp://send?phone=${cleanPhone}`,
        androidIntent: `intent://send?phone=${cleanPhone}#Intent;package=com.whatsapp;scheme=whatsapp;end`,
        webUrl: rawUrl,
        accentColor: '#25D366',
        iconType: 'whatsapp',
      };
    }
  }

  // 5. Spotify
  if (hostname === 'open.spotify.com') {
    const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
    const parts = cleanPath.split('/').filter(Boolean);
    if (['track', 'album', 'artist', 'playlist'].includes(parts[0]) && parts[1]) {
      const type = parts[0];
      const id = parts[1].split('?')[0];
      return {
        appName: 'Spotify',
        appScheme: `spotify:${type}:${id}`,
        androidIntent: `intent://open.spotify.com/${type}/${id}#Intent;package=com.spotify.music;scheme=https;end`,
        webUrl: rawUrl,
        accentColor: '#1DB954',
        iconType: 'spotify',
      };
    }
  }

  // 6. Telegram
  if (hostname === 't.me') {
    const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
    const parts = cleanPath.split('/').filter(Boolean);
    if (parts.length === 1 && !['joinchat', 'share', 'addstickers'].includes(parts[0].toLowerCase())) {
      const username = parts[0];
      return {
        appName: 'Telegram',
        appScheme: `tg://resolve?domain=${encodeURIComponent(username)}`,
        androidIntent: `intent://resolve?domain=${encodeURIComponent(username)}#Intent;package=org.telegram.messenger;scheme=tg;end`,
        webUrl: rawUrl,
        accentColor: '#2AABEE',
        iconType: 'telegram',
      };
    }
  }

  return null;
};

/**
 * Checks if the request is coming from a mobile user agent.
 * @param {string} userAgent
 * @returns {boolean}
 */
export const isMobileDevice = (userAgent = '') => {
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
};

/**
 * Returns SVG markup for each supported app.
 * @param {string} iconType
 * @returns {string}
 */
const getAppSvg = (iconType) => {
  switch (iconType) {
    case 'instagram':
      return `<svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#ffffff;">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>`;
    case 'youtube':
      return `<svg viewBox="0 0 24 24" width="38" height="38" fill="#ffffff">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>`;
    case 'twitter':
      return `<svg viewBox="0 0 24 24" width="36" height="36" fill="#ffffff">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>`;
    case 'spotify':
      return `<svg viewBox="0 0 24 24" width="38" height="38" fill="#ffffff">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>`;
    case 'whatsapp':
      return `<svg viewBox="0 0 24 24" width="38" height="38" fill="#ffffff">
        <path d="M17.472 14.382c-.301-.15-1.782-.879-2.059-.979-.276-.1-.477-.15-.678.15-.2.301-.778.979-.954 1.18-.176.2-.351.226-.653.075s-1.272-.469-2.424-1.496c-.896-.798-1.501-1.784-1.677-2.085-.176-.301-.019-.464.132-.614.135-.135.301-.351.452-.527.15-.176.2-.301.301-.502.101-.2.05-.376-.025-.527-.075-.15-.678-1.633-.929-2.235-.245-.587-.494-.508-.678-.517-.176-.008-.376-.01-.577-.01-.2 0-.527.075-.803.376s-1.055 1.03-1.055 2.511c0 1.481 1.08 2.911 1.23 3.112.15.2 2.126 3.246 5.15 4.553.72.311 1.282.497 1.72.636.724.23 1.383.197 1.903.12.58-.087 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.075-.125-.276-.2-.577-.35zM12.04 21.75c-1.737 0-3.441-.462-4.945-1.336L2.25 21.75l1.37-4.708A9.704 9.704 0 0 1 2.34 12.04C2.34 6.697 6.697 2.34 12.04 2.34c2.593 0 5.031 1.01 6.865 2.844A9.66 9.66 0 0 1 21.75 12.04c0 5.343-4.357 9.71-9.71 9.71z"/>
      </svg>`;
    case 'telegram':
      return `<svg viewBox="0 0 24 24" width="38" height="38" fill="#ffffff">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.941z"/>
      </svg>`;
    default:
      return `<svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#ffffff" stroke-width="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>`;
  }
};

/**
 * Generates an ultra-fast, premium HTML bridge page for mobile deep linking.
 * Attempts native app launch first, falling back to the web URL after a brief delay.
 * @param {object} info - from getDeepLinkInfo
 * @returns {string} HTML page string
 */
export const renderDeepLinkBridge = (info) => {
  const { appName, appScheme, androidIntent, webUrl, accentColor, iconType } = info;
  const svg = getAppSvg(iconType);

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${appName} Açılıyor...</title>
  <style>
    :root {
      --accent: ${accentColor};
      --bg: #090d16;
      --card-bg: rgba(18, 24, 38, 0.85);
      --card-border: rgba(255, 255, 255, 0.08);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: var(--bg);
      background-image: 
        radial-gradient(circle at 50% 20%, rgba(${accentColor === '#E1306C' ? '225,48,108,0.18' : '37,99,235,0.15'}), transparent 60%),
        radial-gradient(circle at 80% 80%, rgba(204,255,0,0.05), transparent 40%);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.25rem;
      text-align: center;
      overflow: hidden;
    }
    .bridge-card {
      background: var(--card-bg);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--card-border);
      border-radius: 28px;
      padding: 2.5rem 1.75rem 2rem;
      max-width: 380px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0,0,0,0.3);
      animation: cardAppear 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes cardAppear {
      from { opacity: 0; transform: translateY(20px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .icon-wrapper {
      position: relative;
      width: 84px;
      height: 84px;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 24px;
      background: linear-gradient(135deg, ${accentColor}, ${accentColor}cc);
      box-shadow: 0 12px 30px -6px ${accentColor}80;
    }
    .icon-pulse {
      position: absolute;
      inset: -6px;
      border-radius: 30px;
      background: ${accentColor};
      opacity: 0.35;
      animation: pulse 2s infinite ease-out;
      z-index: -1;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.5; }
      50% { transform: scale(1.15); opacity: 0; }
      100% { transform: scale(0.95); opacity: 0; }
    }
    h1 {
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
      color: var(--text-main);
    }
    p {
      font-size: 0.92rem;
      color: var(--text-muted);
      line-height: 1.45;
      margin-bottom: 1.75rem;
    }
    .spinner {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.25);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
      vertical-align: middle;
      margin-right: 8px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .btn-open {
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${accentColor};
      color: #ffffff;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 600;
      padding: 0.9rem 1.25rem;
      border-radius: 16px;
      box-shadow: 0 8px 20px -4px ${accentColor}66;
      transition: all 0.2s ease;
      border: none;
      cursor: pointer;
    }
    .btn-open:active {
      transform: scale(0.98);
      filter: brightness(0.92);
    }
    .btn-web {
      background: transparent;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 0.6rem;
      border-radius: 12px;
      transition: color 0.2s ease;
      cursor: pointer;
      border: none;
    }
    .btn-web:active {
      color: #ffffff;
    }
  </style>
</head>
<body>
  <div class="bridge-card">
    <div class="icon-wrapper">
      <div class="icon-pulse"></div>
      ${svg}
    </div>
    <h1>${appName} Açılıyor</h1>
    <p>Doğrudan uygulamaya yönlendiriliyorsunuz. Uygulama açılmazsa aşağıdaki butona dokunun.</p>
    
    <div class="actions">
      <a id="openAppBtn" href="${appScheme}" class="btn-open">
        <span class="spinner" id="btnSpinner"></span>
        <span id="btnText">Uygulamada Aç</span>
      </a>
      <a id="openWebBtn" href="${webUrl}" class="btn-web">
        Tarayıcıda Devam Et &rarr;
      </a>
    </div>
  </div>

  <script>
    (function() {
      var appScheme = ${JSON.stringify(appScheme)};
      var androidIntent = ${JSON.stringify(androidIntent || '')};
      var webUrl = ${JSON.stringify(webUrl)};
      var isAndroid = /Android/i.test(navigator.userAgent);
      var targetScheme = (isAndroid && androidIntent) ? androidIntent : appScheme;

      // 1. Attempt immediate deep link launch
      try {
        window.location.href = targetScheme;
      } catch (e) {
        window.location.href = appScheme;
      }

      // 2. Set fallback timer to web URL if app is not installed or declined
      var fallbackTimer = setTimeout(function() {
        window.location.href = webUrl;
      }, 1600);

      // 3. If user leaves or switches to the native app, cancel the fallback timer
      window.addEventListener('pagehide', function() {
        clearTimeout(fallbackTimer);
      });
      window.addEventListener('blur', function() {
        clearTimeout(fallbackTimer);
      });
      document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
          clearTimeout(fallbackTimer);
        }
      });
    })();
  </script>
</body>
</html>`;
};
