import admin from 'firebase-admin';

let isAdminInitialized = false;

/**
 * Initializes Firebase Admin SDK using environment variables.
 * Minimum required env vars:
 * - FIREBASE_PROJECT_ID (e.g. kisaltici-d0848)
 * - FIREBASE_CLIENT_EMAIL (optional for service account)
 * - FIREBASE_PRIVATE_KEY (optional for service account)
 */
export const initializeFirebaseAdmin = () => {
  if (isAdminInitialized || admin.apps.length > 0) {
    isAdminInitialized = true;
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'kisaltici-d0848';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  try {
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log(`Firebase Admin initialized with Service Account for project: ${projectId}`);
    } else {
      // Initialize with default app config for ID Token verification via Google Public Keys
      admin.initializeApp({
        projectId,
      });
      console.log(`Firebase Admin initialized in project mode for: ${projectId}`);
    }

    isAdminInitialized = true;
  } catch (error) {
    console.error('Firebase Admin initialization error:', error.message);
  }

  return admin;
};

/**
 * Verifies a Firebase Auth ID token sent from the client.
 * Returns decoded token object on success, or null on failure.
 *
 * @param {string} idToken
 * @returns {Promise<import('firebase-admin/auth').DecodedIdToken | null>}
 */
export const verifyFirebaseToken = async (idToken) => {
  if (!idToken || typeof idToken !== 'string') return null;

  try {
    if (!isAdminInitialized && admin.apps.length === 0) {
      initializeFirebaseAdmin();
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    return null;
  }
};

export default admin;
