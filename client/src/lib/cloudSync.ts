import { db, auth, isFirebaseConfigured, isOnline } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  getDocs,
  Timestamp
} from 'firebase/firestore';

export interface FavoriteTool {
  id: string;
  categoryId?: string;
  [key: string]: any;
}

export interface FavoriteCategory {
  id: string;
  name: string;
}

export interface CloudPreset {
  id: string;
  name: string;
  values: Record<string, any>;
  createdAt: number;
}

export interface PinnedTool {
  id: string;
  name: string;
  url: string;
}

export interface UserPreferences {
  favorites?: FavoriteTool[];
  categories?: FavoriteCategory[];
  presets?: Record<string, CloudPreset[]>;
  pinnedTools?: PinnedTool[];
  updatedAt?: Timestamp;
}

const PREFERENCES_COLLECTION = 'userPreferences';
const OFFLINE_PREFS_QUEUE_KEY = 'dapsiwow_offline_prefs_queue';

function addToPrefsQueue(data: Partial<UserPreferences>) {
  try {
    localStorage.setItem(OFFLINE_PREFS_QUEUE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Failed to add to prefs queue:', e);
  }
}

export async function processOfflinePrefsQueue(userId: string) {
  if (!isOnline() || !isFirebaseConfigured || !db || !userId) return;

  const queued = localStorage.getItem(OFFLINE_PREFS_QUEUE_KEY);
  if (!queued) return;

  try {
    const { data } = JSON.parse(queued);
    await syncPreferencesToCloud(userId, data);
    localStorage.removeItem(OFFLINE_PREFS_QUEUE_KEY);
    console.log('Offline preferences synced successfully');
  } catch (e) {
    console.error('Failed to sync offline preferences:', e);
  }
}

/**
 * Sync user preferences to Firebase Firestore
 * Automatically merges with existing data to avoid overwrites
 */
export async function syncPreferencesToCloud(userId: string, data: Partial<UserPreferences>): Promise<void> {
  if (!db || !isFirebaseConfigured) {
    console.debug('Firebase not configured, skipping cloud sync');
    return;
  }

  if (!userId) {
    console.warn('No userId provided for cloud sync');
    return;
  }

  if (!isOnline()) {
    addToPrefsQueue(data);
    return;
  }

  const userRef = doc(db, PREFERENCES_COLLECTION, userId);
  try {
    // Add timestamp to track last update
    const dataWithTimestamp = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    await setDoc(userRef, dataWithTimestamp, { merge: true });
    if (process.env.NODE_ENV === 'development') {
      console.debug('Preferences synced to cloud for user:', userId);
    }
  } catch (error) {
    console.error('Error syncing preferences to cloud:', error);
    // Queue for later if it was a network error
    addToPrefsQueue(data);
  }
}

/**
 * Retrieve user preferences from Firebase Firestore
 * Returns null if user has no preferences or Firebase is not configured
 */
export async function getPreferencesFromCloud(userId: string): Promise<UserPreferences | null> {
  if (!db || !isFirebaseConfigured) {
    console.debug('Firebase not configured, cannot get cloud preferences');
    return null;
  }

  if (!userId) {
    console.warn('No userId provided for getting cloud preferences');
    return null;
  }

  const userRef = doc(db, PREFERENCES_COLLECTION, userId);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserPreferences;
      if (process.env.NODE_ENV === 'development') {
        console.debug('Preferences loaded from cloud for user:', userId);
      }
      return data;
    }
    // Return empty preferences if document doesn't exist yet
    return { favorites: [], categories: [], presets: {}, pinnedTools: [] };
  } catch (error) {
    console.error('Error getting preferences from cloud:', error);
    // Return null to indicate error, allow fallback to local storage
    return null;
  }
}

/**
 * Delete a user's preferences from Firebase Firestore (for account deletion)
 */
export async function deletePreferencesFromCloud(userId: string): Promise<void> {
  if (!db || !isFirebaseConfigured) {
    return;
  }

  const userRef = doc(db, PREFERENCES_COLLECTION, userId);
  try {
    await setDoc(userRef, {}, { merge: false });
    if (process.env.NODE_ENV === 'development') {
      console.debug('Preferences deleted from cloud for user:', userId);
    }
  } catch (error) {
    console.error('Error deleting preferences from cloud:', error);
  }
}
