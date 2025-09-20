// src/components/pooling/RideRequestSheet.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Portal, Modal } from 'react-native-paper';
import { AutocompleteSuggestion } from '../../services/locationService';
import AutocompleteInput from './AutocompleteInput';

interface RideRequestSheetProps {
  visible: boolean;
  onClose: () => void;
  startLocation: string;
  onPlaceSelected: (place: AutocompleteSuggestion) => void;
  onSearch: () => void;
  isSearchDisabled: boolean;
}

export default function RideRequestSheet({
  visible,
  onClose,
  startLocation,
  onPlaceSelected,
  onSearch,
  isSearchDisabled,
}: RideRequestSheetProps) {
  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
        <View style={styles.sheetContent}>
          <Text variant="headlineSmall" style={styles.title}>Plan your ride</Text>
          
          <TextInput
            mode="outlined"
            label="From"
            value={startLocation}
            disabled
            style={styles.input}
            left={<TextInput.Icon icon="map-marker-circle" />}
          />
          
          <AutocompleteInput
                      label="To? (Enter Destination)"
                      onPlaceSelected={onPlaceSelected} onSuggestionsChange={function (suggestions: AutocompleteSuggestion[]): void {
                          throw new Error('Function not implemented.');
                      } }          />
          
          <Button
            mode="contained"
            onPress={onSearch}
            disabled={isSearchDisabled}
            style={styles.button}
            contentStyle={{ paddingVertical: 8 }}
            labelStyle={{ fontSize: 18 }}
          >
            Find Matches
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
    flex: 1,
  },
  sheetContent: {
    backgroundColor: '#222', // Dark surface color for a modern look
    padding: 22,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
  },
});