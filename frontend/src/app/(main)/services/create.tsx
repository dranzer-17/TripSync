// src/app/(main)/services/create.tsx

import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Text, TextInput, Button, Switch } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import ScreenWrapper from '../../../components/ScreenWrapper';

// --- Corrected Imports ---
import { createServicePost } from '../../../services/servicesService';
import { useAuth } from '../../../context/AuthContext'; // <-- This was the missing import

export default function CreateServiceScreen() {
  const router = useRouter();
  const { token } = useAuth(); // <-- This was the missing hook call

  // State for each form field
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
        Alert.alert('Authentication Error', 'You must be logged in to post a service.');
        return;
    }
    if (!title || title.length < 5) {
      Alert.alert('Invalid Title', 'Please enter a title with at least 5 characters.');
      return;
    }
    if (!description || description.length < 5) {
      Alert.alert('Invalid Description', 'Please enter a description with at least 5 characters.');
      return;
    }
    if (isPaid && (!price || parseFloat(price) <= 0)) {
        Alert.alert('Invalid Price', 'Please enter a valid price for the paid service.');
        return;
    }
    
    setIsLoading(true);
    try {
      // Now the 'token' variable is correctly defined and passed to the service
      await createServicePost(token, {
        title,
        description,
        is_paid: isPaid,
        price: isPaid ? parseFloat(price) || 0 : undefined, // Ensure price is a number
        requirements: requirements ? requirements.split(',').map(req => req.trim()) : [],
        filters: [], // We are not using filters yet
      });
      
      Alert.alert('Success', 'Your service has been posted!', [
        { text: 'OK', onPress: () => router.back() }, // Go back to the services list
      ]);

    } catch (error: any) {
      Alert.alert('Error Posting Service', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      {/* This gives us a nice header for this specific screen */}
      <Stack.Screen options={{ title: 'Create a New Service' }} />

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={styles.header}>Service Details</Text>

        <TextInput
          label="Title (e.g., 'Need help with research paper')"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Full Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={5}
        />

        <View style={styles.switchContainer}>
          <Text variant="titleMedium">Is this a paid task?</Text>
          <Switch value={isPaid} onValueChange={setIsPaid} />
        </View>

        {isPaid && (
          <TextInput
            label="Price (₹)"
            value={price}
            onChangeText={setPrice}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
          />
        )}

        <TextInput
          label="Requirements (comma-separated)"
          placeholder="e.g., Proficient in LaTeX"
          value={requirements}
          onChangeText={setRequirements}
          mode="outlined"
          style={styles.input}
        />
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
        >
          Post Service
        </Button>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  header: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 8,
  },
  button: {
    marginTop: 20,
  },
});