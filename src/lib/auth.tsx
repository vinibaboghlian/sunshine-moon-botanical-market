import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export type AuthUser = {
  id: string;
  email: string;
  role: "admin" | "customer";
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function mapFirebaseUser(fbUser: User): AuthUser {
  return {
    id: fbUser.uid,
    email: fbUser.email ?? "",
    role: "admin",
  };
}

function formatAuthError(err: unknown): Error {
  const code = (err as { code?: string })?.code;
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return new Error("E-mail ou senha inválidos.");
    case "auth/invalid-email":
      return new Error("Formato de e-mail inválido.");
    case "auth/too-many-requests":
      return new Error("Muitas tentativas seguidas. Aguarde alguns instantes e tente novamente.");
    case "auth/user-disabled":
      return new Error("Esta conta de administrador está desativada.");
    default:
      return err instanceof Error ? err : new Error("Erro ao autenticar no Firebase.");
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(Boolean(auth));

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser ? mapFirebaseUser(fbUser) : null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      return { error: new Error("Autenticação disponível apenas no navegador.") };
    }
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      setUser(mapFirebaseUser(credential.user));
      return { error: null };
    } catch (err) {
      return { error: formatAuthError(err) };
    }
  };

  const signOut = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
  };

  const isAdmin = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
