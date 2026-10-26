import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, BOOTSTRAP_ADMIN_EMAIL } from '../firebase';
import { AppUser } from '../types';

interface AuthContextType {
  currentUser: User | null;
  appUser: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const isBootstrapAdmin = user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

        // Check or bootstrap admin record in Firestore
        let adminGranted = isBootstrapAdmin;
        try {
          const adminDocRef = doc(db, 'admins', user.uid);
          const adminSnap = await getDoc(adminDocRef);
          if (adminSnap.exists()) {
            adminGranted = true;
          } else if (isBootstrapAdmin) {
            // Auto register admin record for bootstrap email
            await setDoc(adminDocRef, {
              uid: user.uid,
              email: user.email,
              role: 'admin',
              createdAt: new Date().toISOString()
            });
            adminGranted = true;
          }
        } catch {
          // If Firestore query fails, fallback to bootstrap check
          adminGranted = isBootstrapAdmin;
        }

        setIsAdmin(adminGranted);
        setAppUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          role: adminGranted ? 'admin' : 'customer'
        });
      } else {
        setAppUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
      const isBootstrap = email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
      try {
        await setDoc(doc(db, 'users', cred.user.uid), {
          id: cred.user.uid,
          email,
          displayName: name,
          role: isBootstrap ? 'admin' : 'customer',
          createdAt: new Date().toISOString()
        });
        if (isBootstrap) {
          await setDoc(doc(db, 'admins', cred.user.uid), {
            uid: cred.user.uid,
            email,
            role: 'admin',
            createdAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('Could not write user profile doc immediately:', err);
      }
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      appUser,
      isAdmin,
      loading,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
