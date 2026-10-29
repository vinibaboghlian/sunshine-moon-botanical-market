import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  role: "admin" | "customer";
  full_name: string | null;
  phone: string | null;
  cpf: string | null;
  postal_code: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.warn("Could not load user profile:", error.message);
      }

      if (data) {
        setProfile(data as UserProfile);
      } else {
        // Mock ou fallback se a tabela profiles ainda não tiver a linha
        setProfile({
          id: userId,
          role: "customer",
          full_name: null,
          phone: null,
          cpf: null,
          postal_code: null,
          street: null,
          number: null,
          complement: null,
          neighborhood: null,
          city: null,
          state: null,
        });
      }
    } catch {
      // Ignora erro se não conectado ao Supabase remoto
    }
  }

  useEffect(() => {
    // Escuta estado de autenticação
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  const signIn = async (email: string, password?: string) => {
    try {
      if (password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin },
        });
        return { error };
      }
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password?: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || "temp123456",
        options: {
          data: { full_name: fullName },
        },
      });

      if (!error && data.user) {
        // Cria perfil básico se a trigger ainda não o fez
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName || null,
          role: "customer",
        });
      }

      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAdmin: profile?.role === "admin" || user?.email?.includes("admin"),
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

