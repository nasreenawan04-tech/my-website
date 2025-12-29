import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  deleteDoc, 
  doc,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured, isOnline } from './firebase';
import { PersistentStorage, STORAGE_KEYS } from './utils/precision-engine';

export interface CalculationHistory {
  id?: string;
  userId: string;
  toolName: string;
  toolPath: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  timestamp: Date;
}

const COLLECTION_NAME = 'calculationHistory';
const OFFLINE_QUEUE_KEY = 'dapsiwow_offline_sync_queue';

interface OfflineQueueItem {
  type: 'calculation';
  data: any;
  timestamp: number;
}

function addToOfflineQueue(item: OfflineQueueItem) {
  try {
    const queue = PersistentStorage.load<OfflineQueueItem[]>(OFFLINE_QUEUE_KEY, []);
    queue.push(item);
    PersistentStorage.save(OFFLINE_QUEUE_KEY, queue);
  } catch (e) {
    console.warn('Failed to add to offline queue:', e);
  }
}

export async function processOfflineQueue() {
  if (!isOnline() || !isFirebaseConfigured || !db) return;

  const queue = PersistentStorage.load<OfflineQueueItem[]>(OFFLINE_QUEUE_KEY, []);
  if (queue.length === 0) return;

  console.log(`Processing ${queue.length} offline calculation items...`);
  const remainingItems: OfflineQueueItem[] = [];

  for (const item of queue) {
    try {
      if (item.type === 'calculation') {
        const { userId, toolName, toolPath, inputs, results } = item.data;
        await addDoc(collection(db, COLLECTION_NAME), {
          userId,
          toolName,
          toolPath,
          inputs,
          results,
          timestamp: Timestamp.fromMillis(item.timestamp)
        });
      }
    } catch (e) {
      console.error('Failed to sync offline item:', e);
      remainingItems.push(item);
    }
  }

  if (remainingItems.length > 0) {
    PersistentStorage.save(OFFLINE_QUEUE_KEY, remainingItems);
  }
}

// Register online listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    processOfflineQueue().catch(console.error);
  });
}

export async function saveCalculation(
  userId: string,
  toolName: string,
  toolPath: string,
  inputs: Record<string, any>,
  results: Record<string, any>
): Promise<void> {
  // Always save to local storage as a robust fallback/cache
  try {
    const localHistory = PersistentStorage.load<any[]>(STORAGE_KEYS.CALC_HISTORY, []);
    const newEntry = {
      id: `local_${Date.now()}`,
      userId,
      toolName,
      toolPath,
      inputs,
      results,
      timestamp: new Date().toISOString()
    };
    localHistory.unshift(newEntry);
    
    // Non-obvious Fix: Quota Management
    // Instead of just slicing, we check if the storage is getting full
    // and prune more aggressively if needed to prevent QuotaExceededError
    const MAX_LOCAL_ITEMS = 30;
    const prunedHistory = localHistory.slice(0, MAX_LOCAL_ITEMS);
    
    try {
      PersistentStorage.save(STORAGE_KEYS.CALC_HISTORY, prunedHistory);
    } catch (e) {
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        // Emergency prune if storage is actually full
        PersistentStorage.save(STORAGE_KEYS.CALC_HISTORY, prunedHistory.slice(0, 10));
      } else {
        throw e;
      }
    }
  } catch (e) {
    console.warn('Failed to save to local storage:', e);
  }

  if (!isFirebaseConfigured || !db) {
    console.warn('Firestore not configured, calculation saved to local storage only');
    return;
  }

  if (!isOnline()) {
    addToOfflineQueue({
      type: 'calculation',
      data: { userId, toolName, toolPath, inputs, results },
      timestamp: Date.now()
    });
    return;
  }

  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      userId,
      toolName,
      toolPath,
      inputs,
      results,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Error saving calculation to Firestore:', error);
    addToOfflineQueue({
      type: 'calculation',
      data: { userId, toolName, toolPath, inputs, results },
      timestamp: Date.now()
    });
    // We already saved to local storage, so we don't throw unless it's a critical auth issue
    if ((error as any)?.code === 'permission-denied') {
      throw new Error('Authentication expired. Please sign in again.');
    }
  }
}

export async function getCalculationHistory(
  userId: string,
  maxResults: number = 100
): Promise<CalculationHistory[]> {
  if (!isFirebaseConfigured || !db) {
    console.warn('Firestore not configured');
    return [];
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    const history: CalculationHistory[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      history.push({
        id: doc.id,
        userId: data.userId,
        toolName: data.toolName,
        toolPath: data.toolPath,
        inputs: data.inputs,
        results: data.results,
        timestamp: data.timestamp.toDate()
      });
    });

    return history;
  } catch (error) {
    console.error('Error getting calculation history:', error);
    return [];
  }
}

export async function getCalculationHistoryByTool(
  userId: string,
  toolName: string
): Promise<CalculationHistory[]> {
  if (!isFirebaseConfigured || !db) {
    console.warn('Firestore not configured');
    return [];
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('toolName', '==', toolName),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const history: CalculationHistory[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      history.push({
        id: doc.id,
        userId: data.userId,
        toolName: data.toolName,
        toolPath: data.toolPath,
        inputs: data.inputs,
        results: data.results,
        timestamp: data.timestamp.toDate()
      });
    });

    return history;
  } catch (error) {
    console.error('Error getting calculation history by tool:', error);
    return [];
  }
}

export async function deleteCalculation(calculationId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    console.warn('Firestore not configured');
    return;
  }

  try {
    await deleteDoc(doc(db, COLLECTION_NAME, calculationId));
  } catch (error) {
    console.error('Error deleting calculation:', error);
    throw error;
  }
}

export async function clearAllCalculations(userId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    console.warn('Firestore not configured');
    return;
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map((doc) => 
      deleteDoc(doc.ref)
    );

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error clearing all calculations:', error);
    throw error;
  }
}
