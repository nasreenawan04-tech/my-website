import { db, auth } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

export interface UserPreferences {
  favorites: any[];
  categories: any[];
  presets: Record<string, any[]>;
  pinnedTools: any[];
}

const PREFERENCES_COLLECTION = 'userPreferences';

export async function syncPreferencesToCloud(userId: string, data: Partial<UserPreferences>) {
  if (!db) return;
  const userRef = doc(db, PREFERENCES_COLLECTION, userId);
  try {
    await setDoc(userRef, data, { merge: true });
  } catch (error) {
    console.error('Error syncing preferences to cloud:', error);
  }
}

export async function getPreferencesFromCloud(userId: string): Promise<UserPreferences | null> {
  if (!db) return null;
  const userRef = doc(db, PREFERENCES_COLLECTION, userId);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserPreferences;
    }
  } catch (error) {
    console.error('Error getting preferences from cloud:', error);
  }
  return null;
}
