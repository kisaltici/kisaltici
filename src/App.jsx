import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
} from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SearchModal from './components/SearchModal';
import NewLinkModal from './components/NewLinkModal';
import SettingsModal from './components/SettingsModal';
import ProfileModal from './components/ProfileModal';
import HelpModal from './components/HelpModal';
import PricingModal from './components/PricingModal';
import AuthModal from './components/AuthModal';
import UrlForm from './components/UrlForm';
import LinkAnalyticsPage from './pages/LinkAnalyticsPage';
import { generateTitleFromUrl } from './utils/titleGenerator';
import { applyColorTheme } from './utils/themePresets';
import { DEFAULT_SHORTCUTS, matchShortcut } from './utils/keyboardDefaults';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { API_BASE_URL } from './config/api';
import './App.css';

function MainComposerView({ onUrlShortened }) {
  const { t } = useTranslation();
  return (
    <section className="heroSection">
      <h1 className="heroTitle">{t('homeTitle')}</h1>
      <UrlForm onUrlShortened={onUrlShortened} />
    </section>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const { user, getIdToken, authTransitioning, membershipPlan } = useAuth();

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
  const [historyList, setHistoryList] = useState([]);
  const [customShortcuts, setCustomShortcuts] = useState(DEFAULT_SHORTCUTS);

  // In-flight and fetched UID tracking for history to prevent duplicate requests
  const historyFetchedUidRef = useRef(null);
  const historyInFlightUidRef = useRef(null);

  const handleOpenAuthModal = (mode = 'login') => {
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
        setIsHistoryLoading(false);
        historyInFlightUidRef.current = null;
        return;
      }

      if (response.ok && payload?.success && Array.isArray(payload.data)) {
        const formatted = payload.data.map((item) => ({
          shortCode: item.shortCode,
          shortUrl: item.shortUrl,
          originalUrl: item.originalUrl,
          title: generateTitleFromUrl(item.originalUrl),
          createdAt: item.createdAt,
          clickCount: item.clickCount,
        }));
        setHistoryList(formatted);
        historyFetchedUidRef.current = currentUid;
      }
    } catch (err) {
      console.error('Failed to fetch user history:', err);
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
  const handleUrlShortened = (newRecord) => {
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

    // Navigate directly to the dedicated link analytics page
    navigate(`/link/${newRecord.shortCode}`);
  };

  const handleNewLink = () => {
    setIsNewLinkOpen(true);
  };

  const handleSelectLink = (shortCode) => {
    navigate(`/link/${shortCode}`);
  };

  const handleRenameLink = (shortCode, newTitle) => {
    setHistoryList((prev) =>
      prev.map((item) =>
        item.shortCode === shortCode ? { ...item, title: newTitle } : item
      )
    );
  };

  const handleDeleteLink = (shortCode) => {
    setHistoryList((prev) => prev.filter((item) => item.shortCode !== shortCode));
  };

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
        />

        <main className="mainContent">
          <Routes>
            <Route
              path="/"
              element={
                <MainComposerView onUrlShortened={handleUrlShortened} />
              }
            />
            <Route
              path="/link/:shortCode"
              element={
                <LinkAnalyticsPage
                  onOpenNewLink={() => setIsNewLinkOpen(true)}
                />
              }
            />
            <Route
              path="*"
              element={
                <MainComposerView onUrlShortened={handleUrlShortened} />
              }
            />
          </Routes>
        </main>
      </div>

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
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
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
