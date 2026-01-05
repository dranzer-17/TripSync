// src/components/pooling/LocationSearchModal.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Modal, Portal, IconButton, List, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import AutocompleteInput from './AutocompleteInput';
import { AutocompleteSuggestion } from '../../services/locationService';

interface LocationSearchModalProps {
  visible: boolean;
  onDismiss: () => void;
  pickupLocationName: string;
  onPlaceSelected: (place: AutocompleteSuggestion) => void;
}

export default function LocationSearchModal({
  visible,
  onDismiss,
  pickupLocationName,
  onPlaceSelected,
}: LocationSearchModalProps) {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);

  const handleSuggestionPress = (suggestion: AutocompleteSuggestion) => {
    console.log('Suggestion pressed:', suggestion);
    setSuggestions([]);
    onPlaceSelected(suggestion);
    // Modal will be closed by the parent (handlePlaceSelected calls setIsSearchModalVisible(false))
  };

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={onDismiss} 
        contentContainerStyle={styles.modal}
        style={styles.modalWrapper}
      >
        {/* We use SafeAreaView as the primary container */}
        <SafeAreaView style={styles.container}>
          
          {/* --- HEADER: Contains the close button and the inputs --- */}
          <View style={styles.header}>
            <IconButton icon="arrow-left" size={28} onPress={onDismiss} style={styles.closeButton} />
            
            {/* Input container with a cleaner visual style */}
            <View style={styles.inputContainer}>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={20} color="#3498db" />
                <Text style={styles.locationText} numberOfLines={1}>{pickupLocationName}</Text>
              </View>
              <View style={styles.divider} />
              {/* The AutocompleteInput is now part of this clean header */}
              <AutocompleteInput
                label="" // We no longer need the floating label
                onPlaceSelected={onPlaceSelected}
                onSuggestionsChange={setSuggestions}
              />
            </View>
          </View>

          {/* --- BODY: The suggestion list takes up all remaining space --- */}
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <List.Item
                title={item.description}
                description={item.structured_formatting?.secondary_text} // Show secondary text if available
                onPress={() => handleSuggestionPress(item)}
                left={() => <List.Icon icon="map-marker-outline" style={{ justifyContent: 'center' }} />}
              />
            )}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
          />
        </SafeAreaView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    justifyContent: 'flex-end', // This positions the modal at the bottom
  },
  modal: {
    height: '60%', // Only take up 60% of the screen height
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  container: {
    flex: 1, // Let SafeAreaView control the whole modal space
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    marginRight: 0,
  },
  inputContainer: {
    flex: 1, // Allow the input container to take up the row's width
    paddingVertical: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    height: 40, // Give a fixed height for stability
  },
  locationText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
    marginLeft: 40,
  },
  list: {
    flex: 1, // Take up remaining space
  },
});