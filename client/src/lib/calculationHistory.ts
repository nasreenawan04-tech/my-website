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

export async function saveCalculation(
  userId: string,
  toolName: string,
  toolPath: string,
  inputs: Record<string, any>,
  results: Record<string, any>
): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    console.warn('Firestore not configured, calculation history not saved');
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
    console.error('Error saving calculation:', error);
    throw error;
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
