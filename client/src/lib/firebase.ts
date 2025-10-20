import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

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
      console.error('Missing Firebase environment variables:', missing);
    }
  }
};

validateConfig();

if (!import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.PROD) {
  console.error('CRITICAL: VITE_FIREBASE_API_KEY is not set in production environment!');
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dapsiwow.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dapsiwow",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dapsiwow.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "215234393623",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:215234393623:web:aee78956496745b0de0e52",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4ZFMB2DZPK"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Log Firebase initialization status
if (import.meta.env.DEV) {
  console.log('Firebase initialized in development mode');
  console.log('Auth domain:', firebaseConfig.authDomain);
}