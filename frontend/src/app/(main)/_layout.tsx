// src/app/(main)/_layout.tsx

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { Platform, View, Animated } from 'react-native';

export default function MainLayout() {
  const theme = useTheme();

  const TabIcon = ({ focused, iconName, size }: { focused: boolean; iconName: any; size: number }) => {
    const animatedValue = new Animated.Value(focused ? 1 : 0);
    
    React.useEffect(() => {
      Animated.spring(animatedValue, {
        toValue: focused ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }, [focused]);

    const scale = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.05],
    });

    const backgroundColor = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(103, 58, 183, 0)', 'rgba(103, 58, 183, 1)'],
    });

    return (
      <Animated.View style={{
        backgroundColor: focused ? '#673AB7' : 'transparent',
        borderRadius: 20,
        width: focused ? 50 : 40, // Longer horizontally when active
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scale }],
        shadowColor: focused ? '#673AB7' : 'transparent',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: focused ? 0.3 : 0,
        shadowRadius: 6,
        elevation: focused ? 4 : 0,
      }}>
        <Animated.View>
          <Ionicons 
            name={focused ? iconName : `${iconName}-outline`} 
            size={size} 
            color={focused ? '#ffffff' : '#666666'} 
          />
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#673AB7',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          // Remove absolute positioning to give it proper space
          position: 'relative',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          height: 85,
          paddingBottom: Platform.OS === 'ios' ? 25 : 15,
          paddingTop: 15,
          paddingHorizontal: 20,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -5,
          },
          shadowOpacity: 0.08,
          shadowRadius: 15,
          elevation: 15,
          borderWidth: 0.5,
          borderColor: 'rgba(0, 0, 0, 0.05)',
          // Add margin bottom for safe area
          marginBottom: 0,
        },
        tabBarItemStyle: {
          borderRadius: 25,
          marginHorizontal: 5,
          paddingVertical: 0,
          paddingHorizontal: 5,
          // Add transition-like effect
          flex: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 6,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarHideOnKeyboard: Platform.OS !== 'ios',
        // Add screen transition animations
        animation: 'shift',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Pooling',
          tabBarIcon: ({ size, focused }) => (
            <TabIcon focused={focused} iconName="car-sport" size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ size, focused }) => (
            <TabIcon focused={focused} iconName="chatbubbles" size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ size, focused }) => (
            <TabIcon focused={focused} iconName="grid" size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, focused }) => (
            <TabIcon focused={focused} iconName="person" size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null, // Hide from tabs
          headerShown: false,
        }}
      />
    </Tabs>
  );
}