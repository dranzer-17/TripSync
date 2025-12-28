// src/app/(auth)/login.tsx

import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { Link, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import apiClient from '../../services/api'; // We'll use the base client
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  // State for input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    
    // The backend's /token endpoint expects 'x-www-form-urlencoded' data.
    // We create a URLSearchParams object to format the data correctly.
    const formData = new URLSearchParams();
    formData.append('username', email); // The API expects the email in the 'username' field
    formData.append('password', password);

    try {
      const response = await apiClient.post('/auth/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const accessToken = response.data.access_token;
      console.log('Login successful, token:', accessToken);

      await signIn(accessToken);

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Login',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#6200EE" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScreenWrapper style={styles.container}>
        <Text variant="headlineLarge" style={styles.title}>
          TripSync
        </Text>

      {/* Connect TextInputs to state */}
      <TextInput
        label="Email"
        mode="outlined"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        mode="outlined"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Connect Button to the handler and loading state */}
      <Button 
        mode="contained" 
        onPress={handleLogin} 
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Login
      </Button>
      
      <Link href="./register" asChild>
        <Button style={styles.button} disabled={loading}>
          Don't have an account? Sign Up
        </Button>
      </Link>
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        textAlign: 'center',
        marginBottom: 30,
    },
    input: {
        marginBottom: 15,
    },
    button: {
        marginTop: 10,
    },
    backButton: {
        marginLeft: 16,
        padding: 8,
    },
});
