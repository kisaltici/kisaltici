import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getPlanDisplayName, isPaidPlan } from '../utils/membership';
import { getClientLimits, GUEST_LIMITS } from '../config/plans';
import { hasUsedGuestLinkToday } from '../utils/shortenApi';
import { isMac } from '../utils/keyboardDefaults';
import './Sidebar.css';

/* Skeleton placeholders (no spinners) */
function HistorySkeleton() {
  return (
    <div className="sidebarSkeletonList" aria-hidden="true">
      {[78, 62, 88, 54].map((width, index) => (
        <div className="skeletonRow" key={index}>
          <span className="skeletonBar" style={{ width: `${width}%` }} />
        </div>
      ))}
    </div>
  );
}

function FooterSkeleton({ isCollapsed }) {
  return (
    <div className="sidebarProfileSkeleton" aria-hidden="true">
      <span className="skeletonCircle" />
      {!isCollapsed && (
        <span className="skeletonStack">
          <span className="skeletonBar" style={{ width: '70%' }} />
          <span className="skeletonBar short" style={{ width: '40%' }} />
        </span>
      )}
    </div>
  );
}

/* One quota row: used / limit with a thin bar that fills as the allowance is used */
function UsageRow({ label, used, limit }) {
  const safeUsed = Math.min(used, limit);
  const ratio = limit > 0 ? safeUsed / limit : 1;
  const state = ratio >= 1 ? 'full' : ratio >= 0.7 ? 'high' : 'ok';
  return (
    <div className="usageRow">
      <div className="usageRowText">
        <span className="usageLabel">{label}</span>
        <span className={`usageCount ${state}`}>
          {safeUsed}/{limit}
        </span>
      </div>
      <div className="usageTrack" role="progressbar" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={safeUsed} aria-label={label}>
        <span className={`usageFill ${state}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>
    </div>
  );
}

function Sidebar({
  historyList,
  isHistoryLoading,
  activeShortCode,
  onSelectLink,
  onNewLink,
  onRenameLink,
  onDeleteLink,
  onOpenSettings,
  onOpenProfile,
  onOpenHelp,
  onOpenPricing,
  onOpenAuthModal,
  isOpen,
  onCloseMobile,
  isCollapsed,
  onToggleSidebar,
  onOpenSearch,
  theme = 'dark',
  userPlan = 'free',
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    user,
    userProfile,
    profileDisplayName,
    profilePhotoURL,
    authLoading,
    authTransitioning,
    signInWithGoogle,
    signOutUser,
  } = useAuth();

  const isDark = theme === 'dark';
  const isAdminPlan = userPlan === 'admin';
  const limits = userProfile?.limits || getClientLimits(userPlan);
  const usage = userProfile?.usage || { links: 0, qr: 0 };
  const searchHint = isMac ? '⌘ /' : 'Ctrl /';
  const guestLinkUsed = hasUsedGuestLinkToday();

  const [editingCode, setEditingCode] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [openMenuCode, setOpenMenuCode] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const menuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    setAvatarError(false);
  }, [user]);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuCode(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartRename = (item, event) => {
    event.stopPropagation();
    setEditingCode(item.shortCode);
    setEditingTitle(item.title || item.shortCode);
    setOpenMenuCode(null);
  };

  const handleSaveRename = (shortCode, event) => {
    if (event) event.stopPropagation();
    if (editingTitle.trim()) {
      onRenameLink(shortCode, editingTitle.trim());
    }
    setEditingCode(null);
  };

  const handleDeleteItem = (shortCode, event) => {
    event.stopPropagation();
    setOpenMenuCode(null);
    onDeleteLink(shortCode);
  };

  const handleToggleMenu = (shortCode, event) => {
    event.stopPropagation();
    setOpenMenuCode((prev) => (prev === shortCode ? null : shortCode));
  };

  return (
    <>
      {/* Overlay backdrop for mobile drawer */}
      {isOpen && (
        <div
          className="sidebarBackdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${isOpen ? 'mobileOpen' : ''} ${
          isCollapsed ? 'collapsed' : ''
        }`}
      >
        {/* Brand row: logo + collapse toggle (desktop). On mobile the top bar provides these. */}
        <div className="sidebarBrandRow">
          {!isCollapsed && (
            <button
              type="button"
              className="sidebarBrand"
              onClick={() => navigate('/')}
              aria-label="Kısaltıcı"
            >
              <img
                src={isDark ? '/KSLT_LOGO_DARK.svg' : '/KSLT_LOGO_LIGHT.svg'}
                alt="Kısaltıcı"
                className="sidebarBrandImg"
              />
            </button>
          )}
          <button
            type="button"
            className="sidebarToggleBtn"
            onClick={onToggleSidebar}
            aria-label={isCollapsed ? t('toggleSidebarExpand') : t('toggleSidebarCollapse')}
            title={isCollapsed ? t('toggleSidebarExpand') : t('toggleSidebarCollapse')}
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
                transform: isCollapsed ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.25s ease',
              }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <path d="M15 9l-3 3 3 3" />
            </svg>
          </button>
        </div>

        {/* Primary actions */}
        <div className="sidebarHeader">
          <button
            type="button"
            className="newLinkBtn"
            onClick={() => {
              onNewLink();
              if (onCloseMobile) onCloseMobile();
            }}
            title={t('newLink')}
          >
            <svg
              className="plusSvg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {!isCollapsed && <span>{t('newLink')}</span>}
          </button>

          <button
            type="button"
            className="sidebarSearchBtn"
            onClick={() => {
              if (onOpenSearch) onOpenSearch();
              if (onCloseMobile) onCloseMobile();
            }}
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
            {!isCollapsed && (
              <>
                <span>{t('search')}</span>
                <kbd className="sidebarKbd">{searchHint}</kbd>
              </>
            )}
          </button>
        </div>

        {/* Sidebar Content (Link History - Hidden when collapsed) */}
        <div className="sidebarContent">
          {!isCollapsed && (
            <>
              <div className="historySectionHeader">
                <span className="historyTitle">{t('recentLinks')}</span>
                {user && !isHistoryLoading && <span className="historyCount">{historyList.length}</span>}
              </div>

              {authLoading || authTransitioning ? (
                <HistorySkeleton />
              ) : !user ? (
                <div
                  className="guestHistoryNoticeCard"
                  onClick={() => onOpenAuthModal ? onOpenAuthModal('login') : signInWithGoogle()}
                  role="button"
                  tabIndex={0}
                >
                  <svg
                    width="20"
                    height="20"
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
                  <span>{t('guestHistoryNotice')}</span>
                </div>
              ) : isHistoryLoading ? (
                <HistorySkeleton />
              ) : historyList.length === 0 ? (
                <div className="emptyHistoryMessage">
                  {t('noRecentLinks')}
                </div>
              ) : (
                <nav className="historyList">
                  {historyList.map((item) => {
                    const isActive = item.shortCode === activeShortCode;
                    const isEditing = editingCode === item.shortCode;
                    const isMenuOpen = openMenuCode === item.shortCode;

                    return (
                      <div
                        key={item.shortCode}
                        className={`historyItemRow ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          if (!isEditing) {
                            onSelectLink(item.shortCode);
                            if (onCloseMobile) onCloseMobile();
                          }
                        }}
                      >
                        {isEditing ? (
                          <div
                            className="inlineEditWrapper"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              className="inlineEditInput"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveRename(item.shortCode, e);
                                } else if (e.key === 'Escape') {
                                  setEditingCode(null);
                                }
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              className="saveRenameBtn"
                              onClick={(e) => handleSaveRename(item.shortCode, e)}
                              title={t('saveTitle')}
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <>
                            <span
                              className="historyItemTitle"
                              title={item.title}
                            >
                              {item.title}
                            </span>

                            <div className="historyItemMenuWrapper">
                              <button
                                type="button"
                                className="menuToggleBtn"
                                onClick={(e) =>
                                  handleToggleMenu(item.shortCode, e)
                                }
                                aria-label={t('moreOptions')}
                                title={t('moreOptions')}
                              >
                                ⋮
                              </button>

                              {isMenuOpen && (
                                <div className="menuDropdown" ref={menuRef}>
                                  <button
                                    type="button"
                                    className="menuOption"
                                    onClick={(e) =>
                                      handleStartRename(item, e)
                                    }
                                  >
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M12 20h9" />
                                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                    </svg>
                                    <span>{t('rename')}</span>
                                  </button>

                                  <button
                                    type="button"
                                    className="menuOption delete"
                                    onClick={(e) =>
                                      handleDeleteItem(item.shortCode, e)
                                    }
                                  >
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                    <span>{t('delete')}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </nav>
              )}
            </>
          )}
        </div>

        {/* Daily allowance (remaining links / QR codes) */}
        {!isCollapsed && !(authLoading || authTransitioning) && (
          <div className="sidebarUsage">
            {user && !userProfile ? (
              <div className="usageSkeleton" aria-hidden="true">
                <span className="skeletonBar" style={{ width: '45%' }} />
                <span className="skeletonBar" style={{ width: '100%', height: 6 }} />
                <span className="skeletonBar" style={{ width: '100%', height: 6 }} />
              </div>
            ) : user ? (
              isAdminPlan || limits.dailyLinks === null || limits.dailyQr === null ? (
                <div className="usageUnlimited">
                  <span className="usageTitle">{t('usageTitle')}</span>
                  <span className="usageUnlimitedValue">∞ {t('usageUnlimited')}</span>
                </div>
              ) : (
                <>
                  <div className="usageHead" title={t('usageResets')}>
                    <span className="usageTitle">{t('usageTitle')}</span>
                  </div>
                  <UsageRow label={t('usageLinks')} used={usage.links} limit={limits.dailyLinks} />
                  <UsageRow label={t('usageQr')} used={usage.qr} limit={limits.dailyQr} />
                </>
              )
            ) : (
              <>
                <div className="usageHead">
                  <span className="usageTitle">{t('usageGuestTitle')}</span>
                </div>
                <UsageRow
                  label={t('usageLinks')}
                  used={guestLinkUsed ? GUEST_LIMITS.dailyLinks : 0}
                  limit={GUEST_LIMITS.dailyLinks}
                />
                <p className="usageHint">{t('usageGuestHint')}</p>
              </>
            )}
          </div>
        )}

        {/* Sidebar Bottom ChatGPT-style Profile Section */}
        <div className="sidebarFooter" ref={userMenuRef}>
          {authLoading || authTransitioning ? (
            <FooterSkeleton isCollapsed={isCollapsed} />
          ) : user ? (
            <div className="sidebarProfileWrapper">
              <div
                className="sidebarProfileCard"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                role="button"
                tabIndex={0}
              >
                {/* Profile Avatar */}
                <div
                  className={`sidebarProfileAvatar ${
                    isPaidPlan(userPlan) ? 'paidAvatar' : ''
                  }`}
                >
                  {profilePhotoURL && !avatarError ? (
                    <img
                      src={profilePhotoURL}
                      alt={profileDisplayName || 'Profile'}
                      className="sidebarAvatarImg"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="sidebarAvatarFallback">
                      {(profileDisplayName || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Name, Membership & Upgrade Button (Shown only when expanded) */}
                {!isCollapsed && (
                  <>
                    <div className="sidebarProfileDetails">
                      <span className="sidebarProfileName" title={profileDisplayName || user.email}>
                        {profileDisplayName || user.email}
                      </span>
                      <span
                        className={`sidebarProfilePlan ${
                          isPaidPlan(userPlan) ? 'paid' : ''
                        }`}
                      >
                        {getPlanDisplayName(userPlan, t)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="sidebarUpgradeBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsUserMenuOpen(false);
                        if (onOpenPricing) onOpenPricing();
                      }}
                      title={t('upgrade')}
                    >
                      {t('upgrade')}
                    </button>
                  </>
                )}
              </div>

              {/* Profile Menu Popover (6 Items) */}
              {isUserMenuOpen && (
                <div className="sidebarProfileDropdown" role="menu">
                  {/* 1. Planı yükselt */}
                  <button
                    type="button"
                    className="sidebarDropdownItem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
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

                  {/* 2. Kişiselleştirme */}
                  <button
                    type="button"
                    className="sidebarDropdownItem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (onOpenSettings) onOpenSettings('personalization');
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
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8s1.5.67 1.5 1.5S7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                    </svg>
                    <span>{t('personalization')}</span>
                  </button>

                  {/* 3. Profil */}
                  <button
                    type="button"
                    className="sidebarDropdownItem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
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

                  {/* 4. Ayarlar */}
                  <button
                    type="button"
                    className="sidebarDropdownItem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (onOpenSettings) onOpenSettings('general');
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

                  {/* 5. Yardım */}
                  <button
                    type="button"
                    className="sidebarDropdownItem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (onOpenHelp) onOpenHelp();
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
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>{t('help')}</span>
                  </button>

                  <div className="sidebarDropdownDivider" />

                  {/* 6. Oturumu kapat */}
                  <button
                    type="button"
                    className="sidebarDropdownItem logout"
                    onClick={() => {
                      setIsUserMenuOpen(false);
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
            <div className="sidebarGuestNavList">
              {/* 1. Planlara ve ücretlere göz at */}
              <button
                type="button"
                className="sidebarNavItem"
                onClick={() => {
                  if (onOpenPricing) onOpenPricing();
                  if (onCloseMobile) onCloseMobile();
                }}
                title={t('viewPlansAndPricing')}
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
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {!isCollapsed && <span>{t('viewPlansAndPricing')}</span>}
              </button>

              {/* 2. Ayarlar */}
              <button
                type="button"
                className="sidebarNavItem"
                onClick={() => {
                  if (onOpenSettings) onOpenSettings();
                  if (onCloseMobile) onCloseMobile();
                }}
                title={t('settings')}
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
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                {!isCollapsed && <span>{t('settings')}</span>}
              </button>

              {/* 3. Yardım */}
              <button
                type="button"
                className="sidebarNavItem"
                onClick={() => {
                  if (onOpenHelp) onOpenHelp();
                  if (onCloseMobile) onCloseMobile();
                }}
                title={t('help')}
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
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                {!isCollapsed && <span>{t('help')}</span>}
              </button>

              {/* 4. Ücretsiz kaydol */}
              {!isCollapsed && (
                <button
                  type="button"
                  className="sidebarSignUpBtn"
                  onClick={() => onOpenAuthModal && onOpenAuthModal('register')}
                  disabled={authLoading}
                >
                  {t('signUpFree')}
                </button>
              )}

              {/* 5. Oturum Aç */}
              <button
                type="button"
                className="sidebarNavItem sidebarSignInBtn"
                onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                disabled={authLoading}
                title={t('signIn')}
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
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                {!isCollapsed && <span>{t('signIn')}</span>}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
