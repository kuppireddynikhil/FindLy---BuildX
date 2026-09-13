/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '../types/database';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  profile: Profile | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, department_id, phone, is_active, created_at, updated_at')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading user profile:', error);
      setProfile(null);
      return;
    }

    if (!data) {
      setProfile(null);
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('profile_id', currentUser.id)
      .limit(1)
      .maybeSingle();

    if (roleError) {
      console.error('Error loading user role:', roleError);
    }

    const dbRole = roleData?.roles?.[0]?.name?.toLowerCase();

    const appRole: UserRole =
      dbRole === 'super_admin' || dbRole === 'super_administrator'
        ? 'super_admin'
        : dbRole === 'administrator'
          ? 'admin'
          : 'user';

    const profileWithRole = {
      ...data,
      role: appRole,
    };

    setProfile(profileWithRole as Profile);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(currentUser);
      await loadProfile(currentUser);
    } catch (err) {
      console.error('Error refreshing user:', err);
      setUser(null);
      setProfile(null);
    }
  }, [loadProfile]);

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
        await loadProfile(activeSession?.user ?? null);
      } catch (err) {
        console.error('Error getting initial session:', err);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to session state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(true);
      void loadProfile(currentSession?.user ?? null).finally(() => setLoading(false));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const isAuthenticated = !!user;

  return (
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
      {children}
    </AuthContext.Provider>
  );
}
