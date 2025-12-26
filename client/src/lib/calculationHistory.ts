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
import { db, isFirebaseConfigured } from './firebase';

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
const COMPARISON_COLLECTION_NAME = 'comparisonHistory';

export interface ComparisonHistory {
  id?: string;
  userId: string;
  category: string;
  toolIds: string[];
  timestamp: Date;
}

export async function saveComparison(
  userId: string,
  category: string,
  toolIds: string[]
): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    const saved = JSON.parse(localStorage.getItem('saved_comparisons') || '[]');
    saved.push({
      id: Math.random().toString(36).substr(2, 9),
      userId,
      category,
      toolIds,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('saved_comparisons', JSON.stringify(saved.slice(-20)));
    return;
  }

  try {
    await addDoc(collection(db, COMPARISON_COLLECTION_NAME), {
      userId,
      category,
      toolIds,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Error saving comparison:', error);
    throw error;
  }
}

export async function getComparisonHistory(userId: string): Promise<ComparisonHistory[]> {
  if (!isFirebaseConfigured || !db) {
    const saved = JSON.parse(localStorage.getItem('saved_comparisons') || '[]');
    return saved.map((s: any) => ({ ...s, timestamp: new Date(s.timestamp) }));
  }

  try {
    const q = query(
      collection(db, COMPARISON_COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const history: ComparisonHistory[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      history.push({
        id: doc.id,
        userId: data.userId,
        category: data.category,
        toolIds: data.toolIds,
        timestamp: data.timestamp.toDate()
      });
    });
    return history;
  } catch (error) {
    console.error('Error getting comparison history:', error);
    return [];
  }
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
    const localHistory = JSON.parse(localStorage.getItem('local_calculation_history') || '[]');
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
    localStorage.setItem('local_calculation_history', JSON.stringify(localHistory.slice(0, 50)));
  } catch (e) {
    console.warn('Failed to save to local storage:', e);
  }

  if (!isFirebaseConfigured || !db) {
    console.warn('Firestore not configured, calculation saved to local storage only');
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
    // We already saved to local storage, so we don't throw unless it's a critical auth issue
    if ((error as any)?.code === 'permission-denied') {
      throw new Error('Authentication expired. Please sign in again.');
    }
    // For other errors, we let the local save be the successful outcome
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
