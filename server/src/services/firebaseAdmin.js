import admin from 'firebase-admin';
import fs from 'fs';

let firebaseApp = null;

/**
 * Initializes and returns the Firebase Admin SDK singleton.
 * Configured via FIREBASE_SERVICE_ACCOUNT (raw JSON string or file path).
 */
export function getFirebaseAdmin() {
  if (firebaseApp) return firebaseApp;

  const rawConfig = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!rawConfig || rawConfig.trim() === '') {
    console.warn('[Firebase Admin] FIREBASE_SERVICE_ACCOUNT is not set in environment.');
    return null;
  }

  try {
    let credentialObj;
    const trimmed = rawConfig.trim();

    if (trimmed.startsWith('{')) {
      credentialObj = JSON.parse(trimmed);
    } else {
      // Treat as path to service account key file
      const fileData = fs.readFileSync(trimmed, 'utf8');
      credentialObj = JSON.parse(fileData);
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(credentialObj),
    });

    console.log('[Firebase Admin] Initialized successfully for project:', credentialObj.project_id);
    return firebaseApp;
  } catch (err) {
    console.error('[Firebase Admin] Initialization failed:', err.message);
    return null;
  }
}

export default admin;
