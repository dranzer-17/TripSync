// src/app/(auth)/register.tsx

import React, { useState } from 'react';
import { StyleSheet, Alert, TouchableOpacity, View } from 'react-native';
import { Text, TextInput, Button, Menu } from 'react-native-paper';
import { Link, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { register } from '../../services/authService';

// List of allowed colleges (must match backend)
const ALLOWED_COLLEGES = [
  'DJSCE',
  'SPIT',
  'VJTI',
  'KJ SOMAIYA COLLEGE OF ENGINEERING',
  'THAKUR COLLEGE OF ENGINEERING',
  'ST. FRANCIS COLLEGE OF ENGINEERING',
];

export default function RegisterScreen() {
  const router = useRouter();

  // State for each input field
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeName, setCollegeName] = useState('');
  
  // State for dropdown menu
  const [menuVisible, setMenuVisible] = useState(false);
  
  // State for loading indicator on the button
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Basic validation
    if (!fullName || !email || !password || !collegeName) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true); // Show loading spinner on the button
    try {
      await register({
        full_name: fullName,
        email: email,
        password: password,
        college_name: collegeName,
      });

      Alert.alert(
        'Success',
        'Your account has been created successfully!',
        [{ text: 'OK', onPress: () => router.push('./login') }] // Navigate on OK
      );

    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Sign Up',
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
          Create Account
        </Text>
      
      {/* Connect TextInput components to state */}
      <TextInput
        label="Full Name"
        mode="outlined"
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
      />
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
      
      {/* College Dropdown */}
      <View style={styles.dropdownContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <TextInput
                label="College Name"
                mode="outlined"
                style={styles.input}
                value={collegeName}
                editable={false}
                right={<TextInput.Icon icon="chevron-down" />}
                placeholder="Select your college"
              />
            </TouchableOpacity>
          }
          contentStyle={styles.menuContent}
        >
          {ALLOWED_COLLEGES.map((college) => (
            <Menu.Item
              key={college}
              onPress={() => {
                setCollegeName(college);
                setMenuVisible(false);
              }}
              title={college}
              titleStyle={styles.menuItem}
            />
          ))}
        </Menu>
      </View>

      {/* Connect Button to the handler function and loading state */}
      <Button 
        mode="contained" 
        style={styles.button}
        onPress={handleRegister}
        loading={loading}
        disabled={loading}
      >
        Sign Up
      </Button>

      <Link href="./login" asChild>
        <Button style={styles.button} disabled={loading}>
          Already have an account? Login
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
    dropdownContainer: {
        marginBottom: 15,
    },
    menuContent: {
        backgroundColor: '#FFFFFF',
        maxHeight: 300,
    },
    menuItem: {
        fontSize: 14,
    },
    button: {
        marginTop: 10,
    },
    backButton: {
        marginLeft: 16,
        padding: 8,
    },
});