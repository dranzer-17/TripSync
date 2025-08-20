// src/app/(main)/_layout.tsx

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // A popular icon library
import { useTheme } from 'react-native-paper';

export default function MainLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary, // Color for the active tab icon/label
        tabBarInactiveTintColor: 'gray', // Color for inactive tabs
        tabBarStyle: {
          backgroundColor: theme.colors.surface, // Background color of the tab bar
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTitleStyle: {
          color: 'white'
        }
      }}
    >
      <Tabs.Screen
        name="home" // This connects to the file `home.tsx`
        options={{
          title: 'Pooling',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-sport" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="services" // We will create the `services.tsx` file next
        options={{
          title: 'Services',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile" // We will create the `profile.tsx` file next
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}