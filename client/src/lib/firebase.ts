import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Check if Firebase is configured
export const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;

// Validate environment variables in production
const validateConfig = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID'
  ];

  if (import.meta.env.PROD) {
    const missing = requiredVars.filter(key => !import.meta.env[key]);
    if (missing.length > 0) {
      console.warn('Missing Firebase environment variables:', missing);
      console.warn('Authentication features will be disabled.');
    }
  }
};

validateConfig();

// Removed redundant warnings - only show in validateConfig if in production

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "placeholder-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dapsiwow.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dapsiwow",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dapsiwow.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "215234393623",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:215234393623:web:aae78956496745b0de0e52",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4ZFMB2DZPK"
};

// Initialize Firebase only if configured
let app;
let auth: ReturnType<typeof getAuth> | undefined;
let db: ReturnType<typeof getFirestore> | undefined;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Disable app verification ONLY in true local development
  // This is safe because it checks both DEV mode AND localhost/replit domains
  const isLocalDev = import.meta.env.DEV && (
    typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname.includes('replit.dev')
    )
  );
  
  if (isLocalDev && auth && isFirebaseConfigured) {
    (auth as any).settings.appVerificationDisabledForTesting = true;
    console.log('Firebase initialized in development mode');
    console.log('Auth domain:', firebaseConfig.authDomain);
    console.log('Authentication: enabled');
    console.log('App verification disabled for local development');
  } else if (import.meta.env.DEV && auth && isFirebaseConfigured) {
    console.log('Firebase initialized in development mode');
    console.log('Auth domain:', firebaseConfig.authDomain);
    console.log('Authentication: enabled');
  }
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  console.warn('App will run without authentication features.');
}

export { auth, db }