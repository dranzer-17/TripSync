// src/components/pooling/AutocompleteInput.tsx
import React, { useState, useMemo } from 'react';
import { TextInput } from 'react-native-paper';
import debounce from 'lodash.debounce';
import { getAutocompleteSuggestions, AutocompleteSuggestion } from '../../services/locationService';

interface AutocompleteInputProps {
  label: string;
  onPlaceSelected: (place: AutocompleteSuggestion) => void;
  onSuggestionsChange: (suggestions: AutocompleteSuggestion[]) => void;
}

export default function AutocompleteInput({
  label,
  onPlaceSelected,
  onSuggestionsChange,
}: AutocompleteInputProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const debouncedFetchSuggestions = useMemo(
    () =>
      debounce(async (text: string) => {
        if (text.length < 3) {
          onSuggestionsChange([]); // Inform parent to clear suggestions
          setIsLoading(false);
          return;
        }
        setIsLoading(true);
        try {
          const results = await getAutocompleteSuggestions(text);
          onSuggestionsChange(results); // Pass results to parent
        } catch (error) {
          console.error('Error fetching autocomplete suggestions:', error);
          onSuggestionsChange([]);
        } finally {
          setIsLoading(false);
        }
      }, 300),
    [onSuggestionsChange]
  );

  const handleTextChange = (text: string) => {
    setQuery(text);
    debouncedFetchSuggestions(text);
  };
  
  return (
    <TextInput
      label={label}
      mode="outlined"
      value={query}
      onChangeText={handleTextChange}
      right={isLoading ? <TextInput.Icon icon="timer-sand" /> : null}
      autoFocus={true} 
      placeholder="Enter a destination..."
      style={{ marginHorizontal: 8 }}
    />
  );
}