/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
<<<<<<< HEAD
import type { Profile, UserRole } from '../types/database';
=======
>>>>>>> origin/main

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
<<<<<<< HEAD
  role: UserRole | null;
  profile: Profile | null;
=======
>>>>>>> origin/main
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, created_at')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading user profile:', error);
      setProfile(null);
      return;
    }

    setProfile(data as Profile | null);
  }, []);
=======
>>>>>>> origin/main

  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(currentUser);
<<<<<<< HEAD
      await loadProfile(currentUser);
    } catch (err) {
      console.error('Error refreshing user:', err);
      setUser(null);
      setProfile(null);
    }
  }, [loadProfile]);
=======
    } catch (err) {
      console.error('Error refreshing user:', err);
      setUser(null);
    }
  }, []);
>>>>>>> origin/main

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Error during logout:', err);
    }
  }, []);

  useEffect(() => {
    // Initialize session and user status
    const initializeAuth = async () => {
      try {
        const { data: { session: activeSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(activeSession);
        setUser(activeSession?.user ?? null);
<<<<<<< HEAD
        await loadProfile(activeSession?.user ?? null);
=======
>>>>>>> origin/main
      } catch (err) {
        console.error('Error getting initial session:', err);
        setSession(null);
        setUser(null);
<<<<<<< HEAD
        setProfile(null);
=======
>>>>>>> origin/main
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to session state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
<<<<<<< HEAD
      setLoading(true);
      void loadProfile(currentSession?.user ?? null).finally(() => setLoading(false));
=======
      setLoading(false);
>>>>>>> origin/main
    });

    return () => {
      subscription.unsubscribe();
    };
<<<<<<< HEAD
  }, [loadProfile]);
=======
  }, []);
>>>>>>> origin/main

  const isAuthenticated = !!user;

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAuthenticated,
      role: profile?.role ?? null,
      profile,
      refreshUser,
      logout,
    }}>
=======
    <AuthContext.Provider value={{ user, session, loading, isAuthenticated, refreshUser, logout }}>
>>>>>>> origin/main
      {children}
    </AuthContext.Provider>
  );
}
