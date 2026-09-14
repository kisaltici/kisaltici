import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth, getAuthErrorMessage } from '../context/AuthContext';
import './AuthModal.css';

function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { t, lang } = useTranslation();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, authError, clearAuthError } = useAuth();

  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [isMounted, setIsMounted] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  // Sync mode and reset fields when modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFormError('');
      setIsSubmitting(false);
      clearAuthError();
    }
  }, [isOpen, initialMode]);

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

  const isRegister = mode === 'register';

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setFormError('');
    clearAuthError();
  };

  const validateForm = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return t('errorEnterEmail');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return t('errorInvalidEmail');
    }

    if (!password) {
      return t('errorEnterPassword');
    }

    if (isRegister) {
      if (password.length < 6) {
        return t('errorWeakPassword');
      }

      if (password !== confirmPassword) {
        return t('errorPasswordMismatch');
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      let result;
      if (isRegister) {
        result = await signUpWithEmail(email.trim(), password);
      } else {
        result = await signInWithEmail(email.trim(), password);
      }

      if (result && result.success) {
        onClose();
      } else {
        const friendlyMsg = result?.code
          ? getAuthErrorMessage(result.code, lang)
          : (result?.error || t('errorGeneric'));
        setFormError(friendlyMsg);
      }
    } catch (err) {
      console.error('Auth submit error:', err);
      setFormError(getAuthErrorMessage(err, lang));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSubmitting) return;
    setFormError('');
    setIsSubmitting(true);

    try {
      const result = await signInWithGoogle();
      if (result && result.success) {
        onClose();
      } else if (result && result.error && result.code !== 'auth/popup-closed-by-user') {
        const friendlyMsg = getAuthErrorMessage(result.code, lang);
        setFormError(friendlyMsg);
      }
    } catch (err) {
      console.error('Google Sign-In error:', err);
      setFormError(getAuthErrorMessage(err, lang));
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = formError || authError;

  return (
    <div
      className={`authModalBackdrop ${isAnimatingIn ? 'visible' : ''}`}
      onClick={onClose}
    >
      <div
        className={`authModalBox ${isAnimatingIn ? 'visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Modal Header */}
        <div className="authModalHeader">
          <h2 id="auth-modal-title" className="authModalTitle">
            {isRegister ? t('signUpBtn') || 'Ücretsiz Kaydol' : t('signInBtn') || 'Oturum Aç'}
          </h2>
          <button
            type="button"
            className="authCloseBtn"
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

        {/* Modal Content Form */}
        <form onSubmit={handleSubmit} className="authModalBody">
          {activeError && (
            <div className="authErrorCard">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{activeError}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="authFieldGroup">
            <label htmlFor="auth-email" className="authFieldLabel">
              {t('emailLabel')}
            </label>
            <div className="authInputWrapper">
              <svg className="authFieldIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="auth-email"
                type="email"
                className="authInput"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="authFieldGroup">
            <label htmlFor="auth-password" className="authFieldLabel">
              {t('passwordLabel')}
            </label>
            <div className="authInputWrapper">
              <svg className="authFieldIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="auth-password"
                type="password"
                className="authInput"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                required
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          {/* Confirm Password Field (Register Mode Only) */}
          {isRegister && (
            <div className="authFieldGroup">
              <label htmlFor="auth-confirm-password" className="authFieldLabel">
                {t('confirmPasswordLabel')}
              </label>
              <div className="authInputWrapper">
                <svg className="authFieldIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="auth-confirm-password"
                  type="password"
                  className="authInput"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            className="authPrimaryBtn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="authBtnSpinner" />
            ) : isRegister ? (
              t('signUpBtn')
            ) : (
              t('signInBtn')
            )}
          </button>

          {/* Divider */}
          <div className="authDivider">
            <span>{t('or')}</span>
          </div>

          {/* Google Sign-In Alternative */}
          <button
            type="button"
            className="authGoogleBtn"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
          >
            <svg className="googleIcon" width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t('continueWithGoogle')}</span>
          </button>

          {/* Mode Switcher Footer */}
          <div className="authModeSwitchRow">
            {isRegister ? (
              <span>
                {t('alreadyHaveAccount')}{' '}
                <button
                  type="button"
                  className="authSwitchLink"
                  onClick={() => handleSwitchMode('login')}
                >
                  {t('signInAction')}
                </button>
              </span>
            ) : (
              <span>
                {t('dontHaveAccount')}{' '}
                <button
                  type="button"
                  className="authSwitchLink"
                  onClick={() => handleSwitchMode('register')}
                >
                  {t('signUpAction')}
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
