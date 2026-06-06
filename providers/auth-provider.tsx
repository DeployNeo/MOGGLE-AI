"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { getFirebaseDb } from "@/lib/firebase/client";
import {
  createUserProfile,
  getUserProfile,
} from "@/services/firebase/users";
import { trackEvent } from "@/lib/firebase/analytics";
import type { UserProfile } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const db = getFirebaseDb();
    if (!db) return;
    const p = await getUserProfile(db, user.uid);
    setProfile(p);
  }, [user]);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const db = getFirebaseDb();
        if (db) {
          let p = await getUserProfile(db, firebaseUser.uid);
          if (!p) {
            p = await createUserProfile(db, firebaseUser.uid, {
              email: firebaseUser.email ?? "",
              displayName: firebaseUser.displayName ?? "",
              photoURL: firebaseUser.photoURL,
            });
          }
          setProfile(p);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase not configured");
    await signInWithEmailAndPassword(auth, email, password);
    await trackEvent("login", { method: "email" });
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase not configured");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      const db = getFirebaseDb();
      if (db) {
        await createUserProfile(db, cred.user.uid, {
          email,
          displayName,
          photoURL: null,
        });
      }
      await trackEvent("sign_up", { method: "email" });
    },
    []
  );

  const logOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await firebaseSignOut(auth);
    setProfile(null);
  }, []);

  const getIdToken = useCallback(async () => {
    if (!user) return null;
    return user.getIdToken();
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      configured,
      signIn,
      signUp,
      logOut,
      refreshProfile,
      getIdToken,
    }),
    [user, profile, loading, configured, signIn, signUp, logOut, refreshProfile, getIdToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      profile: null,
      loading: false,
      configured: false,
      signIn: async () => {},
      signUp: async () => {},
      logOut: async () => {},
      refreshProfile: async () => {},
      getIdToken: async () => null,
    };
  }
  return ctx;
}
