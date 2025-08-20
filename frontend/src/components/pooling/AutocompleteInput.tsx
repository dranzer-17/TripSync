// src/components/pooling/AutocompleteInput.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { TextInput, Text, List } from 'react-native-paper';
import debounce from 'lodash.debounce';
import { getAutocompleteSuggestions, AutocompleteSuggestion } from '../../services/locationService';

// Define the props our component needs
interface AutocompleteInputProps {
  label: string;
  onPlaceSelected: (place: AutocompleteSuggestion) => void;
}

export default function AutocompleteInput({ label, onPlaceSelected }: AutocompleteInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- THE DEBOUNCE LOGIC ---
  // Memoize the debounced function so it's not recreated on every render
  const debouncedFetchSuggestions = useMemo(
    () =>
      debounce(async (text: string) => {
        if (text.length < 3) {
          setSuggestions([]);
          return;
        }
        setIsLoading(true);
        const results = await getAutocompleteSuggestions(text);
        setSuggestions(results);
        setIsLoading(false);
      }, 300), // 300ms delay
    [] // Empty dependency array means this is created only once
  );
  // --------------------------

  const handleTextChange = (text: string) => {
    setQuery(text);
    debouncedFetchSuggestions(text);
  };

  const handleSuggestionPress = (suggestion: AutocompleteSuggestion) => {
    // Set the input text to the selected place and clear suggestions
    setQuery(suggestion.description);
    setSuggestions([]);
    // Pass the selected place data up to the parent screen
    onPlaceSelected(suggestion);
  };

  return (
    <View>
      <TextInput
        label={label}
        mode="outlined"
        value={query}
        onChangeText={handleTextChange}
        right={isLoading ? <TextInput.Icon icon="timer-sand" /> : null}
      />
      {suggestions.length > 0 && (
        <View style={styles.listContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <List.Item
                title={item.description}
                onPress={() => handleSuggestionPress(item)}
                left={() => <List.Icon icon="map-marker" />}
              />
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    // Basic styling for the dropdown
    backgroundColor: '#333', // A dark surface color
    borderRadius: 5,
    marginTop: 5,
    maxHeight: 200, // Limit the height of the dropdown
  },
});