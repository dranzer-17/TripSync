import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Modal, Portal, Text, Button, TextInput, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { applyForService, ServiceApplicationCreateData, ServicePost } from '../../services/servicesService';
import { Ionicons } from '@expo/vector-icons';

interface ApplyModalProps {
  visible: boolean;
  onDismiss: () => void;
  post: ServicePost;
  onApplicationSuccess: () => void;
}

export default function ApplyModal({ visible, onDismiss, post, onApplicationSuccess }: ApplyModalProps) {
  const theme = useTheme();
  const { token } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Authentication Error', 'You must be logged in to apply.');
      return;
    }
    if (post.requires_cover_letter && coverLetter.trim().length < 10) {
      Alert.alert('Message Required', 'Please provide a brief message (at least 10 characters) explaining your interest.');
      return;
    }

    setIsLoading(true);
    try {
      const applicationData: ServiceApplicationCreateData = {
        cover_letter: coverLetter,
      };
      await applyForService(token, post.id, applicationData);
      onApplicationSuccess();
    } catch (error: any) {
      Alert.alert('Application Failed', error.message || 'An unknown error occurred.');
      // Only set loading to false on error, so the user can try again
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setCoverLetter('');
    setIsLoading(false);
    onDismiss();
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      padding: 24,
      margin: 20,
      borderRadius: 16,
      elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
      flex: 1, // Allow title to take up space
      fontSize: 22,
      fontWeight: 'bold',
      marginLeft: 12,
    },
    subtitle: {
      marginBottom: 20,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 20,
    },
    input: {
      marginBottom: 20,
      backgroundColor: theme.colors.background,
    },
    button: {
      marginTop: 10,
      borderRadius: 16,
    },
    buttonContent: {
        paddingVertical: 6,
    }
  });

  return (
    <Portal>
      <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <Ionicons name="document-text-outline" size={32} color={theme.colors.primary} />
            <Text style={styles.title}>Apply for Service</Text>
        </View>

        <Text style={styles.subtitle}>
          {post.requires_cover_letter 
            ? "The poster requires a message for this service." 
            : "You can include an optional message to the poster."}
        </Text>
        
        <TextInput
          label="Your Message / Cover Letter"
          value={coverLetter}
          onChangeText={setCoverLetter}
          mode="outlined"
          multiline
          numberOfLines={6}
          style={styles.input}
          placeholder="Introduce yourself and your relevant skills..."
        />
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
          contentStyle={styles.buttonContent}
          icon="send-outline"
        >
          Submit Application
        </Button>
        <Button
          onPress={handleDismiss}
          disabled={isLoading}
          style={styles.button}
          textColor={theme.colors.onSurfaceVariant}
        >
          Cancel
        </Button>
      </Modal>
    </Portal>
  );
}