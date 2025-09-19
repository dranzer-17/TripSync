// src/app/(main)/_layout.tsx

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

export default function MainLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: theme.colors.surface },
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: 'white' }
      }}
    >
      <Tabs.Screen
        name="home" // Connects to home.tsx
        options={{
          title: 'Pooling',
          tabBarIcon: ({ color, size }) => <Ionicons name="car-sport" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="services/index" // Connects to services/index.tsx
        options={{
          title: 'Services',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile" // Connects to profile.tsx
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
      
      {/* --- THIS IS THE CRITICAL FIX --- */}
      {/* We explicitly tell the router about the 'create' screen, */}
      {/* but we HIDE it from the tab bar. */}
      <Tabs.Screen
        name="services/create"
        options={{
          title: 'Create Service', // This will be the header title
          href: null, // This hides it from the tab bar
        }}
      />
      {/* -------------------------------- */}
    </Tabs>
  );
}