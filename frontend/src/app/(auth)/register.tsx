// src/app/(auth)/register.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { Link } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function RegisterScreen() {
  return (
    <ScreenWrapper style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Create Account
      </Text>
      <TextInput
        label="Full Name"
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Email"
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        mode="outlined"
        style={styles.input}
        secureTextEntry
      />
      
      {/* --- ADD THIS NEW TEXTINPUT --- */}
      <TextInput
        label="College Name"
        mode="outlined"
        style={styles.input}
        autoCapitalize="words"
      />
      {/* ----------------------------- */}

      <Button mode="contained" style={styles.button}>
        Sign Up
      </Button>
      <Link href="./login" asChild>
        <Button style={styles.button}>
          Already have an account? Login
        </Button>
      </Link>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
    // ... styles remain the same
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