import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCj7hEKHbfpd4PKvt4ohvOo4OcrDBNbysE",
  authDomain: import.meta.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dapsiwow.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dapsiwow",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dapsiwow.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "215234393623",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:215234393623:web:aae78956496745b0de0e52",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4ZFMB2DZPK"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);