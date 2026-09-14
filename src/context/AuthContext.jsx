import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext(null);

export function getAuthErrorMessage(errorOrCode, lang = 'tr') {
  let code = '';
  if (typeof errorOrCode === 'string') {
    code = errorOrCode;
  } else if (errorOrCode && typeof errorOrCode.code === 'string') {
    code = errorOrCode.code;
  }

  const isEn = lang === 'en';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return isEn ? 'Invalid email or password.' : 'E-posta veya şifre yanlış.';
    case 'auth/too-many-requests':
      return isEn
        ? 'Too many failed attempts. Please try again later.'
        : 'Çok fazla başarısız deneme yapıldı. Lütfen biraz sonra tekrar deneyin.';
    case 'auth/user-disabled':
      return isEn ? 'This account has been disabled.' : 'Bu hesap devre dışı bırakılmış.';
    case 'auth/invalid-email':
      return isEn ? 'Please enter a valid email address.' : 'Geçerli bir e-posta adresi girin.';
    case 'auth/email-already-in-use':
      return isEn
        ? 'An account already exists with this email address.'
        : 'Bu e-posta adresiyle zaten bir hesap bulunuyor.';
    case 'auth/weak-password':
      return isEn
        ? 'Your password is too weak. Please choose a stronger password.'
        : 'Şifreniz çok zayıf. Daha güçlü bir şifre seçin.';
    case 'auth/operation-not-allowed':
      return isEn
        ? 'Email and password sign-in is currently unavailable. Please try again later.'
        : 'E-posta ve şifre ile giriş şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
    case 'auth/popup-closed-by-user':
      return isEn ? 'Sign-in popup was closed.' : 'Giriş penceresi kapatıldı.';
    case 'auth/network-request-failed':
      return isEn
        ? 'Network request failed. Please check your internet connection.'
        : 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';
    default:
      return isEn
        ? 'Something went wrong. Please try again.'
        : 'Bir sorun oluştu. Lütfen tekrar deneyin.';
  }
}

export function getTurkishAuthErrorMessage(errorOrCode) {
  return getAuthErrorMessage(errorOrCode, 'tr');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authTransitioning, setAuthTransitioning] = useState(false);
  const [authError, setAuthError] = useState(null);

  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // In-flight and fetched UID tracking to prevent duplicate / concurrent requests
  const fetchedProfileUidRef = useRef(null);
  const fetchingProfileUidRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
        setAuthTransitioning(false);
      },
      (error) => {
        console.error('Firebase Auth state change error:', error);
        setAuthError(getAuthErrorMessage(error));
        setAuthLoading(false);
        setAuthTransitioning(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getIdToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken();
    } catch (e) {
      console.error('Failed to get Firebase ID token:', e);
      return null;
    }
  }, []);

  const signInWithEmail = async (email, password) => {
    setAuthError(null);
    setAuthTransitioning(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Email Sign-In Error:', error);
      const friendlyMsg = getAuthErrorMessage(error);
      setAuthError(friendlyMsg);
      return { success: false, error: friendlyMsg, code: error.code };
    } finally {
      setAuthTransitioning(false);
    }
  };

  const signUpWithEmail = async (email, password) => {
    setAuthError(null);
    setAuthTransitioning(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Email Sign-Up Error:', error);
      const friendlyMsg = getAuthErrorMessage(error);
      setAuthError(friendlyMsg);
      return { success: false, error: friendlyMsg, code: error.code };
    } finally {
      setAuthTransitioning(false);
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    setAuthTransitioning(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        const friendlyMsg = getAuthErrorMessage(error);
        setAuthError(friendlyMsg);
        return { success: false, error: friendlyMsg, code: error.code };
      }
      const closeMsg = getAuthErrorMessage('auth/popup-closed-by-user');
      return { success: false, error: closeMsg, code: error.code };
    } finally {
      setAuthTransitioning(false);
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    setAuthTransitioning(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setProfileError(null);
      fetchedProfileUidRef.current = null;
      fetchingProfileUidRef.current = null;
    } catch (error) {
      console.error('Sign-Out Error:', error);
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthTransitioning(false);
    }
  };

  const clearAuthError = useCallback(() => setAuthError(null), []);

  // Fetch or sync userProfile from API / localStorage when authenticated user changes
  const fetchProfile = useCallback(async (forced = false) => {
    if (!user) {
      setUserProfile(null);
      setProfileLoading(false);
      return;
    }

    const currentUid = user.uid;

    // Avoid duplicate / redundant fetches unless forced
    if (!forced) {
      if (
        fetchedProfileUidRef.current === currentUid ||
        fetchingProfileUidRef.current === currentUid
      ) {
        return;
      }
    }

    fetchingProfileUidRef.current = currentUid;
    setProfileLoading(true);

    try {
      const token = await getIdToken();
      if (!token) {
        setProfileLoading(false);
        fetchingProfileUidRef.current = null;
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (res.status === 503 || data?.code === 'DATABASE_UNAVAILABLE') {
        // Database is temporarily unavailable; record error without breaking auth
        setProfileError('DATABASE_UNAVAILABLE');
      } else if (res.ok && data?.success && data.profile) {
        setUserProfile(data.profile);
        setProfileError(null);
        fetchedProfileUidRef.current = currentUid;
        try {
          localStorage.setItem(
            `userCustomProfile:${currentUid}`,
            JSON.stringify(data.profile)
          );
        } catch (e) {
          console.error('Failed to save cached profile:', e);
        }
      } else {
        setProfileError(data?.error || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setProfileError('Sunucu şu anda veritabanına bağlanamıyor. Lütfen biraz sonra tekrar deneyin.');
    } finally {
      setProfileLoading(false);
      fetchingProfileUidRef.current = null;
    }
  }, [user, getIdToken]);

  // Synchronize profile on login
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setProfileLoading(false);
      setProfileError(null);
      fetchedProfileUidRef.current = null;
      fetchingProfileUidRef.current = null;
      return;
    }

    // Load local cached profile instantly for zero flash
    try {
      const cached = localStorage.getItem(`userCustomProfile:${user.uid}`);
      if (cached) {
        setUserProfile(JSON.parse(cached));
      }
    } catch (e) {
      // Ignore cache parse error
    }

    // Trigger profile fetch once
    fetchProfile(false);
  }, [user?.uid, fetchProfile]);

  const updateUserProfileData = async (newFields) => {
    if (!user) return { success: false, error: 'User not signed in' };

    try {
      const token = await getIdToken();
      if (!token) return { success: false, error: 'Authentication token missing' };

      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newFields),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 503 || data?.code === 'DATABASE_UNAVAILABLE') {
        return {
          success: false,
          error: 'Sunucu şu anda veritabanına bağlanamıyor. Lütfen biraz sonra tekrar deneyin.',
        };
      }

      if (!res.ok || !data?.success) {
        return { success: false, error: data?.error || 'Failed to update profile' };
      }

      setUserProfile(data.profile);
      setProfileError(null);
      try {
        localStorage.setItem(
          `userCustomProfile:${user.uid}`,
          JSON.stringify(data.profile)
        );
      } catch (e) {
        console.error('Failed to update cached profile:', e);
      }

      return { success: true, profile: data.profile };
    } catch (err) {
      console.error('Update profile error:', err);
      return { success: false, error: 'Sunucu şu anda veritabanına bağlanamıyor. Lütfen biraz sonra tekrar deneyin.' };
    }
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    userProfile,
    profileDisplayName: userProfile?.displayName || user?.displayName || user?.email || '',
    profileUsername: userProfile?.username || '',
    profilePhotoURL: userProfile?.photoURL || user?.photoURL || '',
    membershipPlan: userProfile?.membershipPlan || 'free',
    authLoading,
    loading: authLoading, // backwards compatibility
    profileLoading,
    profileError,
    authTransitioning,
    authError,
    getIdToken,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOutUser,
    updateUserProfileData,
    refetchProfile: () => fetchProfile(true),
    clearAuthError,
  }), [
    user,
    userProfile,
    authLoading,
    profileLoading,
    profileError,
    authTransitioning,
    authError,
    getIdToken,
    fetchProfile,
    clearAuthError,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
