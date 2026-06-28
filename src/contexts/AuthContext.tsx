import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, UserGoals } from '../types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  goals: UserGoals | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; user: User | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  refreshGoals: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let isMounted = true;

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.log("PROFILE ERROR:", error);
        return;
      }

      if (isMounted) {
        setProfile(data as Profile | null);
      }
    } catch (err) {
      console.log("PROFILE CATCH:", err);
    }
  };

  const fetchGoals = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.log("GOALS ERROR:", error);
        return;
      }

      if (isMounted) {
        setGoals(data as UserGoals | null);
      }
    } catch (err) {
      console.log("GOALS CATCH:", err);
    }
  };

  const loadUserData = async (userId: string) => {
    await Promise.allSettled([
      fetchProfile(userId),
      fetchGoals(userId),
    ]);
  };

  const init = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      console.log("INIT SESSION:", data?.session, error);

      if (!isMounted) return;

      const session = data.session;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadUserData(session.user.id);
      }
    } catch (err) {
      console.log("INIT AUTH ERROR:", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  init();

  const { data } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (!isMounted) return;

      console.log("AUTH EVENT:", event, session);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user && event !== 'PASSWORD_RECOVERY') {
        await loadUserData(session.user.id);
      } else {
        setProfile(null);
        setGoals(null);
      }

      setLoading(false);
    }
  );

  return () => {
    isMounted = false;
    data.subscription.unsubscribe();
  };
}, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    return { error, user: data.user };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setGoals(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const refreshProfile = async () => {
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) setProfile(data as Profile);
    }
  };

  const refreshGoals = async () => {
    if (user) {
      const { data } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) setGoals(data as UserGoals);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        goals,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
        refreshGoals,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
