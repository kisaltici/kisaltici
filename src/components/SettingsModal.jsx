import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getPlanDisplayName, isPaidPlan } from '../utils/membership';
import { getAccountProviderLabel } from '../utils/authHelpers';
import {
  COLOR_THEMES,
  FREE_THEME_KEYS,
  PRO_THEME_KEYS,
} from '../utils/themePresets';
import {
  DEFAULT_SHORTCUTS,
  getKeycapLabels,
  areShortcutsEqual,
  normalizeKey,
} from '../utils/keyboardDefaults';
import './SettingsModal.css';

// Architecture configuration for storage limits by membership plan
export const STORAGE_LIMITS = {
  free: 100 * 1024, // 100 KB
  pro: 1024 * 1024, // 1 MB (1000 KB)
};

export function getStorageLimit(planId) {
  return STORAGE_LIMITS[planId] || STORAGE_LIMITS.free;
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SettingsModal({
  isOpen,
  onClose,
  initialTab = null,
  themeMode,
  setThemeMode,
  colorTheme = 'default',
  onSelectColorTheme,
  density = 'standard',
  onSelectDensity,
  shortcutsEnabled = true,
  onToggleShortcuts,
  customShortcuts = DEFAULT_SHORTCUTS,
  onSaveCustomShortcut,
  onResetShortcuts,
  userPlan = 'free',
  historyList = [],
  onOpenPricing,
}) {
  const { t, languageMode, setLanguageMode } = useTranslation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(
    initialTab || (user ? 'general' : 'appearance')
  );
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [lockedPromptTheme, setLockedPromptTheme] = useState(null);

  const [isMounted, setIsMounted] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  const [cookiesEnabled, setCookiesEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('cookies_enabled');
      return saved === null ? true : saved === 'true';
    } catch (e) {
      return true;
    }
  });

  const [editingShortcutId, setEditingShortcutId] = useState(null);
  const [recordedShortcut, setRecordedShortcut] = useState(null);
  const [shortcutWarning, setShortcutWarning] = useState(null);
  const [shortcutConflictAction, setShortcutConflictAction] = useState(null);

  // Switch default or requested initial tab when modal opens or user auth changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || (user ? 'general' : 'appearance'));
      setNavSearchQuery('');
      setAvatarError(false);
      setLockedPromptTheme(null);
      setEditingShortcutId(null);
      setRecordedShortcut(null);
      setShortcutWarning(null);
      setShortcutConflictAction(null);
    }
  }, [isOpen, user, initialTab]);

  // Keypress recorder when editing a shortcut
  useEffect(() => {
    if (!editingShortcutId) return;

    const actionTitleMap = {
      newLink: t('shortcutNewLink'),
      search: t('shortcutSearch'),
      close: t('shortcutClose'),
      toggleSidebar: t('shortcutToggleSidebar'),
    };

    const handleKeyRecord = (e) => {
      // Ignore alone modifier presses
      if (['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const keyName = normalizeKey(e.key);
      const isCtrl = Boolean(e.ctrlKey || e.metaKey);
      const isAlt = Boolean(e.altKey);
      const isShift = Boolean(e.shiftKey);

      const candidate = {
        key: keyName,
        ctrl: isCtrl,
        alt: isAlt,
        shift: isShift,
      };

      // Single plain letter key restriction check (e.g. 'a' without Ctrl/Alt)
      const isSingleLetter = keyName.length === 1 && !isCtrl && !isAlt;

      let warning = null;
      let conflict = null;

      if (isSingleLetter) {
        warning =
          t('singleKeyRestricted') ||
          'Kısayol bir değiştirici tuş (Ctrl, Cmd, Alt) veya özel tuş içermelidir.';
      }

      // Conflict detection against other active shortcuts
      const activeShortcuts = customShortcuts || DEFAULT_SHORTCUTS;
      for (const [otherId, otherShortcut] of Object.entries(activeShortcuts)) {
        if (otherId !== editingShortcutId) {
          if (areShortcutsEqual(candidate, otherShortcut)) {
            const conflictName = actionTitleMap[otherId] || otherId;
            conflict = {
              actionId: otherId,
              label: conflictName,
            };
            warning = `${
              t('shortcutConflictWarning') ||
              'Bu kısayol başka bir işlem için kullanılıyor.'
            } ("${conflictName}" ${t('alreadyAssigned') || 'için atanmış.'})`;
            break;
          }
        }
      }

      setRecordedShortcut(candidate);
      setShortcutWarning(warning);
      setShortcutConflictAction(conflict);
    };

    window.addEventListener('keydown', handleKeyRecord, true);
    return () => window.removeEventListener('keydown', handleKeyRecord, true);
  }, [editingShortcutId, customShortcuts, t]);

  const handleSaveRecorded = (replaceConflict = false) => {
    if (!editingShortcutId || !recordedShortcut) return;

    if (onSaveCustomShortcut) {
      if (replaceConflict && shortcutConflictAction) {
        // Unassign conflicting action by clearing its shortcut
        onSaveCustomShortcut(shortcutConflictAction.actionId, {
          key: '',
          ctrl: false,
          alt: false,
          shift: false,
        });
      }
      onSaveCustomShortcut(editingShortcutId, recordedShortcut);
    }

    setEditingShortcutId(null);
    setRecordedShortcut(null);
    setShortcutWarning(null);
    setShortcutConflictAction(null);
  };

  const handleCancelEditing = () => {
    setEditingShortcutId(null);
    setRecordedShortcut(null);
    setShortcutWarning(null);
    setShortcutConflictAction(null);
  };

  // Entrance and exit animation
  useEffect(() => {
    let timer;
    if (isOpen) {
      setIsMounted(true);
      timer = setTimeout(() => {
        setIsAnimatingIn(true);
      }, 20);
    } else {
      setIsAnimatingIn(false);
      timer = setTimeout(() => {
        setIsMounted(false);
      }, 250);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Calculate dynamic storage usage and limit based on architecture
  const limitBytes = getStorageLimit(userPlan);
  const usedBytes = useMemo(() => {
    if (historyList && historyList.length > 0) {
      try {
        const jsonStr = JSON.stringify(historyList);
        const blobSize = new Blob([jsonStr]).size;
        return Math.max(12 * 1024, blobSize);
      } catch (e) {
        return 12 * 1024;
      }
    }
    return 12 * 1024; // Default 12 KB isolated placeholder
  }, [historyList]);

  const usagePercentage = Math.min(100, Math.round((usedBytes / limitBytes) * 100));

  // Category definitions for Guest vs Authenticated modes
  const guestCategories = [
    { id: 'appearance', label: t('appearance'), icon: 'sun' },
    { id: 'language', label: t('language'), icon: 'globe' },
    { id: 'dataControls', label: t('dataControls'), icon: 'shield' },
  ];

  const authCategories = [
    {
      id: 'general',
      label: t('settingsGeneralTitle'),
      keywords: 'genel general dil language görünüm appearance tema theme yükselt upgrade',
      icon: 'sliders',
    },
    {
      id: 'account',
      label: t('settingsAccountTitle'),
      keywords: 'hesap account profil profile e-posta email üyelik plan',
      icon: 'user',
    },
    {
      id: 'personalization',
      label: t('settingsPersonalizationTitle'),
      keywords: 'kişiselleştirme personalization renk renkler renk teması theme lime ocean sunset rose aurora cyber midnight ember arctic graphite amethyst solar forest neon yoğunluk density',
      icon: 'palette',
    },
    {
      id: 'keyboard',
      label: t('settingsKeyboardTitle'),
      keywords: 'klavye keyboard kısayol kısayollar shortcut shortcuts ctrl cmd esc yeni bağlantı arama arayüz',
      icon: 'keyboard',
    },
    {
      id: 'dataControls',
      label: t('dataControls'),
      keywords: 'veri kontrolleri data controls çerezler cookies geçmiş history',
      icon: 'shield',
    },
    {
      id: 'storage',
      label: t('settingsStorageTitle'),
      keywords: 'depolama storage alan kb mb kota plan',
      icon: 'database',
    },
  ];

  const visibleCategories = useMemo(() => {
    if (!user) return guestCategories;
    if (!navSearchQuery.trim()) return authCategories;
    const query = navSearchQuery.toLowerCase().trim();
    return authCategories.filter(
      (cat) =>
        cat.label.toLowerCase().includes(query) ||
        (cat.keywords && cat.keywords.toLowerCase().includes(query))
    );
  }, [user, navSearchQuery, t]);

  // Auto-switch active tab if current activeTab is hidden by search filter
  useEffect(() => {
    if (user && visibleCategories.length > 0) {
      const exists = visibleCategories.some((c) => c.id === activeTab);
      if (!exists) {
        setActiveTab(visibleCategories[0].id);
      }
    }
  }, [visibleCategories, activeTab, user]);

  if (!isMounted) return null;

  const handleToggleCookies = () => {
    setCookiesEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cookies_enabled', String(next));
      } catch (e) {
        console.error('Failed to save cookies preference:', e);
      }
      return next;
    });
  };

  const handleThemeClick = (themeObj) => {
    const isProUser = isPaidPlan(userPlan);
    if (themeObj.isPro && !isProUser) {
      setLockedPromptTheme(themeObj.id);
      return;
    }
    setLockedPromptTheme(null);
    if (onSelectColorTheme) {
      onSelectColorTheme(themeObj.id);
    }
  };

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'sliders':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        );
      case 'user':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case 'palette':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
            <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.21-.64-1.67-.38-.43-.6-1.02-.6-1.63 0-1.38 1.12-2.5 2.5-2.5H18c2.21 0 4-1.79 4-4 0-5.51-4.49-10-10-10z" />
          </svg>
        );
      case 'sun':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        );
      case 'globe':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        );
      case 'shield':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
      case 'database':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
        );
      case 'keyboard':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
            <line x1="6" y1="8" x2="6.01" y2="8" />
            <line x1="10" y1="8" x2="10.01" y2="8" />
            <line x1="14" y1="8" x2="14.01" y2="8" />
            <line x1="18" y1="8" x2="18.01" y2="8" />
            <line x1="6" y1="12" x2="6.01" y2="12" />
            <line x1="10" y1="12" x2="10.01" y2="12" />
            <line x1="14" y1="12" x2="14.01" y2="12" />
            <line x1="18" y1="12" x2="18.01" y2="12" />
            <line x1="8" y1="16" x2="16" y2="16" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderThemeSwatch = (key, preset, isLocked) => {
    const isSelected = colorTheme === key;
    const p = preset.preview;

    return (
      <div
        key={key}
        className={`themeSwatchCard ${isSelected ? 'selected' : ''} ${
          isLocked ? 'locked' : ''
        }`}
        onClick={() => handleThemeClick(preset)}
        role="button"
        tabIndex={0}
      >
        {/* High-End SaaS Miniature Application UI Mockup */}
        <div className="themeMiniMockup" style={{ backgroundColor: p.bg }}>
          <div
            className="themeMiniHeader"
            style={{ backgroundColor: p.header, borderColor: p.border }}
          >
            <div className="themeMiniDotRow">
              <span className="themeMiniDot" />
              <span className="themeMiniDot" />
            </div>
            <div
              className="themeMiniHeaderPill"
              style={{ backgroundColor: p.accent }}
            />
          </div>
          <div className="themeMiniBody">
            <div
              className="themeMiniSidebar"
              style={{ backgroundColor: p.sidebar, borderColor: p.border }}
            >
              <div
                className="themeMiniSideLine"
                style={{ backgroundColor: p.accent, opacity: 0.8 }}
              />
              <div className="themeMiniSideLine muted" />
              <div className="themeMiniSideLine muted" />
            </div>
            <div className="themeMiniMain">
              <div
                className="themeMiniCard"
                style={{ backgroundColor: p.surface, borderColor: p.border }}
              >
                <div className="themeMiniLine long" />
                <div className="themeMiniLine short" />
                <div
                  className="themeMiniBtn"
                  style={{ backgroundColor: p.accent }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Theme Title & Status Badge */}
        <div className="themeSwatchTitleRow">
          <span className="themeSwatchName">{preset.nameFallback}</span>
          {isLocked ? (
            <svg
              className="themeLockIcon"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          ) : (
            isSelected && (
              <svg
                className="themeActiveCheck"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`settingsModalBackdrop ${isAnimatingIn ? 'visible' : ''}`}
      onClick={onClose}
    >
      <div
        className={`settingsModalBox ${isAnimatingIn ? 'visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        {/* Modal Header */}
        <div className="settingsModalHeader">
          <h2 id="settings-modal-title" className="settingsModalTitle">
            {t('settings')}
          </h2>
          <button
            type="button"
            className="settingsCloseBtn"
            onClick={onClose}
            aria-label={t('closeModal')}
            title={t('closeModal')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Main Layout (Sidebar + Content Panel) */}
        <div className="settingsModalLayout">
          {/* Left Category Sidebar */}
          <nav className="settingsNav" aria-label="Settings Categories">
            {/* Authenticated Settings Search Input */}
            {user && (
              <div className="settingsNavSearch">
                <svg className="settingsSearchIcon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="settingsSearchInput"
                  placeholder={t('searchSettingsPlaceholder')}
                  value={navSearchQuery}
                  onChange={(e) => setNavSearchQuery(e.target.value)}
                />
              </div>
            )}

            {/* Category Nav Items */}
            {visibleCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`settingsNavItem ${activeTab === cat.id ? 'active' : ''}`}
                onClick={() => setActiveTab(cat.id)}
                title={cat.label}
                aria-label={cat.label}
              >
                {renderIcon(cat.icon)}
                <span className="settingsNavText">{cat.label}</span>
              </button>
            ))}

            {visibleCategories.length === 0 && (
              <div className="settingsNavEmpty">
                {t('noLinksMatch').replace('{query}', navSearchQuery)}
              </div>
            )}
          </nav>

          {/* Right Content Area */}
          <div className="settingsContent">
            {/* ========================================================
                AUTHENTICATED SETTINGS PANES
               ======================================================== */}

            {/* 1. GENEL (General) */}
            {user && activeTab === 'general' && (
              <div className="settingsTabPane">
                <div className="settingsPaneHeader">
                  <h3 className="settingsPaneTitle">{t('settingsGeneralTitle')}</h3>
                  <p className="settingsPaneDesc">{t('settingsGeneralDesc')}</p>
                </div>

                <div className="settingsGroup">
                  {/* Language */}
                  <div className="settingsRow">
                    <div className="settingsLabelGroup">
                      <label htmlFor="lang-select-auth" className="settingsLabel">
                        {t('language')}
                      </label>
                      <span className="settingsSubtext">
                        {t('settingsDescLanguage')}
                      </span>
                    </div>
                    <div className="settingsSelectWrapper">
                      <select
                        id="lang-select-auth"
                        className="settingsSelect"
                        value={languageMode}
                        onChange={(e) => setLanguageMode(e.target.value)}
                      >
                        <option value="auto">{t('langAuto')}</option>
                        <option value="tr">{t('langTr')}</option>
                        <option value="en">{t('langEn')}</option>
                      </select>
                      <svg className="selectChevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  {/* Theme Mode (Appearance) */}
                  <div className="settingsRow">
                    <div className="settingsLabelGroup">
                      <label htmlFor="theme-select-auth" className="settingsLabel">
                        {t('appearance')}
                      </label>
                      <span className="settingsSubtext">
                        {t('settingsDescAppearance')}
                      </span>
                    </div>
                    <div className="settingsSelectWrapper">
                      <select
                        id="theme-select-auth"
                        className="settingsSelect"
                        value={themeMode}
                        onChange={(e) => setThemeMode(e.target.value)}
                      >
                        <option value="system">{t('themeSystem')}</option>
                        <option value="light">{t('themeLight')}</option>
                        <option value="dark">{t('themeDark')}</option>
                      </select>
                      <svg className="selectChevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  {/* ChatGPT-style Subtle Upgrade Promotion Row */}
                  <div className="settingsPromoCard">
                    <div className="settingsPromoDetails">
                      <span className="settingsPromoTitle">{t('promoTitle')}</span>
                      <span className="settingsPromoDesc">{t('promoDesc')}</span>
                    </div>
                    <button
                      type="button"
                      className="settingsPromoBtn"
                      onClick={() => {
                        onClose();
                        if (onOpenPricing) onOpenPricing();
                      }}
                    >
                      {t('upgrade')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. HESAP (Account - Standalone) */}
            {user && activeTab === 'account' && (
              <div className="settingsTabPane">
                <div className="settingsPaneHeader">
                  <h3 className="settingsPaneTitle">{t('settingsAccountTitle')}</h3>
                  <p className="settingsPaneDesc">{t('settingsAccountDesc')}</p>
                </div>

                <div className="settingsGroup">
                  {/* Account Info Card */}
                  <div className="settingsAccountCard">
                    <div className="settingsAccountAvatar">
                      {user.photoURL && !avatarError ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <div className="settingsAccountAvatarFallback">
                          {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="settingsAccountDetails">
                      <span className="settingsAccountName">
                        {user.displayName || user.email}
                      </span>
                      <span className="settingsAccountEmail">{user.email}</span>
                    </div>
                    <span className="settingsAccountBadge">
                      {getAccountProviderLabel(user, t)}
                    </span>
                  </div>

                  {/* Membership Info Row */}
                  <div className="settingsRow">
                    <div className="settingsLabelGroup">
                      <span className="settingsLabel">{t('planLabel')}</span>
                    </div>
                    <div className="settingsPlanValueWrapper">
                      <span
                        className={`settingsPlanValue ${
                          isPaidPlan(userPlan) ? 'paid' : 'free'
                        }`}
                      >
                        {getPlanDisplayName(userPlan, t)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. KİŞİSELLEŞTİRME (Personalization - SaaS Color Themes Picker & Density) */}
            {user && activeTab === 'personalization' && (
              <div className="settingsTabPane">
                <div className="settingsPaneHeader">
                  <h3 className="settingsPaneTitle">
                    {t('settingsPersonalizationTitle')}
                  </h3>
                  <p className="settingsPaneDesc">
                    {t('settingsPersonalizationDesc')}
                  </p>
                </div>

                <div className="settingsGroup">
                  {/* Color Themes Section */}
                  <div className="settingsThemeSection">
                    <div className="settingsThemeSectionHeader">
                      <span className="settingsLabel">{t('colorThemeTitle')}</span>
                      <span className="settingsSubtext">{t('colorThemeDesc')}</span>
                    </div>

                    {/* Locked Pro Theme Inline Notification Banner */}
                    {lockedPromptTheme && (
                      <div className="lockedThemeNoticeCard">
                        <div className="lockedThemeNoticeTextGroup">
                          <span className="lockedThemeTitle">
                            {t('lockedProNotice')}
                          </span>
                          <span className="lockedThemeSub">
                            {t('lockedProSub')}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="lockedThemeUpgradeBtn"
                          onClick={() => {
                            onClose();
                            if (onOpenPricing) onOpenPricing();
                          }}
                        >
                          {t('upgrade')}
                        </button>
                      </div>
                    )}

                    {/* FREE COLOR THEMES (5) */}
                    <div className="themeGroupSubhead">{t('freeThemesTitle')}</div>
                    <div className="colorThemeGrid">
                      {FREE_THEME_KEYS.map((key) =>
                        renderThemeSwatch(key, COLOR_THEMES[key], false)
                      )}
                    </div>

                    {/* PRO COLOR THEMES (10) */}
                    <div className="themeGroupSubhead pro">
                      <span>{t('proThemesTitle')}</span>
                      <span className="proSubtextHint">{t('proThemesDesc')}</span>
                    </div>
                    <div className="colorThemeGrid">
                      {PRO_THEME_KEYS.map((key) =>
                        renderThemeSwatch(
                          key,
                          COLOR_THEMES[key],
                          !isPaidPlan(userPlan)
                        )
                      )}
                    </div>
                  </div>

                  {/* Arayüz Yoğunluğu */}
                  <div className="settingsRow" style={{ marginTop: '0.85rem' }}>
                    <div className="settingsLabelGroup">
                      <label htmlFor="density-select" className="settingsLabel">
                        {t('interfaceDensity')}
                      </label>
                    </div>
                    <div className="settingsSelectWrapper">
                      <select
                        id="density-select"
                        className="settingsSelect"
                        value={density}
                        onChange={(e) => {
                          if (onSelectDensity) onSelectDensity(e.target.value);
                        }}
                      >
                        <option value="comfortable">{t('densityComfortable')}</option>
                        <option value="standard">{t('densityStandard')}</option>
                        <option value="compact">{t('densityCompact')}</option>
                      </select>
                      <svg className="selectChevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. KLAVYE (Keyboard) */}
            {user && activeTab === 'keyboard' && (
              <div className="settingsTabPane">
                <div className="settingsPaneHeader">
                  <h3 className="settingsPaneTitle">
                    {t('settingsKeyboardTitle')}
                  </h3>
                  <p className="settingsPaneDesc">
                    {t('settingsKeyboardDesc')}
                  </p>
                </div>

                <div className="settingsGroup">
                  {/* Enable / Disable Shortcuts Toggle Row */}
                  <div className="settingsRow">
                    <div className="settingsLabelGroup">
                      <span className="settingsLabel">
                        {t('keyboardShortcutsTitle')}
                      </span>
                      <span className="settingsSubtext">
                        {t('keyboardShortcutsDesc')}
                      </span>
                    </div>
                    <div className="shortcutToggleWrapper">
                      <span className="shortcutToggleStatusLabel">
                        {shortcutsEnabled ? t('switchOn') : t('switchOff')}
                      </span>
                      <button
                        type="button"
                        className={`settingsToggleSwitch ${shortcutsEnabled ? 'active' : ''}`}
                        onClick={() => {
                          if (onToggleShortcuts) onToggleShortcuts();
                        }}
                        role="switch"
                        aria-checked={shortcutsEnabled}
                        aria-label={t('keyboardShortcutsTitle')}
                      >
                        <span className="toggleSwitchHandle" />
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Shortcut Items List */}
                  <div className="shortcutListContainer">
                    {[
                      { id: 'newLink', title: t('shortcutNewLink'), desc: t('shortcutNewLinkDesc') },
                      { id: 'search', title: t('shortcutSearch'), desc: t('shortcutSearchDesc') },
                      { id: 'close', title: t('shortcutClose'), desc: t('shortcutCloseDesc') },
                      { id: 'toggleSidebar', title: t('shortcutToggleSidebar'), desc: t('shortcutToggleSidebarDesc') },
                    ].map((action) => {
                      const activeShortcuts = customShortcuts || DEFAULT_SHORTCUTS;
                      const currentShortcut = activeShortcuts[action.id] || DEFAULT_SHORTCUTS[action.id];
                      const isEditing = editingShortcutId === action.id;
                      const displayShortcut = isEditing && recordedShortcut ? recordedShortcut : currentShortcut;
                      const keyLabels = getKeycapLabels(displayShortcut);

                      return (
                        <div key={action.id} className={`shortcutRow ${isEditing ? 'editing' : ''}`}>
                          <div className="shortcutDetails">
                            <span className="shortcutTitle">{action.title}</span>
                            <span className="shortcutSubtext">{action.desc}</span>
                          </div>

                          <div className="shortcutControlGroup">
                            {isEditing ? (
                              <div className="shortcutEditingBox">
                                <div className="shortcutRecordingStatus">
                                  <span className="recordingDot" />
                                  <span>
                                    {recordedShortcut
                                      ? t('pressNewShortcut') || 'Yeni kısayol algılandı'
                                      : t('pressShortcutPrompt') || 'Kısayola basın...'}
                                  </span>
                                </div>

                                <div className="shortcutKeycapGroup">
                                  {keyLabels.length > 0 ? (
                                    keyLabels.map((lbl, i) => (
                                      <span key={i} className="shortcutKeycapWrapper">
                                        {i > 0 && <span className="shortcutPlus">+</span>}
                                        <kbd className="shortcutKeycap">{lbl}</kbd>
                                      </span>
                                    ))
                                  ) : (
                                    <span className="shortcutKeycap empty">...</span>
                                  )}
                                </div>

                                {shortcutWarning && (
                                  <div className="shortcutWarningText">{shortcutWarning}</div>
                                )}

                                <div className="shortcutEditingBtns">
                                  {shortcutConflictAction ? (
                                    <button
                                      type="button"
                                      className="shortcutSaveBtn replace"
                                      onClick={() => handleSaveRecorded(true)}
                                    >
                                      {t('replaceShortcut') || 'Üstüne yaz ve kaydet'}
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      className="shortcutSaveBtn"
                                      disabled={!recordedShortcut}
                                      onClick={() => handleSaveRecorded(false)}
                                    >
                                      {t('save') || 'Kaydet'}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="shortcutCancelBtn"
                                    onClick={handleCancelEditing}
                                  >
                                    {t('cancel')}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="shortcutViewBox">
                                <div className="shortcutKeycapGroup">
                                  {keyLabels.map((lbl, i) => (
                                    <span key={i} className="shortcutKeycapWrapper">
                                      {i > 0 && <span className="shortcutPlus">+</span>}
                                      <kbd className="shortcutKeycap">{lbl}</kbd>
                                    </span>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  className="shortcutEditBtn"
                                  onClick={() => {
                                    setEditingShortcutId(action.id);
                                    setRecordedShortcut(null);
                                    setShortcutWarning(null);
                                    setShortcutConflictAction(null);
                                  }}
                                >
                                  {t('edit') || 'Düzenle'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reset to defaults button */}
                  <div className="shortcutResetRow">
                    <button
                      type="button"
                      className="shortcutResetBtn"
                      onClick={() => {
                        if (onResetShortcuts) onResetShortcuts();
                        handleCancelEditing();
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                      <span>{t('resetToDefaults') || 'Varsayılanlara dön'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. DEPOLAMA (Storage) */}
            {user && activeTab === 'storage' && (
              <div className="settingsTabPane">
                <div className="settingsPaneHeader">
                  <h3 className="settingsPaneTitle">{t('settingsStorageTitle')}</h3>
                  <p className="settingsPaneDesc">{t('settingsStorageDesc')}</p>
                </div>

                <div className="settingsGroup">
                  <div className="storageCard">
                    <div className="storageCardHeader">
                      <div className="storageCardTitleGroup">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <ellipse cx="12" cy="5" rx="9" ry="3" />
                          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                        </svg>
                        <span className="storageCardTitle">{t('storageUsage')}</span>
                      </div>
                      <span className="storagePlanBadge">
                        {userPlan === 'pro'
                          ? t('planBadgePro')
                          : getPlanDisplayName(userPlan, t) + ' planı'}
                      </span>
                    </div>

                    <div className="storageBarOuter">
                      <div
                        className="storageBarInner"
                        style={{ width: `${usagePercentage}%` }}
                      />
                    </div>

                    <div className="storageTextRow">
                      <span className="storageAmountText">
                        {formatBytes(usedBytes)} / {formatBytes(limitBytes)}
                      </span>
                      <span className="storagePercentageText">
                        {usagePercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                SHARED / GUEST PANES
               ======================================================== */}

            {/* Veri Kontrolleri (Data Controls - Both Auth & Guest) */}
            {activeTab === 'dataControls' && (
              <div className="settingsTabPane">
                <div className="settingsPaneHeader">
                  <h3 className="settingsPaneTitle">{t('dataControls')}</h3>
                  <p className="settingsPaneDesc">{t('settingsDescDataControls')}</p>
                </div>

                <div className="settingsGroup">
                  {/* Cookies toggle */}
                  <div className="settingsRow">
                    <div className="settingsLabelGroup">
                      <span className="settingsLabel">{t('cookies')}</span>
                      <span className="settingsSubtext">{t('cookiesDesc')}</span>
                    </div>
                    <button
                      type="button"
                      className={`settingsToggleSwitch ${cookiesEnabled ? 'active' : ''}`}
                      onClick={handleToggleCookies}
                      role="switch"
                      aria-checked={cookiesEnabled}
                      aria-label={t('cookies')}
                    >
                      <span className="toggleSwitchHandle" />
                    </button>
                  </div>

                  {/* Informational Section for Link History */}
                  <div className="settingsInfoBox">
                    <div className="settingsInfoIcon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    </div>
                    <div className="settingsInfoTextGroup">
                      <span className="settingsInfoTitle">
                        {t('linkHistorySection')}
                      </span>
                      <span className="settingsInfoSubtext">
                        {t('linkHistoryDataNotice')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Görünüm (Appearance - Guest mode) */}
            {!user && activeTab === 'appearance' && (
              <div className="settingsTabPane">
                <div className="settingsPaneHeader">
                  <h3 className="settingsPaneTitle">{t('appearance')}</h3>
                  <p className="settingsPaneDesc">{t('settingsDescAppearance')}</p>
                </div>

                <div className="settingsGroup">
                  <div className="settingsRow">
                    <div className="settingsLabelGroup">
                      <label htmlFor="theme-select-guest" className="settingsLabel">
                        {t('appearance')}
                      </label>
                    </div>
                    <div className="settingsSelectWrapper">
                      <select
                        id="theme-select-guest"
                        className="settingsSelect"
                        value={themeMode}
                        onChange={(e) => setThemeMode(e.target.value)}
                      >
                        <option value="system">{t('themeSystem')}</option>
                        <option value="light">{t('themeLight')}</option>
                        <option value="dark">{t('themeDark')}</option>
                      </select>
                      <svg className="selectChevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dil (Language - Guest mode) */}
            {!user && activeTab === 'language' && (
              <div className="settingsTabPane">
                <div className="settingsPaneHeader">
                  <h3 className="settingsPaneTitle">{t('language')}</h3>
                  <p className="settingsPaneDesc">{t('settingsDescLanguage')}</p>
                </div>

                <div className="settingsGroup">
                  <div className="settingsRow">
                    <div className="settingsLabelGroup">
                      <label htmlFor="lang-select-guest" className="settingsLabel">
                        {t('language')}
                      </label>
                    </div>
                    <div className="settingsSelectWrapper">
                      <select
                        id="lang-select-guest"
                        className="settingsSelect"
                        value={languageMode}
                        onChange={(e) => setLanguageMode(e.target.value)}
                      >
                        <option value="auto">{t('langAuto')}</option>
                        <option value="tr">{t('langTr')}</option>
                        <option value="en">{t('langEn')}</option>
                      </select>
                      <svg className="selectChevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
