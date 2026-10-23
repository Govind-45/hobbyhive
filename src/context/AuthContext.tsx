import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types/database';
import { MOCK_USERS } from '../lib/mockData';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  quickDemoLogin: (mockUserIndex?: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_DEMO_USER = 'hobbyhive_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch or construct profile
  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    if (!isSupabaseConfigured) {
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching profile:', error.message);
      }

      if (data) {
        setProfile(data as Profile);
      } else {
        // Fallback profile if record doesn't exist yet
        const defaultUsername = email ? email.split('@')[0] : `hive_${userId.slice(0, 5)}`;
        const fallbackProfile: Profile = {
          id: userId,
          username: defaultUsername,
          full_name: defaultUsername,
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
          bio: 'HobbyHive explorer & discussion enthusiast',
          created_at: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }, []);

  // Listen to Supabase auth state if configured, otherwise initialize demo session
  useEffect(() => {
    let mounted = true;

    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id, session.user.email);
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (!mounted) return;
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id, session.user.email);
          } else {
            setProfile(null);
          }
          setIsLoading(false);
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      // Demo mode: check localStorage for simulated session
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_DEMO_USER);
        if (saved) {
          const parsed = JSON.parse(saved);
          setUser({
            id: parsed.id,
            email: parsed.email || 'demo@hobbyhive.com',
            app_metadata: {},
            user_metadata: { full_name: parsed.full_name },
            aud: 'authenticated',
            created_at: parsed.created_at,
          } as User);
          setProfile(parsed);
        }
      } catch (e) {
        console.warn('Could not parse demo user from local storage:', e);
      }
      setIsLoading(false);
    }
  }, [fetchProfile]);

  // Request OTP
  const signInWithOtp = async (email: string): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });
      return { error };
    } else {
      // Demo mode OTP request simulation
      console.log(`[Demo Mode] OTP request simulated for ${email}. Enter any 6-digit code (e.g. 123456) to proceed.`);
      return { error: null };
    }
  };

  // Verify OTP
  const verifyOtp = async (email: string, token: string): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) return { error };
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        if (data.user) {
          await fetchProfile(data.user.id, data.user.email);
        }
      }
      return { error: null };
    } else {
      // Demo mode verification: accept any 6 digits
      if (!token || token.trim().length < 6) {
        return { error: new Error('Please enter a valid 6-digit verification code.') };
      }
      const demoId = `usr-${Math.abs(email.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)) % 10000}`;
      const username = email.split('@')[0] || 'honeybee';
      const demoProfile: Profile = {
        id: demoId,
        username,
        full_name: username.charAt(0).toUpperCase() + username.slice(1),
        avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        bio: 'Passionate hobbyist on HobbyHive',
        created_at: new Date().toISOString(),
      };
      const demoUser = {
        id: demoId,
        email,
        app_metadata: {},
        user_metadata: { full_name: demoProfile.full_name },
        aud: 'authenticated',
        created_at: demoProfile.created_at,
      } as User;

      setUser(demoUser);
      setProfile(demoProfile);
      localStorage.setItem(LOCAL_STORAGE_DEMO_USER, JSON.stringify(demoProfile));
      return { error: null };
    }
  };

  // Sign out
  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_STORAGE_DEMO_USER);
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: Error | null }> => {
    if (!profile) return { error: new Error('Not logged in') };

    const updated = { ...profile, ...updates };

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) return { error };
      setProfile(updated);
      return { error: null };
    } else {
      setProfile(updated);
      localStorage.setItem(LOCAL_STORAGE_DEMO_USER, JSON.stringify(updated));
      return { error: null };
    }
  };

  // Instant demo login helper for quick testing
  const quickDemoLogin = (index = 0) => {
    const mockUser = MOCK_USERS[index % MOCK_USERS.length];
    const demoUser = {
      id: mockUser.id,
      email: `${mockUser.username}@hobbyhive.com`,
      app_metadata: {},
      user_metadata: { full_name: mockUser.full_name },
      aud: 'authenticated',
      created_at: mockUser.created_at,
    } as User;

    setUser(demoUser);
    setProfile(mockUser);
    localStorage.setItem(LOCAL_STORAGE_DEMO_USER, JSON.stringify(mockUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isDemoMode: !isSupabaseConfigured,
        signInWithOtp,
        verifyOtp,
        signOut,
        updateProfile,
        quickDemoLogin,
      }}
    >
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
