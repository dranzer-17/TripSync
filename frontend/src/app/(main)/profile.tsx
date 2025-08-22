// src/app/(main)/profile.tsx
import { useState, useCallback } from 'react';
import { Alert, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, Avatar } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';

import ScreenWrapper from '../../components/ScreenWrapper';
import { getMyProfile, updateMyProfile, UserProfile } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';

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
    return <ScreenWrapper style={styles.center}><ActivityIndicator size="large" /></ScreenWrapper>;
  }

  if (!profile) {
    return <ScreenWrapper style={styles.center}><Text>Could not load profile.</Text></ScreenWrapper>;
  }

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* A simple, non-interactive avatar icon */}
        <Avatar.Icon size={80} icon="account" style={styles.avatar} />
        
        <Text variant="headlineSmall" style={styles.name}>{fullName}</Text>
        <Text variant="bodyLarge" style={styles.college}>{profile.college_name}</Text>

        <TextInput label="Full Name" value={fullName} onChangeText={setFullName} mode="outlined" style={styles.input} />
        <TextInput label="Username" value={username} onChangeText={setUsername} mode="outlined" style={styles.input} autoCapitalize="none" />
        <TextInput label="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} mode="outlined" style={styles.input} keyboardType="phone-pad" />
        <TextInput label="Year of Study" value={yearOfStudy} onChangeText={setYearOfStudy} mode="outlined" style={styles.input} />
        <TextInput label="Bio" value={bio} onChangeText={setBio} mode="outlined" style={styles.input} multiline numberOfLines={3} />
        
        <Button mode="contained" onPress={handleSaveChanges} style={styles.button} loading={isSaving} disabled={isSaving}>
          Save Changes
        </Button>
        
        <Button mode="outlined" onPress={signOut} style={styles.button}>
          Logout
        </Button>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatar: { alignSelf: 'center', marginBottom: 10, backgroundColor: '#333' },
  name: { textAlign: 'center' },
  college: { textAlign: 'center', marginBottom: 30, color: '#aaa' },
  input: { marginBottom: 15 },
  button: { marginTop: 10 },
});