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

    let userRole: UserRole = 'user';
    const emailLower = (currentUser.email || '').toLowerCase();

    // 1. Check user or app metadata
    if (currentUser.user_metadata?.role) {
      userRole = currentUser.user_metadata.role as UserRole;
    } else if (currentUser.app_metadata?.role) {
      userRole = currentUser.app_metadata.role as UserRole;
    }

    // 2. Check designated admin account
    if (emailLower === 'knikhilreddy2@gmail.com') {
      userRole = 'admin';
    }

    // 3. Check localStorage role override
    const storedRole = localStorage.getItem('findly_role');
    if (storedRole === 'admin' || storedRole === 'super_admin') {
      userRole = storedRole as UserRole;
    }

    let userProfile: Profile | null = null;

    // 4. Safely query profiles table
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (!error && data) {
        userProfile = {
          id: data.id,
          email: data.email || currentUser.email || '',
          full_name: data.full_name || currentUser.user_metadata?.full_name || 'SVCE Member',
          avatar_url: data.avatar_url || currentUser.user_metadata?.avatar_url || null,
          role: (data.role as UserRole) || userRole,
          created_at: data.created_at || new Date().toISOString(),
        };
        if (data.role) {
          userRole = data.role as UserRole;
        }
      } else {
        userProfile = {
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'SVCE Member',
          avatar_url: currentUser.user_metadata?.avatar_url || null,
          role: userRole,
          created_at: new Date().toISOString(),
        };
      }
    } catch {
      userProfile = {
        id: currentUser.id,
        email: currentUser.email || '',
        full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'SVCE Member',
        avatar_url: currentUser.user_metadata?.avatar_url || null,
        role: userRole,
        created_at: new Date().toISOString(),
      };
    }

    // 5. Check relational user_roles table if present
    try {
      const { data: urData } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('profile_id', currentUser.id);

      if (urData && urData.length > 0) {
        const hasAdminRole = urData.some((ur: any) => {
          const rName = (ur.roles?.name || '').toLowerCase();
          return rName === 'admin' || rName === 'super_admin';
        });
        if (hasAdminRole) userRole = 'admin';
      }
    } catch {
      // ignore
    }

    if (userProfile) {
      userProfile.role = userRole;
    }

    setProfile(userProfile);
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
      localStorage.removeItem('findly_role');
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
