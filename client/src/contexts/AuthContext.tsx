import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email address is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please check your email or sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
    'auth/invalid-login-credentials': 'Invalid email or password. Please check your credentials and try again.',
    'auth/missing-password': 'Please enter your password.',
    'auth/missing-email': 'Please enter your email address.',
    'auth/internal-error': 'An internal error occurred. Please try again later.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later or reset your password.',
    'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups and try again.',
    'auth/cancelled-popup-request': 'Only one popup request is allowed at a time.',
    'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in method.',
    'auth/invalid-verification-code': 'Invalid verification code. Please try again.',
    'auth/invalid-verification-id': 'Invalid verification ID. Please restart the verification process.',
    'auth/missing-verification-code': 'Please enter the verification code.',
    'auth/missing-verification-id': 'Verification ID is missing. Please restart the process.',
    'auth/credential-already-in-use': 'This credential is already associated with a different account.',
    'auth/requires-recent-login': 'This operation requires recent authentication. Please sign in again.',
    'auth/email-change-needs-verification': 'Email change requires verification. Please check your inbox.',
    'auth/expired-action-code': 'This action code has expired. Please request a new one.',
    'auth/invalid-action-code': 'This action code is invalid. Please request a new one.',
    'auth/unauthorized-domain': 'This domain is not authorized for authentication. Please contact support.',
    'auth/invalid-api-key': 'Authentication configuration error. Please contact support.',
    'auth/app-deleted': 'Authentication service is unavailable. Please contact support.'
  };

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  updateUserEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase is not configured, set loading to false and return
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      }, (error) => {
        console.warn('Auth state change error:', error);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.warn('Failed to set up auth state observer:', error);
      setLoading(false);
    }
  }, []);

  const signup = async (email: string, password: string, displayName?: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Authentication is not configured. Please contact support.');
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
        setUser({ ...userCredential.user });
      }
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  const login = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Authentication is not configured. Please contact support.');
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Authentication is not configured. Please contact support.');
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Authentication is not configured. Please contact support.');
    }
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Authentication is not configured. Please contact support.');
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Authentication is not configured. Please contact support.');
    }
    if (!auth.currentUser) {
      throw new Error('No user is currently logged in.');
    }
    try {
      await updateProfile(auth.currentUser, {
        displayName,
        ...(photoURL && { photoURL })
      });
      setUser({ ...auth.currentUser });
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  const updateUserEmail = async (newEmail: string, currentPassword: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Authentication is not configured. Please contact support.');
    }
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('No user is currently logged in.');
    }
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updateEmail(auth.currentUser, newEmail);
      setUser({ ...auth.currentUser });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Authentication is not configured. Please contact support.');
    }
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('No user is currently logged in.');
    }
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
