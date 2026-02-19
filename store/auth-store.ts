import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  favorite_brands: string[];
  routine_time: string;
  beauty_vibe: string;
  xp_points: number;
  onboarding_complete: boolean;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      // Try sign in first, then sign up if user doesn't exist
      let authData;
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // If invalid credentials, try creating a new account
        if (signInError.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });
          if (signUpError) throw signUpError;
          if (!signUpData.user) throw new Error('No user returned from sign up');
          authData = signUpData;
        } else {
          throw signInError;
        }
      } else {
        authData = signInData;
      }

      if (!authData.user) throw new Error('No user returned');

      // Fetch or create user profile
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist yet (new user) — create it
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            onboarding_complete: false,
            xp_points: 0,
            favorite_brands: [],
          })
          .select()
          .single();
        if (createError) throw createError;
        profileData = newProfile;
      } else if (profileError) {
        throw profileError;
      }

      if (!profileData || !profileData.id) {
        throw new Error('Failed to load user profile');
      }

      set({
        user: authData.user,
        profile: profileData as Profile,
        isLoading: false
      });

      // Navigate based on onboarding status
      if (!profileData.onboarding_complete) {
        router.replace('/(onboarding)/brands');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign in';
      set({
        error: errorMessage,
        isLoading: false,
        user: null,
        profile: null
      });
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        user: null,
        profile: null,
        isLoading: false
      });

      router.replace('/(auth)/login');
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred during sign out',
        isLoading: false
      });
    }
  },

  checkSession: async () => {
    set({ isLoading: true });

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        if (!profileData || !profileData.id) {
          throw new Error('Failed to load user profile');
        }

        set({
          user: session.user,
          profile: profileData as Profile,
          isLoading: false
        });

        // Navigate based on onboarding status
        if (!profileData.onboarding_complete) {
          router.replace('/(onboarding)/brands');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        set({ isLoading: false });
        router.replace('/(auth)/login');
      }
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred checking session',
        isLoading: false,
        user: null,
        profile: null
      });
      router.replace('/(auth)/login');
    }
  },

  clearError: () => set({ error: null }),
}));
