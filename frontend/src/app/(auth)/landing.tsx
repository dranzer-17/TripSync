// src/app/(auth)/landing.tsx

import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function LandingScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <ScreenWrapper style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo/Title Section */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <Ionicons name="car" size={64} color={theme.colors.primary} />
          </View>
          <Text variant="displayMedium" style={[styles.title, { color: theme.colors.primary }]}>
            TripSync
          </Text>
          <Text variant="titleMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Your Smart Ride Sharing Companion
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="people"
            title="Pool Rides"
            description="Share rides with fellow students and save money"
            theme={theme}
          />
          <FeatureItem
            icon="briefcase"
            title="Service Marketplace"
            description="Offer or find services within your campus community"
            theme={theme}
          />
          <FeatureItem
            icon="map"
            title="Real-time Tracking"
            description="Track your rides and matches in real-time"
            theme={theme}
          />
          <FeatureItem
            icon="shield-checkmark"
            title="Safe & Verified"
            description="All users are verified students from your college"
            theme={theme}
          />
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            Connect with students from your college to share rides, offer services, and build a stronger campus community.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => router.push('/(auth)/login')}
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon={({ size, color }) => <Ionicons name="log-in" size={size} color={color} />}
          >
            Login
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => router.push('/(auth)/register')}
            style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonLabel, { color: theme.colors.primary }]}
            icon={({ size, color }) => <Ionicons name="person-add" size={size} color={color} />}
          >
            Sign Up
          </Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

function FeatureItem({ icon, title, description, theme }: { 
  icon: string; 
  title: string; 
  description: string; 
  theme: any;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
        <Ionicons name={icon as any} size={28} color={theme.colors.primary} />
      </View>
      <View style={styles.featureTextContainer}>
        <Text variant="titleSmall" style={[styles.featureTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        <Text variant="bodySmall" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    lineHeight: 20,
  },
  descriptionContainer: {
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 8,
  },
});

