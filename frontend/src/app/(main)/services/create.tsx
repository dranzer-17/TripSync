import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme, Switch, Chip, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { useAuth } from '../../../context/AuthContext';
import { createServicePost, ServicePostCreateData } from '../../../services/servicesService';
import { CompensationType } from '../../../models/serviceModel';

const AVAILABLE_TAGS = ['Writing', 'Research', 'Python', 'Graphic Design', 'Tutoring', 'Marketing', 'Event Help', 'Data Entry', 'Video Editing'];

export default function CreateServiceScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { token } = useAuth();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamSize, setTeamSize] = useState('1');
  const [compensationType, setCompensationType] = useState<CompensationType>(CompensationType.VOLUNTEER);
  const [amount, setAmount] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [requiresResume, setRequiresResume] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // New, robust state management for the submission process
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);

  // This useEffect hook is the guaranteed fix.
  // It listens for changes in `submissionStatus` and reliably triggers the UI feedback.
  useEffect(() => {
    if (submissionStatus === 'success') {
      setShowSuccessSnackbar(true);
      // Navigate after a short delay to allow user to see the success message
      const timer = setTimeout(() => {
        router.back();
      }, 2000);
      
      // Reset status for the next time the user visits the page
      setSubmissionStatus('idle');
      
      return () => clearTimeout(timer);
    } else if (submissionStatus === 'error') {
      Alert.alert('Post Failed', errorMessage);
      // Reset status so the user can try again
      setSubmissionStatus('idle');
    }
  }, [submissionStatus, errorMessage, router]);

  const handleTagPress = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      if (prev.length < 5) {
        return [...prev, tag];
      }
      Alert.alert("Tag Limit", "You can select a maximum of 5 tags.");
      return prev;
    });
  };
  
  const validateForm = (): boolean => {
    if (title.trim().length < 5) { Alert.alert('Invalid Title', 'Please enter a title with at least 5 characters.'); return false; }
    if (description.trim().length < 15) { Alert.alert('Invalid Description', 'Please provide a more detailed description (at least 15 characters).'); return false; }
    if (teamSize.trim() === '' || parseInt(teamSize, 10) <= 0) { Alert.alert('Invalid Team Size', 'Please enter a number greater than zero for the team size.'); return false; }
    const isPaid = compensationType === CompensationType.FIXED_PRICE || compensationType === CompensationType.HOURLY_RATE;
    if (isPaid) {
      if (amount.trim() === '') { Alert.alert('Amount Required', 'Please enter a price or rate for this service.'); return false; }
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) { Alert.alert('Invalid Amount', 'Please enter a valid number greater than zero for the amount.'); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (submissionStatus === 'loading' || !token || !validateForm()) {
      return;
    }

    setSubmissionStatus('loading');

    const postData: ServicePostCreateData = {
      title: title.trim(),
      description: description.trim(),
      team_size: parseInt(teamSize, 10),
      deadline: undefined,
      compensation_type: compensationType,
      compensation_amount: (compensationType === 'fixed_price' || compensationType === 'hourly_rate') ? parseFloat(amount) : undefined,
      requires_resume: requiresResume,
      requires_cover_letter: true,
      is_anonymous: isAnonymous,
      tags: selectedTags,
    };

    try {
      await createServicePost(token, postData);
      // On success, we just update the state. The useEffect will handle the alert.
      setSubmissionStatus('success');

    } catch (error: any) {
      // On error, we update the state and store the message. useEffect will handle the alert.
      setErrorMessage(error.message || "An unexpected error occurred.");
      setSubmissionStatus('error');
    }
  };

  const ToggleButton = ({ label, selected, onPress }: { label: string, selected: boolean, onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.toggleButton, selected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
      onPress={onPress}
    >
      <Ionicons name={selected ? "checkmark-circle" : "ellipse-outline"} size={24} color={selected ? '#FFF' : theme.colors.primary} />
      <Text style={[styles.toggleButtonText, selected && { color: '#FFF' }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={styles.headerTitle}>Create a New Service</Text>
        <Text style={styles.headerSubtitle}>Fill out the details below to find the help you need.</Text>

        <Text style={styles.sectionTitle}>1. What do you need?</Text>
        <TextInput label="Service Title (e.g., 'Help with ML project')" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
        <TextInput label="Full Description" value={description} onChangeText={setDescription} mode="outlined" multiline numberOfLines={5} style={styles.input} />
        <TextInput
          label="Number of People Needed"
          value={teamSize}
          onChangeText={(text) => setTeamSize(text.replace(/[^0-9]/g, ''))}
          mode="outlined"
          keyboardType="number-pad"
          style={styles.input}
        />

        <Text style={styles.sectionTitle}>2. Compensation</Text>
        <View style={styles.compensationContainer}>
          <ToggleButton label="Volunteer" selected={compensationType === CompensationType.VOLUNTEER} onPress={() => setCompensationType(CompensationType.VOLUNTEER)} />
          <ToggleButton label="Fixed Price" selected={compensationType === CompensationType.FIXED_PRICE} onPress={() => setCompensationType(CompensationType.FIXED_PRICE)} />
          <ToggleButton label="Hourly Rate" selected={compensationType === CompensationType.HOURLY_RATE} onPress={() => setCompensationType(CompensationType.HOURLY_RATE)} />
        </View>
        {(compensationType === CompensationType.FIXED_PRICE || compensationType === CompensationType.HOURLY_RATE) && (
          <TextInput
            label="Amount (₹)"
            value={amount}
            onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
            mode="outlined"
            keyboardType="decimal-pad"
            style={styles.input}
          />
        )}

        <Text style={styles.sectionTitle}>3. Skills & Requirements</Text>
        <HelperText type="info" style={styles.subtitle}>Select up to 5 relevant tags.</HelperText>
        <View style={styles.chipContainer}>
          {AVAILABLE_TAGS.map(tag => (
             <Chip key={tag} mode="flat" selected={selectedTags.includes(tag)} onPress={() => handleTagPress(tag)} style={styles.chip}>{tag}</Chip>
          ))}
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Require applicants to submit a resume?</Text>
          <Switch value={requiresResume} onValueChange={setRequiresResume} color={theme.colors.primary} />
        </View>
        <View style={[styles.switchContainer, { borderBottomWidth: 1, borderBottomColor: '#EEE' }]}>
          <Text style={styles.switchLabel}>Post anonymously?</Text>
          <Switch value={isAnonymous} onValueChange={setIsAnonymous} color={theme.colors.primary} />
        </View>
        
        <Button 
          mode="contained" 
          onPress={handleSubmit} 
          loading={submissionStatus === 'loading'} 
          disabled={submissionStatus === 'loading'} 
          style={styles.button} 
          labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
          icon="arrow-right"
          contentStyle={{ flexDirection: 'row-reverse' }}
        >
          Post Your Service
        </Button>
      </ScrollView>
      
      <Snackbar
        visible={showSuccessSnackbar}
        onDismiss={() => setShowSuccessSnackbar(false)}
        duration={2000}
        style={{ backgroundColor: '#4CAF50' }}
        action={{
          label: 'View',
          onPress: () => {
            setShowSuccessSnackbar(false);
            router.back();
          },
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          ✓ Service posted successfully!
        </Text>
      </Snackbar>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 50 },
  headerTitle: { fontWeight: 'bold', textAlign: 'center', marginTop: 20 },
  headerSubtitle: { textAlign: 'center', color: '#6C757D', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 28, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#6A5AE0', paddingLeft: 12 },
  subtitle: { paddingLeft: 0, marginLeft: 0, marginTop: -8, marginBottom: 8 },
  input: { backgroundColor: '#FFFFFF', marginBottom: 12 },
  compensationContainer: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  toggleButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E9ECEF', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16, marginBottom: 10, flexBasis: '48.5%' },
  toggleButtonText: { marginLeft: 8, fontSize: 14, fontWeight: '500' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { marginRight: 8, marginBottom: 8 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#EEE' },
  switchLabel: { fontSize: 16, color: '#444' },
  button: { marginTop: 32, paddingVertical: 8, borderRadius: 30 },
});