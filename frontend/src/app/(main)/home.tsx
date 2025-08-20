// src/app/(main)/home.tsx

import React, { useState, useEffect } from 'react';
import { Alert, FlatList, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

// --- Local Hooks & Context ---
import { useLocation } from '../../hooks/useLocation';
import { useAuth } from '../../context/AuthContext';
import { usePoolingSocket } from '../../hooks/usePoolingSocket';

// --- API Service Functions ---
import { createRequestAndFindMatches, MatchedUser } from '../../services/poolingService';
// We don't need Autocomplete types here yet, simplifying the import
import { getAddressFromCoords, getPlaceDetails, AutocompleteSuggestion, PlaceDetails } from '../../services/locationService';

// --- Custom UI Components ---
import IdlePoolingView from '../../components/pooling/IdlePoolingView';
import ActivePoolingView from '../../components/pooling/ActivePoolingView';
import SearchingView from '../../components/pooling/SearchingView'; // <-- IMPORT
import MatchedUserCard from '../../components/pooling/MatchedUserCard';
import ScreenWrapper from '../../components/ScreenWrapper';

// Define the possible states for our screen's UI
type ScreenState = 'idle' | 'active_search' | 'searching' | 'results';

export default function PoolingScreen() {
  const { token } = useAuth();
  const { location, errorMsg, getUserLocation } = useLocation();
  const { match, connect, disconnect } = usePoolingSocket(token);

  const [screenState, setScreenState] = useState<ScreenState>('idle');
  const [startLocationName, setStartLocationName] = useState('');
  const [destination, setDestination] = useState(''); // Keep this for now
  const [selectedDestination, setSelectedDestination] = useState<PlaceDetails | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [matches, setMatches] = useState<MatchedUser[]>([]);

  useEffect(() => {
    if (match) {
      setMatches(prev => [...prev, match]);
      setScreenState('results');
      disconnect();
    }
  }, [match]);

  const handleFindPoolersPress = async () => {
    setIsLoadingLocation(true);
    const userLocation = await getUserLocation();
    if (userLocation) {
      const address = await getAddressFromCoords(userLocation.coords);
      setStartLocationName(address);
      setScreenState('active_search');
    } else if (errorMsg) {
      Alert.alert('Location Error', errorMsg);
    }
    setIsLoadingLocation(false);
  };

  // THIS IS A TEMPORARY FUNCTION UNTIL WE ADD AUTOCOMPLETE
  const handlePlaceSelected = (place: AutocompleteSuggestion) => {
    // This will be replaced when we add the real autocomplete component
    setDestination(place.description);
  };
  
  const handleSearchSubmit = async () => {
    // For now, we simulate a selected destination
    if (!location?.coords || !destination || !token) {
      Alert.alert('Error', 'Please enter a destination.');
      return;
    }

    setScreenState('searching'); // <-- THIS IS THE KEY CHANGE
    connect();

    try {
      // We will use a placeholder destination until autocomplete is wired up
      const placeholderDestination = { lat: 19.1073, lng: 72.8371 };

      const response = await createRequestAndFindMatches(token, {
        start_latitude: location.coords.latitude,
        start_longitude: location.coords.longitude,
        destination_latitude: placeholderDestination.lat,
        destination_longitude: placeholderDestination.lng,
        destination_name: destination,
      });

      if (response.matches.length > 0) {
        setMatches(response.matches);
        setScreenState('results');
        disconnect();
      }
      // If no immediate match, we stay in the 'searching' state
    } catch (error: any) {
      Alert.alert('Search Failed', error.message);
      setScreenState('active_search');
      disconnect();
    }
  };
  
  const handleCancelSearch = () => {
    disconnect();
    setScreenState('idle');
  };
  
  // --- Conditional Rendering ---
  
  if (screenState === 'idle') {
    return <IdlePoolingView onFindPoolers={handleFindPoolersPress} isLoading={isLoadingLocation} />;
  }

  if (screenState === 'active_search') {
    // We are passing props to the OLD ActivePoolingView from your working code
    return (
      <ActivePoolingView
        startLocation={startLocationName}
        onStartLocationChange={setStartLocationName}
        onPlaceSelected={handlePlaceSelected} // This won't do anything yet
        onSearch={handleSearchSubmit}
        onGoToCollege={() => setDestination('College')}
        isSearchDisabled={!destination} // Simple check for now
      />
    );
  }

  if (screenState === 'searching') {
    return <SearchingView onCancel={handleCancelSearch} />;
  }

  if (screenState === 'results') {
    return (
      <ScreenWrapper style={styles.container}>
        <Text variant="headlineSmall" style={{ marginBottom: 20 }}>
          Found {matches.length} {matches.length === 1 ? 'Match' : 'Matches'}
        </Text>
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <MatchedUserCard user={item} />}
          ListEmptyComponent={<Text>No active poolers found nearby.</Text>}
        />
        <Button mode="contained" onPress={() => setScreenState('idle')} style={{ marginTop: 20 }}>
          Start a New Search
        </Button>
      </ScreenWrapper>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});