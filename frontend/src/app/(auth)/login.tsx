// src/app/(auth)/login.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { Link } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';

// This is the required default export
export default function LoginScreen() {
  return (
    <ScreenWrapper style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        TripSync
      </Text>
      <TextInput
        label="Email"
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Password"
        mode="outlined"
        style={styles.input}
        secureTextEntry
      />
      <Button mode="contained" style={styles.button}>
        Login
      </Button>
      <Link href="./register" asChild>
        <Button style={styles.button}>
          Don't have an account? Sign Up
        </Button>
      </Link>
    </ScreenWrapper>
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
});