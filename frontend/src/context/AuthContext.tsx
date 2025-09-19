// src/context/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import apiClient from '../services/api';
import { UserProfile, getMyProfile } from '../services/profileService';

const TOKEN_KEY = 'my-jwt';

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
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const profile = await getMyProfile();
          setUser(profile);
        }
      } catch (e) {
        // This is a silent failure, the redirect logic will handle it
      } finally {
        setIsLoading(false);
      }
    }
    loadAuthData();
  }, []);

  // --- THIS IS THE WORKING REDIRECTION LOGIC ---
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as any) === '(auth)';

    if (token && inAuthGroup) {
      // Navigate to main home screen after authentication
      router.replace('../(main)/home' as any);
    } else if (!token && !inAuthGroup) {
      // Navigate back to login if not authenticated
      router.replace('./(auth)/login' as any);
    }
  }, [token, segments, isLoading, router]);
  // ---------------------------------------------

  
  const signIn = async (newToken: string) => {
    setToken(newToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    const profile = await getMyProfile();
    setUser(profile);
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}