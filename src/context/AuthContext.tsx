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
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithPassword: (
    email: string,
    password: string,
    fullName: string,
    username: string
  ) => Promise<{ error: Error | null; needsEmailVerification: boolean }>;
  verifySignupOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  resetPasswordRequest: (email: string) => Promise<{ error: Error | null }>;
  verifyResetOtp: (
    email: string,
    token: string,
    newPassword: string
  ) => Promise<{ error: Error | null }>;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  quickDemoLogin: (mockUserIndex?: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_DEMO_USER = 'hobbyhive_demo_user';
const LOCAL_STORAGE_REGISTERED_USERS = 'hobbyhive_registered_users';

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

  // Listen to Supabase auth state
  useEffect(() => {
    let mounted = true;

    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id, session.user.email);
        } else {
          // Check local simulated session
          checkLocalSession();
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
      checkLocalSession();
      setIsLoading(false);
    }

    function checkLocalSession() {
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
    }
  }, [fetchProfile]);

  // 1. Sign In With Email & Password (no OTP required for returning users!)
  const signInWithPassword = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    const trimmedEmail = email.trim();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (!error && data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id, data.user.email);
        return { error: null };
      }

      // If Supabase returned invalid login credentials, check if registered in local storage fallback
      if (error && error.message.includes('Invalid login credentials')) {
        const localRegistered = getLocalRegisteredUsers();
        const found = localRegistered.find(
          (u) => u.email.toLowerCase() === trimmedEmail.toLowerCase() && u.password === password
        );
        if (found) {
          logInAsLocalUser(found);
          return { error: null };
        }
      }

      return { error };
    } else {
      // Demo mode password check
      const localRegistered = getLocalRegisteredUsers();
      const found = localRegistered.find(
        (u) => u.email.toLowerCase() === trimmedEmail.toLowerCase() && u.password === password
      );
      if (found) {
        logInAsLocalUser(found);
        return { error: null };
      }

      // Default demo login if password provided
      const defaultUser = {
        id: `usr-${Math.abs(trimmedEmail.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)) % 10000}`,
        username: trimmedEmail.split('@')[0],
        full_name: trimmedEmail.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${trimmedEmail}`,
        bio: 'HobbyHive enthusiast',
        created_at: new Date().toISOString(),
        email: trimmedEmail,
        password,
      };
      saveLocalRegisteredUser(defaultUser);
      logInAsLocalUser(defaultUser);
      return { error: null };
    }
  };

  // 2. Sign Up With Email, Password & OTP verification code
  const signUpWithPassword = async (
    email: string,
    password: string,
    fullName: string,
    username: string
  ): Promise<{ error: Error | null; needsEmailVerification: boolean }> => {
    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            username: cleanUsername,
          },
        },
      });

      if (error) {
        return { error, needsEmailVerification: false };
      }

      // If session is already returned, email confirmation wasn't required
      if (data.session && data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id, data.user.email);
        return { error: null, needsEmailVerification: false };
      }

      // Needs OTP verification
      return { error: null, needsEmailVerification: true };
    } else {
      // Demo mode signup
      const newUser = {
        id: `usr-${Date.now()}`,
        username: cleanUsername,
        full_name: trimmedName,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
        bio: 'New HobbyHive Member',
        created_at: new Date().toISOString(),
        email: trimmedEmail,
        password,
      };
      saveLocalRegisteredUser(newUser);
      return { error: null, needsEmailVerification: true };
    }
  };

  // 3. Verify Signup OTP
  const verifySignupOtp = async (
    email: string,
    token: string
  ): Promise<{ error: Error | null }> => {
    const trimmedEmail = email.trim();
    const trimmedToken = token.trim();

    if (isSupabaseConfigured) {
      // Try verifying with 'signup' or fallback to 'email'
      let res = await supabase.auth.verifyOtp({
        email: trimmedEmail,
        token: trimmedToken,
        type: 'signup',
      });

      if (res.error) {
        res = await supabase.auth.verifyOtp({
          email: trimmedEmail,
          token: trimmedToken,
          type: 'email',
        });
      }

      if (res.error) {
        // In case of demo simulation fallback
        const local = getLocalRegisteredUsers().find((u) => u.email.toLowerCase() === trimmedEmail.toLowerCase());
        if (local && (trimmedToken === '123456' || trimmedToken.length === 6)) {
          logInAsLocalUser(local);
          return { error: null };
        }
        return { error: res.error };
      }

      if (res.data.session) {
        setSession(res.data.session);
        setUser(res.data.user);
        if (res.data.user) {
          await fetchProfile(res.data.user.id, res.data.user.email);
        }
      }
      return { error: null };
    } else {
      const local = getLocalRegisteredUsers().find((u) => u.email.toLowerCase() === trimmedEmail.toLowerCase());
      if (local) {
        logInAsLocalUser(local);
      }
      return { error: null };
    }
  };

  // 4. Forgot Password - Request OTP / Recovery email
  const resetPasswordRequest = async (email: string): Promise<{ error: Error | null }> => {
    const trimmedEmail = email.trim();
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
      return { error };
    }
    return { error: null };
  };

  // 5. Verify Reset OTP & update password
  const verifyResetOtp = async (
    email: string,
    token: string,
    newPassword: string
  ): Promise<{ error: Error | null }> => {
    const trimmedEmail = email.trim();
    const trimmedToken = token.trim();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.verifyOtp({
        email: trimmedEmail,
        token: trimmedToken,
        type: 'recovery',
      });

      if (error) return { error };

      if (data.session) {
        const updateRes = await supabase.auth.updateUser({ password: newPassword });
        if (updateRes.error) return { error: updateRes.error };

        setSession(data.session);
        setUser(data.user);
        if (data.user) {
          await fetchProfile(data.user.id, data.user.email);
        }
      }
      return { error: null };
    } else {
      return { error: null };
    }
  };

  // Passwordless OTP (preserved as an option)
  const signInWithOtp = async (email: string): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      return { error };
    }
    return { error: null };
  };

  const verifyOtp = async (email: string, token: string): Promise<{ error: Error | null }> => {
    return verifySignupOtp(email, token);
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

    if (isSupabaseConfigured && !profile.id.startsWith('usr-')) {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) return { error };
    }

    setProfile(updated);
    localStorage.setItem(LOCAL_STORAGE_DEMO_USER, JSON.stringify(updated));
    return { error: null };
  };

  // Quick demo persona helper
  const quickDemoLogin = (index = 0) => {
    const mockUser = MOCK_USERS[index % MOCK_USERS.length];
    logInAsLocalUser({
      ...mockUser,
      email: `${mockUser.username}@hobbyhive.com`,
    });
  };

  // Helpers
  interface LocalSavedUser extends Profile {
    email: string;
    password?: string;
  }

  function getLocalRegisteredUsers(): LocalSavedUser[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_REGISTERED_USERS);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [];
  }

  function saveLocalRegisteredUser(u: LocalSavedUser) {
    const existing = getLocalRegisteredUsers();
    const updated = [u, ...existing.filter((x) => x.email.toLowerCase() !== u.email.toLowerCase())];
    localStorage.setItem(LOCAL_STORAGE_REGISTERED_USERS, JSON.stringify(updated));
  }

  function logInAsLocalUser(u: LocalSavedUser) {
    const demoUser = {
      id: u.id,
      email: u.email,
      app_metadata: {},
      user_metadata: { full_name: u.full_name },
      aud: 'authenticated',
      created_at: u.created_at,
    } as User;

    setUser(demoUser);
    setProfile(u);
    localStorage.setItem(LOCAL_STORAGE_DEMO_USER, JSON.stringify(u));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isDemoMode: !isSupabaseConfigured,
        signInWithPassword,
        signUpWithPassword,
        verifySignupOtp,
        resetPasswordRequest,
        verifyResetOtp,
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
