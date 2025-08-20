// src/app/(main)/profile.tsx

import React, { useState, useCallback } from 'react';
import { Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, Avatar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';

// --- Local Imports ---
import ScreenWrapper from '../../components/ScreenWrapper';
import { getMyProfile, updateMyProfile, UserProfile, uploadProfileImage } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../constants/config';

export default function ProfileScreen() {
  // --- Hooks ---
  const { signOut } = useAuth();
  
  // --- State Management ---
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State for each editable field to allow for changes before saving
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');

  // --- Data Fetching Logic ---
  
  // We wrap fetchProfile in useCallback to prevent it from being recreated on every render
  const fetchProfile = useCallback(async () => {
    try {
      // Only show the full-screen loader on the very first load
      if (!profile) setIsLoading(true);
      const profileData = await getMyProfile();
      setProfile(profileData);
      
      // Populate the state for the input fields with the newly fetched data
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
  }, [profile]); // Dependency: Re-create this function only if `profile` state changes

  // useFocusEffect runs a function every time the user navigates TO this screen.
  // This is better than useEffect for tabs, as it ensures data is fresh.
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  // --- Image Handling Logic ---
  
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your photos to upload an image.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Enforce a square image
      quality: 0.3, // Compress image to reduce upload size
      base64: false
    });

    if (pickerResult.canceled) return;
    
    if (pickerResult.assets && pickerResult.assets.length > 0) {
      handleUploadImage(pickerResult.assets[0].uri);
    }
  };

  const handleUploadImage = async (uri: string) => {
    setIsUploading(true);
    try {
        await uploadProfileImage(uri);
        Alert.alert('Success', 'Profile image updated!');
        // Refresh the profile data from the server to get the new image URL
        fetchProfile();
    } catch (error: any) {
        Alert.alert('Upload Failed', error.message);
    } finally {
        setIsUploading(false);
    }
  };

  // --- Form Submission Logic ---
  
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
        setProfile(updatedProfile); // Update the local state with the saved data
        Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
        Alert.alert('Save Failed', error.message);
    } finally {
        setIsSaving(false);
    }
  };

  // --- UI Rendering ---

  if (isLoading) {
    return <ScreenWrapper style={styles.center}><ActivityIndicator size="large" /></ScreenWrapper>;
  }

  if (!profile) {
    return <ScreenWrapper style={styles.center}><Text>Could not load profile. Please try again.</Text></ScreenWrapper>;
  }
  
  // Construct the full URL for the profile image, adding a timestamp to prevent caching issues.
  const imageUrl = profile.profile_image_url
    ? `${API_BASE_URL}/profile/${profile.id}/image?timestamp=${new Date().getTime()}`
    : 'https://www.gravatar.com/avatar/?d=mp'; // A default placeholder image

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={handlePickImage} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator size={80} style={styles.avatar} />
          ) : (
            <Avatar.Image
              size={80}
              source={{ uri: imageUrl }}
              style={styles.avatar}
            />
          )}
        </TouchableOpacity>
        
        <Text variant="headlineSmall" style={styles.name}>{profile.full_name}</Text>
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
  container: { 
    padding: 20, 
    paddingBottom: 50 // Extra padding at the bottom for better scrolling
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatar: { 
    alignSelf: 'center', 
    marginBottom: 10, 
    backgroundColor: '#333' // Background color while image is loading
  },
  name: { 
    textAlign: 'center' 
  },
  college: { 
    textAlign: 'center', 
    marginBottom: 30, 
    color: '#aaa' // A lighter color for secondary text
  },
  input: { 
    marginBottom: 15 
  },
  button: { 
    marginTop: 10 
  },
});