import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import apiClient from '../services/api';
import { UserProfile, getMyProfile } from '../services/profileService';

const TOKEN_KEY = 'my-jwt';

// Platform-specific storage helper
const platformStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof globalThis !== 'undefined' && typeof (globalThis as any).localStorage !== 'undefined') {
          return (globalThis as any).localStorage.getItem(key);
        }
        return null;
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof globalThis !== 'undefined' && typeof (globalThis as any).localStorage !== 'undefined') {
          (globalThis as any).localStorage.setItem(key, value);
        }
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof globalThis !== 'undefined' && typeof (globalThis as any).localStorage !== 'undefined') {
          (globalThis as any).localStorage.removeItem(key);
        }
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  }
};

interface AuthContextData {
  token: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function loadAuthData() {
      try {
        const storedToken = await platformStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const profile = await getMyProfile();
          setUser(profile);
        }
      } catch (e) {
        // Silently fail, the redirect logic will handle it
      } finally {
        setIsLoading(false);
      }
    }
    loadAuthData();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = String(segments[0]) === '(auth)';
    if (token && inAuthGroup) {
      (router as any).replace('/(main)/home');
    } else if (!token && !inAuthGroup) {
      (router as any).replace('/(auth)/login');
    }
  }, [token, segments, isLoading, router]);
  
  const signIn = async (newToken: string) => {
    setToken(newToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    await platformStorage.setItem(TOKEN_KEY, newToken);
    const profile = await getMyProfile();
    setUser(profile);
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
    await platformStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}