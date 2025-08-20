// src/components/pooling/ActivePoolingView.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import ScreenWrapper from '../ScreenWrapper';
import AutocompleteInput from './AutocompleteInput'; // <-- IMPORT
import { AutocompleteSuggestion } from '../../services/locationService'; // <-- IMPORT TYPE

// --- PROPS ARE UPDATED ---
interface ActivePoolingViewProps {
  startLocation: string;
  onStartLocationChange: (text: string) => void;
  // We no longer need 'destination' and 'onDestinationChange'
  onPlaceSelected: (place: AutocompleteSuggestion) => void;
  onSearch: () => void;
  onGoToCollege: () => void;
  isSearchDisabled: boolean; // To disable button until destination is selected
}

export default function ActivePoolingView({
  startLocation,
  onStartLocationChange,
  onPlaceSelected,
  onSearch,
  onGoToCollege,
  isSearchDisabled,
}: ActivePoolingViewProps) {
  return (
    <ScreenWrapper style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>Your Location:</Text>
      <TextInput
        mode="outlined"
        value={startLocation}
        onChangeText={onStartLocationChange}
        style={styles.input}
      />

      <Text variant="titleMedium" style={styles.label}>Where to?</Text>
      
      {/* --- REPLACE TEXTINPUT WITH AUTOCOMPLETEINPUT --- */}
      <AutocompleteInput
        label="Enter destination"
        onPlaceSelected={onPlaceSelected}
      />
      
      <Button mode="outlined" onPress={onGoToCollege} style={styles.button}>
        Go to College
      </Button>

      <Button
        mode="contained"
        onPress={onSearch}
        style={styles.button}
        disabled={isSearchDisabled} // Use the new prop
      >
        Find Matches
      </Button>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', },
    label: { marginBottom: 5, marginLeft: 5, },
    input: { marginBottom: 20, },
    button: { marginTop: 10, },
});