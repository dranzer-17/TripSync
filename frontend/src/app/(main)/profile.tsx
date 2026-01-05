// src/app/(main)/profile.tsx
import { useState, useCallback } from 'react';
import { Alert, StyleSheet, ScrollView, View, StatusBar } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, Avatar } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ScreenWrapper from '../../components/ScreenWrapper';
import { getMyProfile, updateMyProfile, UserProfile } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  primary: '#6A5AE0',
  primaryLight: '#E8E5FA',
  white: '#FFFFFF',
  text: '#0D0D0D',
  textSecondary: '#6C757D',
  border: '#E9ECEF',
};

export default function ProfileScreen() {
  const { signOut } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State for editable fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      if (!profile) setIsLoading(true);
      const profileData = await getMyProfile();
      setProfile(profileData);
      setFullName(profileData.full_name);
      setUsername(profileData.username || '');
      setPhoneNumber(profileData.phone_number || '');
      setBio(profileData.bio || '');
      setYearOfStudy(profileData.year_of_study || '');
    } catch (error: any) {
      Alert.alert('Error Fetching Profile', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useFocusEffect(useCallback(() => { fetchProfile(); }, []));
  
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
        const updatedProfile = await updateMyProfile({
            full_name: fullName,
            username,
            phone_number: phoneNumber,
            bio,
            year_of_study: yearOfStudy,
        });
        setProfile(updatedProfile);
        Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
        Alert.alert('Save Failed', error.message);
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </ScreenWrapper>
    );
  }

  if (!profile) {
    return (
      <ScreenWrapper style={styles.loadingContainer}>
        <Text style={styles.errorText}>Could not load profile.</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.wrapper}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Avatar.Icon 
              size={100} 
              icon="account" 
              style={styles.avatar}
              color={COLORS.primary}
            />
          </View>
          <Text variant="headlineMedium" style={styles.name}>{fullName}</Text>
          <View style={styles.collegeContainer}>
            <Ionicons name="school" size={16} color={COLORS.textSecondary} />
            <Text variant="bodyMedium" style={styles.college}>{profile.college_name}</Text>
          </View>
        </View>

        {/* Profile Info Card */}
        <View style={styles.card}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Profile Information
          </Text>
          
          <TextInput 
            label="Full Name" 
            value={fullName} 
            onChangeText={setFullName} 
            mode="outlined" 
            style={styles.input}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="account" color={COLORS.primary} />}
          />
          
          <TextInput 
            label="Username" 
            value={username} 
            onChangeText={setUsername} 
            mode="outlined" 
            style={styles.input} 
            autoCapitalize="none"
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="at" color={COLORS.primary} />}
          />
          
          <TextInput 
            label="Phone Number" 
            value={phoneNumber} 
            onChangeText={setPhoneNumber} 
            mode="outlined" 
            style={styles.input} 
            keyboardType="phone-pad"
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="phone" color={COLORS.primary} />}
          />
          
          <TextInput 
            label="Year of Study" 
            value={yearOfStudy} 
            onChangeText={setYearOfStudy} 
            mode="outlined" 
            style={styles.input}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="calendar" color={COLORS.primary} />}
          />
          
          <TextInput 
            label="Bio" 
            value={bio} 
            onChangeText={setBio} 
            mode="outlined" 
            style={styles.input} 
            multiline 
            numberOfLines={4}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="text" color={COLORS.primary} />}
          />
        </View>
        
        {/* Action Buttons */}
        <Button 
          mode="contained" 
          onPress={handleSaveChanges} 
          style={styles.saveButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          loading={isSaving} 
          disabled={isSaving}
          icon={({ size, color }) => <Ionicons name="checkmark-circle" size={size} color={color} />}
        >
          Save Changes
        </Button>
        
        <Button 
          mode="outlined" 
          onPress={signOut} 
          style={styles.logoutButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.logoutButtonLabel}
          icon={({ size }) => <Ionicons name="log-out" size={size} color={COLORS.primary} />}
        >
          Logout
        </Button>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: { 
    padding: 24, 
    paddingBottom: 50,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  avatarContainer: {
    marginBottom: 16,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderRadius: 50,
  },
  avatar: { 
    backgroundColor: COLORS.primaryLight,
  },
  name: { 
    textAlign: 'center',
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  collegeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  college: { 
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 20,
  },
  input: { 
    marginBottom: 16,
    backgroundColor: COLORS.white,
  },
  saveButton: { 
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoutButton: {
    borderRadius: 12,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  logoutButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
});