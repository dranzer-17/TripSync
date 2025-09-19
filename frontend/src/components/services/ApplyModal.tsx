import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Modal, Portal, Text, Button, TextInput } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { applyForService, ServiceApplicationCreateData, ServicePost } from '../../services/servicesService';

interface ApplyModalProps {
  visible: boolean;
  onDismiss: () => void;
  post: ServicePost; // Pass the entire post object
  onApplicationSuccess: () => void; // Callback for successful application
}

export default function ApplyModal({ visible, onDismiss, post, onApplicationSuccess }: ApplyModalProps) {
  const { token } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Authentication Error', 'You must be logged in to apply.');
      return;
    }
    if (post.requires_cover_letter && !coverLetter.trim()) {
      Alert.alert('Field Required', 'Please provide a message explaining why you are a good fit for this service.');
      return;
    }

    setIsLoading(true);
    try {
      const applicationData: ServiceApplicationCreateData = {
        cover_letter: coverLetter,
        // In a future version, we could add fields for resume_url and proposed_rate here
      };
      
      await applyForService(token, post.id, applicationData);
      
      // Use the success callback
      onApplicationSuccess();

    } catch (error: any) {
      Alert.alert('Application Failed', error.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when the modal is closed
  const handleDismiss = () => {
    setCoverLetter('');
    setIsLoading(false);
    onDismiss();
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Apply for "{post.title}"</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {post.requires_cover_letter 
            ? "The poster requires a cover letter for this service." 
            : "You can include an optional message to the poster."}
        </Text>
        
        <TextInput
          label="Your Message"
          value={coverLetter}
          onChangeText={setCoverLetter}
          mode="outlined"
          multiline
          numberOfLines={6}
          style={styles.input}
          placeholder="Introduce yourself and your skills..."
        />
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
        >
          Submit Application
        </Button>
        <Button
          onPress={handleDismiss}
          disabled={isLoading}
          style={styles.button}
        >
          Cancel
        </Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    padding: 24,
    margin: 20,
    borderRadius: 12,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 20,
    color: '#AEAEB2',
    lineHeight: 20,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});