import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
const SearchModal = lazy(() => import('./components/SearchModal'));
const NewLinkModal = lazy(() => import('./components/NewLinkModal'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const ProfileModal = lazy(() => import('./components/ProfileModal'));
const HelpModal = lazy(() => import('./components/HelpModal'));
const PricingModal = lazy(() => import('./components/PricingModal'));
const AuthModal = lazy(() => import('./components/AuthModal'));
import UrlForm from './components/UrlForm';
const LinkAnalyticsPage = lazy(() => import('./pages/LinkAnalyticsPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
import { generateTitleFromUrl } from './utils/titleGenerator';
import { applyColorTheme } from './utils/themePresets';
import { DEFAULT_SHORTCUTS, matchShortcut } from './utils/keyboardDefaults';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext';
import { AuthProvider, useAuth, preloadAuth } from './context/AuthContext';
import { API_BASE_URL } from './config/api';
import { checkoutPath, savePendingCheckout, takePendingCheckout, hasPendingCheckout } from './utils/checkout';
import { isBillingPeriod, isPaidPlanId, DEFAULT_PERIOD, FEATURED_PLAN } from './config/plans';
import { applySeo } from './utils/seo';
import { LANDING_SEO } from './config/seo';
import { isPublicPath, langFromPath } from './i18n/siteLang';
import './App.css';

function MainComposerView({ onUrlShortened, onUrlShortenedWithIntent, onLimitReached, membershipPlan }) {
  const { t } = useTranslation();
  return (
    <section className="heroSection">
      <h1 className="heroTitle">{t('homeTitle')}</h1>
      <UrlForm
        onUrlShortened={onUrlShortened}
        onUrlShortenedWithIntent={onUrlShortenedWithIntent}
        onLimitReached={onLimitReached}
        membershipPlan={membershipPlan}
      />
    </section>
  );
}

// True when this browser had a signed-in session before: only then is the landing page held back until Firebase answers
const hadSession = () => {
  try {
    return localStorage.getItem('kslt_returning') === '1';
  } catch {
    return false;
  }
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  // If Firebase does not answer quickly (blocked network, extensions), fall back to the guest view
  const [authWaitExpired, setAuthWaitExpired] = useState(false);
  const { lang, setLang } = useTranslation();
  const { user, userProfile, profileLoading, getIdToken, authTransitioning, authLoading, membershipPlan, refetchProfile } = useAuth();

  // Keep the document head right for each route (legal pages set their own; app/private routes are noindex)
  useEffect(() => {
    const path = location.pathname;
    if (isPublicPath(path) && path !== '/' && path !== '/en') return; // blog and legal pages set their own head
    if (path === '/' || path === '/en') {
      const pageLang = langFromPath(path);
      applySeo({
        title: LANDING_SEO[pageLang].title,
        description: LANDING_SEO[pageLang].description,
        path: path === '/en' ? '/en' : '/',
      });
    } else {
      applySeo({ title: 'Kısaltıcı', path: '/', noindex: true });
    }
  }, [location.pathname]);

  // The URL decides the language on public pages (so search engines and visitors always see one language per URL)
  useEffect(() => {
    if (isPublicPath(location.pathname)) {
      const pageLang = langFromPath(location.pathname);
      if (pageLang !== lang) setLang(pageLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Signed-in users live at /dashboard: the marketing landing (/ and /en) sends them there
  useEffect(() => {
    if (user && (location.pathname === '/' || location.pathname === '/en')) navigate('/dashboard', { replace: true });
  }, [user, location.pathname, navigate]);

  // Signed-out visitors have no dashboard: send them to the landing page once the first auth check is done
  useEffect(() => {
    if (!user && location.pathname === '/dashboard' && (!authLoading || authWaitExpired)) navigate('/', { replace: true });
  }, [user, location.pathname, authLoading, authWaitExpired, navigate]);

  // Signing out from anywhere in the app returns to the landing page (only on a signed-in -> signed-out change,
  // so guests who never signed in can keep using /link pages)
  const previousUidRef = useRef(null);
  useEffect(() => {
    if (previousUidRef.current && !user) {
      navigate('/', { replace: true });
    }
    previousUidRef.current = user ? user.uid : null;
  }, [user, navigate]);

  useEffect(() => {
    if (!authLoading) return undefined;
    const timer = setTimeout(() => setAuthWaitExpired(true), 3000);
    return () => clearTimeout(timer);
  }, [authLoading]);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewLinkOpen, setIsNewLinkOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  // True when the last history request failed (server down, error); distinguishes "empty" from "unavailable"
  const [historyError, setHistoryError] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [customShortcuts, setCustomShortcuts] = useState(DEFAULT_SHORTCUTS);

  // In-flight and fetched UID tracking for history to prevent duplicate requests
  const historyFetchedUidRef = useRef(null);
  const historyInFlightUidRef = useRef(null);

  const handleOpenAuthModal = (mode = 'login') => {
    preloadAuth().catch(() => {});
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Theme mode: 'system', 'light', or 'dark'
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem('theme_mode');
      if (savedMode) return savedMode;
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
      return 'system';
    } catch (e) {
      return 'system';
    }
  });

  // Resolved theme: 'dark' or 'light'
  const [theme, setTheme] = useState(() => {
    try {
      const savedMode = localStorage.getItem('theme_mode');
      if (savedMode === 'light') return 'light';
      if (savedMode === 'dark') return 'dark';
      if (savedMode === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }
      const savedTheme = localStorage.getItem('theme');
      return savedTheme ? savedTheme : 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  // Fetch authenticated user's history from backend API independently
  const fetchUserHistory = useCallback(async (forced = false) => {
    if (!user) {
      setHistoryList([]);
      setIsHistoryLoading(false);
      historyFetchedUidRef.current = null;
      historyInFlightUidRef.current = null;
      return;
    }

    const currentUid = user.uid;

    if (!forced) {
      if (
        historyFetchedUidRef.current === currentUid ||
        historyInFlightUidRef.current === currentUid
      ) {
        return;
      }
    }

    historyInFlightUidRef.current = currentUid;
    setIsHistoryLoading(true);
    setHistoryError(false);

    try {
      const token = await getIdToken();
      if (!token) {
        setIsHistoryLoading(false);
        historyInFlightUidRef.current = null;
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/urls/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json().catch(() => null);

      if (response.status === 503 || payload?.code === 'DATABASE_UNAVAILABLE') {
        // Fast fail: DB unavailable, resolve loading state immediately
        setHistoryError(true);
        setIsHistoryLoading(false);
        historyInFlightUidRef.current = null;
        return;
      }

      if (response.ok && payload?.success && Array.isArray(payload.data)) {
        const formatted = payload.data.map((item) => ({
          shortCode: item.shortCode,
          shortUrl: item.shortUrl,
          originalUrl: item.originalUrl,
          title: item.title || generateTitleFromUrl(item.originalUrl),
          createdAt: item.createdAt,
          clickCount: item.clickCount,
        }));
        setHistoryList(formatted);
        historyFetchedUidRef.current = currentUid;
      } else {
        setHistoryError(true);
      }
    } catch (err) {
      console.error('Failed to fetch user history:', err);
      setHistoryError(true);
    } finally {
      setIsHistoryLoading(false);
      historyInFlightUidRef.current = null;
    }
  }, [user, getIdToken]);

  // Synchronize history when user login state changes
  useEffect(() => {
    if (!user) {
      setHistoryList([]);
      setIsHistoryLoading(false);
      historyFetchedUidRef.current = null;
      historyInFlightUidRef.current = null;
      return;
    }

    fetchUserHistory(false);
  }, [user?.uid, fetchUserHistory]);

  // User-specific color theme (default, ocean, sunset, etc.)
  const [colorTheme, setColorTheme] = useState('default');

  // Load user-specific color theme whenever authenticated user changes
  useEffect(() => {
    if (user) {
      try {
        const savedTheme = localStorage.getItem(`userTheme:${user.uid}`);
        setColorTheme(savedTheme || 'default');
      } catch (e) {
        setColorTheme('default');
      }
    } else {
      setColorTheme('default');
    }
  }, [user?.uid]);

  const handleSelectColorTheme = (themeKey) => {
    setColorTheme(themeKey);
    if (user) {
      try {
        localStorage.setItem(`userTheme:${user.uid}`, themeKey);
      } catch (e) {
        console.error('Failed to save user color theme:', e);
      }
    }
  };

  // Interface density: 'comfortable', 'standard', or 'compact'
  const [density, setDensity] = useState('standard');

  // Load and apply user-specific interface density
  useEffect(() => {
    let savedDensity = 'standard';
    if (user) {
      try {
        savedDensity = localStorage.getItem(`userDensity:${user.uid}`) || 'standard';
      } catch (e) {
        savedDensity = 'standard';
      }
    } else {
      try {
        savedDensity = localStorage.getItem('density_setting') || 'standard';
      } catch (e) {
        savedDensity = 'standard';
      }
    }
    setDensity(savedDensity);
    document.documentElement.setAttribute('data-density', savedDensity);
  }, [user?.uid]);

  const handleSelectDensity = (newDensity) => {
    setDensity(newDensity);
    document.documentElement.setAttribute('data-density', newDensity);
    if (user) {
      try {
        localStorage.setItem(`userDensity:${user.uid}`, newDensity);
      } catch (e) {
        console.error('Failed to save user density:', e);
      }
    } else {
      try {
        localStorage.setItem('density_setting', newDensity);
      } catch (e) {
        console.error('Failed to save guest density setting:', e);
      }
    }
  };

  const handleOpenSettings = (initialTab = null) => {
    setSettingsInitialTab(initialTab);
    setIsSettingsOpen(true);
  };

  // Sync themeMode and colorTheme with resolved theme and OS preference listener
  useEffect(() => {
    const applyTheme = (mode, preset) => {
      let resolved = 'dark';
      if (mode === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      } else {
        resolved = mode;
      }
      setTheme(resolved);
      document.documentElement.setAttribute('data-theme', resolved);
      applyColorTheme(preset, resolved);

      try {
        localStorage.setItem('theme_mode', mode);
        localStorage.setItem('theme', resolved);
      } catch (e) {
        console.error('Failed to save theme state:', e);
      }
    };

    applyTheme(themeMode, colorTheme);

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        const resolved = e.matches ? 'dark' : 'light';
        setTheme(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
        applyColorTheme(colorTheme, resolved);
      };
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [themeMode, colorTheme]);

  // Keyboard shortcuts preference state (default ON, user-specific persistence)
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);

  useEffect(() => {
    let saved = true;
    if (user) {
      try {
        const val = localStorage.getItem(`userShortcutsEnabled:${user.uid}`);
        saved = val === null ? true : val === 'true';
      } catch (e) {
        saved = true;
      }
    } else {
      try {
        const val = localStorage.getItem('shortcuts_enabled');
        saved = val === null ? true : val === 'true';
      } catch (e) {
        saved = true;
      }
    }
    setShortcutsEnabled(saved);
  }, [user?.uid]);

  const handleToggleShortcuts = () => {
    setShortcutsEnabled((prev) => {
      const next = !prev;
      if (user) {
        try {
          localStorage.setItem(`userShortcutsEnabled:${user.uid}`, String(next));
        } catch (e) {
          console.error('Failed to save user shortcuts preference:', e);
        }
      } else {
        try {
          localStorage.setItem('shortcuts_enabled', String(next));
        } catch (e) {
          console.error('Failed to save shortcuts preference:', e);
        }
      }
      return next;
    });
  };

  // Sync custom shortcuts from localStorage per user ID
  useEffect(() => {
    const storedKey = user ? `keyboardShortcuts:${user.uid}` : 'keyboard_shortcuts';
    try {
      const saved = localStorage.getItem(storedKey);
      if (saved) {
        setCustomShortcuts(JSON.parse(saved));
      } else {
        setCustomShortcuts(DEFAULT_SHORTCUTS);
      }
    } catch (e) {
      setCustomShortcuts(DEFAULT_SHORTCUTS);
    }
  }, [user?.uid]);

  const handleSaveCustomShortcut = (actionId, shortcutObj) => {
    setCustomShortcuts((prev) => {
      const next = { ...prev, [actionId]: shortcutObj };
      const storedKey = user ? `keyboardShortcuts:${user.uid}` : 'keyboard_shortcuts';
      try {
        localStorage.setItem(storedKey, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save custom shortcuts:', e);
      }
      return next;
    });
  };

  const handleResetShortcuts = () => {
    setCustomShortcuts(DEFAULT_SHORTCUTS);
    const storedKey = user ? `keyboardShortcuts:${user.uid}` : 'keyboard_shortcuts';
    try {
      localStorage.setItem(storedKey, JSON.stringify(DEFAULT_SHORTCUTS));
    } catch (e) {
      console.error('Failed to reset shortcuts:', e);
    }
  };

  // Sync sidebar collapse state with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sidebar_collapsed', isSidebarCollapsed);
    } catch (e) {
      console.error('Failed to save sidebar state:', e);
    }
  }, [isSidebarCollapsed]);

  // Centralized global keyboard shortcut listener
  useEffect(() => {
    const isEditableTarget = (target) => {
      if (!target) return false;
      const tagName = target.tagName ? target.tagName.toUpperCase() : '';
      return (
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        target.isContentEditable
      );
    };

    const handleKeyDown = (e) => {
      const activeCloseShortcut =
        customShortcuts?.close || DEFAULT_SHORTCUTS.close;

      // 1. Esc key / Close shortcut dismisses active modal/overlay
      if (matchShortcut(e, activeCloseShortcut) || e.key === 'Escape') {
        if (isAuthModalOpen) {
          setIsAuthModalOpen(false);
        } else if (isProfileOpen) {
          setIsProfileOpen(false);
        } else if (isSearchOpen) {
          setIsSearchOpen(false);
        } else if (isNewLinkOpen) {
          setIsNewLinkOpen(false);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isHelpOpen) {
          setIsHelpOpen(false);
        } else if (isPricingOpen) {
          setIsPricingOpen(false);
        } else if (isMobileSidebarOpen) {
          setIsMobileSidebarOpen(false);
        }
        return;
      }

      // 2. Do not trigger productivity shortcuts if disabled or typing in an input field
      if (!shortcutsEnabled || isEditableTarget(e.target)) {
        return;
      }

      // Check New Link shortcut
      const newLinkShortcut = customShortcuts?.newLink || DEFAULT_SHORTCUTS.newLink;
      if (matchShortcut(e, newLinkShortcut)) {
        e.preventDefault();
        setIsNewLinkOpen((prev) => !prev);
        return;
      }

      // Check Search shortcut
      const searchShortcut = customShortcuts?.search || DEFAULT_SHORTCUTS.search;
      if (matchShortcut(e, searchShortcut)) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      // Check Toggle Sidebar shortcut
      const sidebarShortcut = customShortcuts?.toggleSidebar || DEFAULT_SHORTCUTS.toggleSidebar;
      if (matchShortcut(e, sidebarShortcut)) {
        e.preventDefault();
        handleToggleSidebar();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    shortcutsEnabled,
    customShortcuts,
    isProfileOpen,
    isSearchOpen,
    isNewLinkOpen,
    isSettingsOpen,
    isHelpOpen,
    isPricingOpen,
    isMobileSidebarOpen,
    isSidebarCollapsed,
  ]);

  const handleToggleTheme = () => {
    const nextMode = theme === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  // Called when a new URL is shortened successfully
  // intent: null (plain), 'qr', or 'customize'
  // Limit reached: guests are asked to sign in, signed-in users are shown the plans
  const handleLimitReached = (kind) => {
    if (kind === 'guest') {
      handleOpenAuthModal('login');
    } else {
      setIsPricingOpen(true);
    }
  };

  const handleUrlShortened = (newRecord, intent = null) => {
    // Refresh the plan usage counters shown in the pricing modal
    if (user && refetchProfile) refetchProfile();

    const defaultTitle = generateTitleFromUrl(newRecord.originalUrl);

    const historyItem = {
      shortCode: newRecord.shortCode,
      shortUrl: newRecord.shortUrl,
      originalUrl: newRecord.originalUrl,
      title: defaultTitle,
      createdAt: newRecord.createdAt || new Date().toISOString(),
    };

    setHistoryList((prev) => [
      historyItem,
      ...prev.filter((item) => item.shortCode !== newRecord.shortCode),
    ]);

    // Navigate to detail page; pass intent in router state so the page
    // can auto-open QR modal or custom-link editor on mount
    navigate(`/link/${newRecord.shortCode}`, {
      state: intent ? { intent } : undefined,
    });
  };

  const handleUrlShortenedWithIntent = (record, intent) => {
    handleUrlShortened(record, intent);
  };

  const handleNewLink = () => {
    setIsNewLinkOpen(true);
  };

  const handleSelectLink = (shortCode) => {
    navigate(`/link/${shortCode}`);
  };

  const handleRenameLink = async (shortCode, newTitle) => {
    const previousTitle = historyList.find((item) => item.shortCode === shortCode)?.title;
    const applyTitle = (title) =>
      setHistoryList((prev) =>
        prev.map((item) => (item.shortCode === shortCode ? { ...item, title } : item))
      );

    // Optimistic update, persisted server-side so it survives a page refresh
    applyTitle(newTitle);

    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(
        `${API_BASE_URL}/api/urls/${encodeURIComponent(shortCode)}/title`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: newTitle }),
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      console.error('Failed to save link title:', err);
      if (previousTitle !== undefined) applyTitle(previousTitle);
    }
  };

  const handleDeleteLink = async (shortCode) => {
    if (!user) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/urls/${encodeURIComponent(shortCode)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.success) {
        // Backend confirmed deletion — now update frontend state
        setHistoryList((prev) => prev.filter((item) => item.shortCode !== shortCode));
      } else {
        console.error(
          'Delete failed:',
          payload?.error || `HTTP ${response.status}`
        );
      }
    } catch (err) {
      console.error('Delete request error:', err);
    }
  };

  const handleShortCodeChanged = (oldCode, newCode, newShortUrl) => {
    setHistoryList((prev) =>
      prev.map((item) =>
        item.shortCode === oldCode
          ? { ...item, shortCode: newCode, shortUrl: newShortUrl }
          : item
      )
    );
    // Composite codes like @user/text must be double-encoded so React Router
    // treats them as a single param segment — or use the splat /link/* route
    navigate(`/link/${encodeURIComponent(newCode)}`);
  };

  // Plan picked (landing, pricing modal, upgrade buttons): signed-in users go straight to checkout,
  // signed-out visitors sign in first and are then sent to checkout with the same plan preselected
  const handleStartCheckout = (plan, period = DEFAULT_PERIOD) => {
    if (user) {
      navigate(checkoutPath(plan, period));
    } else {
      savePendingCheckout(plan, period);
      handleOpenAuthModal('register');
    }
  };

  useEffect(() => {
    if (user && hasPendingCheckout()) {
      const pending = takePendingCheckout();
      if (pending) {
        setIsAuthModalOpen(false);
        navigate(checkoutPath(pending.plan, pending.period), { replace: true });
      }
    }
  }, [user, navigate]);

  // An account without an active plan cannot create anything: once per sign-in it is sent straight to the payment page
  // (a plan picked before sign-in is handled above). Back from checkout lands on the dashboard without another redirect.
  const freeRedirectUidRef = useRef(null);
  useEffect(() => {
    if (!user) {
      freeRedirectUidRef.current = null;
      return;
    }
    if (!userProfile || profileLoading || membershipPlan !== 'free') return;
    if (freeRedirectUidRef.current === user.uid) return;
    if (hasPendingCheckout() || location.pathname.startsWith('/checkout')) return;
    if (isPublicPath(location.pathname) && location.pathname !== '/' && location.pathname !== '/en') return;
    freeRedirectUidRef.current = user.uid;
    navigate(checkoutPath(FEATURED_PLAN, DEFAULT_PERIOD), { replace: true });
  }, [user, userProfile, profileLoading, membershipPlan, location.pathname, navigate]);

  // Opening /checkout while signed out: remember the plan from the URL, then sign in first
  useEffect(() => {
    if (!location.pathname.startsWith('/checkout') || user || (authLoading && !authWaitExpired)) return;
    const query = new URLSearchParams(location.search);
    const plan = query.get('plan');
    if (isPaidPlanId(plan)) {
      savePendingCheckout(plan, isBillingPeriod(query.get('period')) ? query.get('period') : DEFAULT_PERIOD);
    }
    navigate('/', { replace: true });
    handleOpenAuthModal('register');
  }, [location.pathname, location.search, user, authLoading, authWaitExpired]);

  // PayTR returns inside its iframe: break out so the result page fills the whole window
  useEffect(() => {
    if (window.self !== window.top && /^\/checkout\/(success|failed)/.test(window.location.pathname)) {
      window.top.location.replace(window.location.href);
    }
  }, []);

  // Blog pages (/blog, /en/blog) are public and have their own layout
  if (/^\/(en\/)?blog(\/|$)/.test(location.pathname)) {
    return (
      <Suspense fallback={<div className="landingSplash" aria-hidden="true" />}>
        <BlogPage theme={theme} />
      </Suspense>
    );
  }

  // Legal pages (/yasal, /en/legal) are public and have their own layout
  if (/^\/(yasal|en\/legal)(\/|$)/.test(location.pathname)) {
    return (
      <Suspense fallback={<div className="landingSplash" aria-hidden="true" />}>
        <LegalPage theme={theme} />
      </Suspense>
    );
  }

  // Checkout is a focused page without the app shell
  if (location.pathname.startsWith('/checkout') && (user || (authLoading && !authWaitExpired))) {
    if (!user) return <div className="landingSplash" aria-hidden="true" />;
    return (
      <Suspense fallback={<div className="landingSplash" aria-hidden="true" />}>
        <CheckoutPage theme={theme} />
      </Suspense>
    );
  }

  // Signed-out visitors on the root path (or a stale /dashboard link) see the marketing landing page instead of the app shell
  if ((location.pathname === '/' || location.pathname === '/en' || location.pathname === '/dashboard') && !user) {
    // Only the very first auth check shows the placeholder; sign-in keeps the landing page visible
    if (authLoading && !authWaitExpired && hadSession()) {
      return <div className="landingSplash" aria-hidden="true" />;
    }
    return (
      <Suspense fallback={<div className="landingSplash" aria-hidden="true" />}>
        <LandingPage
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onShortened={handleUrlShortened}
          onOpenAuthModal={handleOpenAuthModal}
          onStartCheckout={handleStartCheckout}
          isSigningIn={authTransitioning}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
        />
      </Suspense>
    );
  }

  return (
    <div className="appLayout">
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={handleOpenSettings}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenAuthModal={handleOpenAuthModal}
        userPlan={membershipPlan}
      />

      <div className="appBody">
        <SidebarWrapper
          historyList={historyList}
          isHistoryLoading={isHistoryLoading}
          historyError={historyError}
          onRetryHistory={() => fetchUserHistory(true)}
          onSelectLink={handleSelectLink}
          onNewLink={handleNewLink}
          onRenameLink={handleRenameLink}
          onDeleteLink={handleDeleteLink}
          onOpenSettings={handleOpenSettings}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenPricing={() => setIsPricingOpen(true)}
          onOpenAuthModal={handleOpenAuthModal}
          userPlan={membershipPlan}
          isOpen={isMobileSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onToggleSidebar={handleToggleSidebar}
          onOpenSearch={() => setIsSearchOpen(true)}
          theme={theme}
        />

        <main className="mainContent">
          <Suspense fallback={null}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <MainComposerView
                  onUrlShortened={handleUrlShortened}
                  onUrlShortenedWithIntent={handleUrlShortenedWithIntent}
                  onLimitReached={handleLimitReached}
                  membershipPlan={membershipPlan}
                />
              }
            />
            <Route
              path="/"
              element={
                <MainComposerView
                  onUrlShortened={handleUrlShortened}
                  onUrlShortenedWithIntent={handleUrlShortenedWithIntent}
                  onLimitReached={handleLimitReached}
                  membershipPlan={membershipPlan}
                />
              }
            />
            <Route
              path="/link/:shortCode"
              element={
                <LinkAnalyticsPage
                  onOpenNewLink={() => setIsNewLinkOpen(true)}
                  onShortCodeChanged={handleShortCodeChanged}
                  onOpenAuthModal={handleOpenAuthModal}
                  onOpenPricing={() => setIsPricingOpen(true)}
                />
              }
            />
            {/* Splat route for composite custom codes: /link/@user/customText */}
            <Route
              path="/link/*"
              element={
                <LinkAnalyticsPage
                  onOpenNewLink={() => setIsNewLinkOpen(true)}
                  onShortCodeChanged={handleShortCodeChanged}
                  onOpenAuthModal={handleOpenAuthModal}
                  onOpenPricing={() => setIsPricingOpen(true)}
                />
              }
            />
            <Route
              path="*"
              element={
                <MainComposerView
                  onUrlShortened={handleUrlShortened}
                  onUrlShortenedWithIntent={handleUrlShortenedWithIntent}
                  onLimitReached={handleLimitReached}
                  membershipPlan={membershipPlan}
                />
              }
            />
          </Routes>
          </Suspense>
        </main>
      </div>

      <Suspense fallback={null}>
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        historyList={historyList}
        onSelectLink={handleSelectLink}
      />

      <NewLinkModal
        isOpen={isNewLinkOpen}
        onClose={() => setIsNewLinkOpen(false)}
        onUrlShortened={handleUrlShortened}
        onLimitReached={handleLimitReached}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsInitialTab}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        colorTheme={colorTheme}
        onSelectColorTheme={handleSelectColorTheme}
        density={density}
        onSelectDensity={handleSelectDensity}
        shortcutsEnabled={shortcutsEnabled}
        onToggleShortcuts={handleToggleShortcuts}
        customShortcuts={customShortcuts}
        onSaveCustomShortcut={handleSaveCustomShortcut}
        onResetShortcuts={handleResetShortcuts}
        userPlan={membershipPlan}
        historyList={historyList}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        userPlan={membershipPlan}
        onOpenAuthModal={handleOpenAuthModal}
        onSelectPlan={(plan, period) => {
          setIsPricingOpen(false);
          handleStartCheckout(plan, period);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
      </Suspense>
    </div>
  );
}

// Wrapper component to get current shortCode route param for active sidebar styling
function SidebarWrapper(props) {
  const { shortCode } = useParams();
  return <Sidebar {...props} activeShortCode={shortCode} />;
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
