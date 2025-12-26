import { db, auth, isFirebaseConfigured } from './firebase';
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
    // Don't throw - allow app to continue working offline
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
