// src/context/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import apiClient from '../services/api';

const TOKEN_KEY = 'my-jwt';

// Define the shape of our context
interface AuthContextData {
  token: string | null;
  isLoading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// This is a custom hook that components can use to access the context
export function useAuth() {
  return useContext(AuthContext);
}

// This is the provider component that will wrap our entire app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function loadToken() {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          // Set the token on the API client for all future requests
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadToken();
  }, []);

  useEffect(() => {
    // Wait until the token has been loaded from storage
    if (isLoading) {
      return;
    }

    const inAuthGroup = (segments[0] as any) === '(auth)';

    // User is logged in and tries to access login/register pages.
    if (token && inAuthGroup) {
      // Redirect away from the auth pages to the main app.
      router.replace('../(main)/home');
    } 
    
    // User is not logged in and is trying to access a protected page.
    else if (!token && !inAuthGroup) {
      // Redirect back to the login page.
      router.replace('../(auth)/login');
    }
  }, [token, segments, isLoading]); // Dependencies for the effect

  const signIn = async (newToken: string) => {
    setToken(newToken);
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    // Set the token on the API client for all future requests
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const signOut = async () => {
    setToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    // Remove the token from the API client
    delete apiClient.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}