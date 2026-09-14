import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getAccountProviderLabel } from '../utils/authHelpers';
import './ProfileModal.css';

// Preset avatar options for instant selection
const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=KSLT1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=KSLT2',
  'https://api.dicebear.com/7.x/bottts/svg?seed=KSLT3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=KSLT4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=KSLT5',
];

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

function ProfileModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const {
    user,
    userProfile,
    profileDisplayName,
    profileUsername,
    profilePhotoURL,
    updateUserProfileData,
  } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [initialUsername, setInitialUsername] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const fileInputRef = useRef(null);

  const [isMounted, setIsMounted] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  // Sync state when modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      const currentUsername = profileUsername || '';
      setDisplayName(profileDisplayName || '');
      setUsername(currentUsername);
      setInitialUsername(currentUsername);
      setPhotoURL(profilePhotoURL || '');
      setErrorMessage('');
      setShowAvatarPicker(false);
      setAvatarError(false);
      setIsSaving(false);
    }
  }, [isOpen, profileDisplayName, profileUsername, profilePhotoURL]);

  // Entrance/Exit Animation
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

  if (!isMounted) return null;

  // Real-time username format validation
  const getUsernameValidation = (val, initialVal) => {
    if (!val || !val.trim()) {
      return { isValid: true, isFilled: false, message: '' };
    }
    const trimmed = val.trim().toLowerCase();
    const initialTrimmed = (initialVal || '').trim().toLowerCase();

    if (!USERNAME_REGEX.test(trimmed)) {
      return {
        isValid: false,
        isFilled: true,
        message: t('usernameFormatHint') || '3-20 karakter, harf, rakam veya _ kullanın',
      };
    }

    // If username is valid and matches the saved baseline, don't show validation success hint
    if (trimmed === initialTrimmed) {
      return { isValid: true, isFilled: false, message: '' };
    }

    return {
      isValid: true,
      isFilled: true,
      message: t('usernameValid') || '✓ Kullanıcı adı kullanılabilir',
    };
  };

  const usernameValidation = getUsernameValidation(username, initialUsername);

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(t('errorInvalidImage') || 'Lütfen geçerli bir resim dosyası seçin.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage(t('errorImageTooLarge') || 'Profil fotoğrafı en fazla 2 MB olabilir.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setPhotoURL(uploadEvent.target.result);
      setAvatarError(false);
      setShowAvatarPicker(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    // Validate username if filled
    if (username.trim().length > 0 && !USERNAME_REGEX.test(username.trim().toLowerCase())) {
      setErrorMessage(t('usernameInvalid') || 'Kullanıcı adı geçersiz.');
      return;
    }

    setErrorMessage('');
    setIsSaving(true);

    const savedUsername = username.trim().toLowerCase();

    const result = await updateUserProfileData({
      displayName: displayName.trim(),
      username: savedUsername,
      photoURL: photoURL,
    });

    setIsSaving(false);

    if (result.success) {
      setInitialUsername(savedUsername);
      onClose();
    } else {
      setErrorMessage(result.error || t('errorGeneric'));
    }
  };

  return (
    <div
      className={`profileModalBackdrop ${isAnimatingIn ? 'visible' : ''}`}
      onClick={onClose}
    >
      <div
        className={`profileModalBox ${isAnimatingIn ? 'visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Header */}
        <div className="profileModalHeader">
          <h2 id="profile-modal-title" className="profileModalTitle">
            {t('profile')}
          </h2>
          <button
            type="button"
            className="profileCloseBtn"
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

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="profileModalBody">
          {errorMessage && (
            <div className="profileErrorCard">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Profile Photo Section */}
          <div className="profileAvatarSection">
            <div className="profileAvatarWrapper">
              {photoURL && !avatarError ? (
                <img
                  src={photoURL}
                  alt={displayName || 'Avatar'}
                  className="profileAvatarImg"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="profileAvatarFallback">
                  {(displayName || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="profileAvatarActions">
              <button
                type="button"
                className="changePhotoBtn"
                onClick={() => setShowAvatarPicker((prev) => !prev)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>{t('changeProfilePhoto')}</span>
              </button>
            </div>

            {/* Avatar Selector Picker Popover */}
            {showAvatarPicker && (
              <div className="avatarPickerBox">
                <span className="avatarPickerTitle">{t('presetAvatars') || 'Varsayılan Avatarlar'}</span>
                <div className="presetAvatarRow">
                  {PRESET_AVATARS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Avatar preset ${idx + 1}`}
                      className={`presetAvatarThumb ${photoURL === url ? 'selected' : ''}`}
                      onClick={() => {
                        setPhotoURL(url);
                        setAvatarError(false);
                        setShowAvatarPicker(false);
                      }}
                    />
                  ))}
                </div>
                <div className="avatarUploadRow">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    className="uploadAvatarBtn"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    {t('uploadCustomPhoto') || 'Bilgisayardan Fotoğraf Yükle'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Full Name Field */}
          <div className="profileFieldGroup">
            <label htmlFor="profile-display-name" className="profileFieldLabel">
              {t('fullNameLabel') || 'Ad Soyad'}
            </label>
            <input
              id="profile-display-name"
              type="text"
              className="profileInput"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('userNamePlaceholder') || 'İsim Soyisim'}
            />
          </div>

          {/* Username Field */}
          <div className="profileFieldGroup">
            <label htmlFor="profile-username" className="profileFieldLabel">
              {t('usernameLabel') || 'Kullanıcı adı'}
            </label>
            <div className="usernameInputWrapper">
              <span className="usernamePrefix">@</span>
              <input
                id="profile-username"
                type="text"
                className="profileInput username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="kullanici_adi"
              />
            </div>

            {usernameValidation.isFilled && (
              <span
                className={`usernameHint ${
                  usernameValidation.isValid ? 'valid' : 'invalid'
                }`}
              >
                {usernameValidation.message}
              </span>
            )}
          </div>

          {/* Account Email (Read-Only Info) */}
          <div className="profileFieldGroup">
            <label className="profileFieldLabel">{t('account')}</label>
            <div className="profileStaticValue">
              <span>{user?.email}</span>
              <span className="profileBadge">{getAccountProviderLabel(user, t)}</span>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="profileModalFooter">
            <button
              type="button"
              className="profileCancelBtn"
              onClick={onClose}
              disabled={isSaving}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="profileSaveBtn"
              disabled={isSaving}
            >
              {isSaving ? t('saving') || 'Kaydediliyor...' : t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;
