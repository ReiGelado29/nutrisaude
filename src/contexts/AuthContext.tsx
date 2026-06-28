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
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (isMounted && data) {
      setProfile(data as Profile);
    }
  };

  const fetchGoals = async (userId: string) => {
    const { data } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (isMounted && data) {
      setGoals(data as UserGoals);
    }
  };

  const init = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!isMounted) return;

    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      await Promise.all([
        fetchProfile(session.user.id),
        fetchGoals(session.user.id),
      ]);
    }

    setLoading(false);
  };

  init();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (!isMounted) return;

    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user && event !== 'PASSWORD_RECOVERY') {
      fetchProfile(session.user.id);
      fetchGoals(session.user.id);
    } else {
      setProfile(null);
      setGoals(null);
    }
  });

  return () => {
    isMounted = false;
    subscription.unsubscribe();
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
