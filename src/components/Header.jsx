import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { isPaidPlan } from '../utils/membership';
import { API_BASE_URL } from '../config/api';
import './Header.css';

function Header({
  theme,
  onToggleTheme,
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenSearch,
  onOpenSettings,
  onOpenProfile,
  onOpenHelp,
  onOpenPricing,
  onOpenAuthModal,
  userPlan = 'free',
}) {
  const { t } = useTranslation();
  const {
    user,
    profileDisplayName,
    profilePhotoURL,
    authLoading,
    authTransitioning,
    authError,
    signInWithGoogle,
    signOutUser,
    clearAuthError,
  } = useAuth();
  const [backendStatus, setBackendStatus] = useState('checking');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef(null);
  const navigate = useNavigate();

  const isAuthInitializing = authLoading || authTransitioning;

  useEffect(() => {
    setAvatarError(false);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setIsAvatarMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Check connection to backend health endpoint
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (!isMounted) return;
        if (response.ok) {
          const data = await response.json();
          setBackendStatus(data.status === 'ok' ? 'online' : 'error');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        if (isMounted) setBackendStatus('offline');
      }
    };

    checkBackendHealth();

    // Re-check periodically every 10 seconds to recover if backend starts or restarts
    const interval = setInterval(checkBackendHealth, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleGoogleAuth = async () => {
    if (isSigningIn || authLoading) return;
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error('Sign-in error:', e);
    } finally {
      setIsSigningIn(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <header className="header">
      <div className="headerContainer">
        {/* LEFT GROUP: [ Logo ] [ Sidebar Toggle ] [ Search ] */}
        <div className="headerLeft">
          {/* Logo */}
          <div
            className="logo"
            onClick={() => navigate('/')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') navigate('/');
            }}
            title="KSLT"
          >
            <img
              src={isDark ? '/KSLT_LOGO_DARK.svg' : '/KSLT_LOGO_LIGHT.svg'}
              alt="KSLT"
              className="brandLogoImg"
            />
          </div>

          {/* Sidebar Expand/Collapse Toggle */}
          <button
            type="button"
            className="headerControlBtn sidebarToggleHeaderBtn"
            onClick={onToggleSidebar}
            aria-label={
              isSidebarCollapsed
                ? t('toggleSidebarExpand')
                : t('toggleSidebarCollapse')
            }
            title={
              isSidebarCollapsed
                ? t('toggleSidebarExpand')
                : t('toggleSidebarCollapse')
            }
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: isSidebarCollapsed ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <path d="M15 9l-3 3 3 3" />
            </svg>
          </button>

          {/* Search Button */}
          <button
            type="button"
            className="headerControlBtn searchHeaderBtn"
            onClick={onOpenSearch}
            aria-label={t('search')}
            title={t('search')}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        {/* RIGHT GROUP: [ API Status ] [ Theme Switch (Guest only) ] [ Auth Controls ] */}
        <div className="headerRight">
          {/* API Status Badge */}
          <div className="backendBadge" title={t('apiStatusOnline')}>
            <span className={`statusDot ${backendStatus}`}></span>
            <span className="statusText">
              {backendStatus === 'online'
                ? t('apiStatusOnline')
                : backendStatus === 'checking'
                ? t('apiStatusChecking')
                : t('apiStatusOffline')}
            </span>
          </div>

          {isAuthInitializing ? (
            <div className="headerAuthLoading">
              <span className="headerAuthSpinner" />
            </div>
          ) : (
            <div className="headerAuthContainer">
                {user ? (
                  <div className="headerAvatarWrapper" ref={avatarMenuRef}>
                    <button
                      type="button"
                      className={`headerAvatarBtn ${
                        isPaidPlan(userPlan) ? 'paidAvatar' : ''
                      }`}
                      onClick={() => setIsAvatarMenuOpen((prev) => !prev)}
                      aria-label={t('account')}
                      title={profileDisplayName || user.email || t('account')}
                    >
                      {profilePhotoURL && !avatarError ? (
                        <img
                          src={profilePhotoURL}
                          alt={profileDisplayName || 'Profile'}
                          className="headerAvatarImg"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <div className="headerAvatarFallback">
                          {(profileDisplayName || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </button>

                    {isAvatarMenuOpen && (
                      <div className="headerAvatarDropdown" role="menu">
                        {/* 1. Profil */}
                        <button
                          type="button"
                          className="headerDropdownItem"
                          onClick={() => {
                            setIsAvatarMenuOpen(false);
                            if (onOpenProfile) onOpenProfile();
                          }}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <span>{t('profile')}</span>
                        </button>

                        {/* 2. Planı yükselt */}
                        <button
                          type="button"
                          className="headerDropdownItem"
                          onClick={() => {
                            setIsAvatarMenuOpen(false);
                            if (onOpenPricing) onOpenPricing();
                          }}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span>{t('upgradePlan')}</span>
                        </button>

                        {/* 3. Ayarlar */}
                        <button
                          type="button"
                          className="headerDropdownItem"
                          onClick={() => {
                            setIsAvatarMenuOpen(false);
                            if (onOpenSettings) onOpenSettings();
                          }}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                          <span>{t('settings')}</span>
                        </button>

                        <div className="headerDropdownDivider" />

                        {/* 4. Theme switch */}
                        <div
                          className="headerDropdownItem themeToggleRow"
                          onClick={() => onToggleTheme()}
                          role="button"
                          tabIndex={0}
                        >
                          <span className="themeToggleText">
                            {isDark ? t('darkMode') : t('lightMode')}
                          </span>
                          <button
                            type="button"
                            className={`themePillToggle ${isDark ? 'dark' : 'light'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTheme();
                            }}
                            aria-label="Toggle theme"
                          >
                            <span className="pillSlider" />
                            <span className="pillIcon sun" aria-hidden="true">
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                              </svg>
                            </span>
                            <span className="pillIcon moon" aria-hidden="true">
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                              </svg>
                            </span>
                          </button>
                        </div>

                        <div className="headerDropdownDivider" />

                        {/* 5. Oturumu kapat */}
                        <button
                          type="button"
                          className="headerDropdownItem logout"
                          onClick={() => {
                            setIsAvatarMenuOpen(false);
                            signOutUser();
                          }}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          <span>{t('signOut')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="authGuestBtn signInBtn"
                      onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                      disabled={authLoading}
                    >
                      {t('signIn')}
                    </button>
                    <button
                      type="button"
                      className="authGuestBtn signUpBtn"
                      onClick={() => onOpenAuthModal && onOpenAuthModal('register')}
                      disabled={authLoading}
                    >
                      {t('signUpFree')}
                    </button>
                  </>
                )}
              </div>
          )}

          {/* Auth Error Notification Badge */}
          {authError && (
            <div className="headerAuthErrorBadge" role="alert">
              <span>{authError}</span>
              <button
                type="button"
                className="headerAuthErrorCloseBtn"
                onClick={clearAuthError}
                aria-label="Close error"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
