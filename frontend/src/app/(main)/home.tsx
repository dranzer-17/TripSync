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
import { getAddressFromCoords, getPlaceDetails, AutocompleteSuggestion, PlaceDetails } from '../../services/locationService';

// --- Custom UI Components ---
import IdlePoolingView from '../../components/pooling/IdlePoolingView';
import ActivePoolingView from '../../components/pooling/ActivePoolingView';
import SearchingView from '../../components/pooling/SearchingView';
import MatchedUserCard from '../../components/pooling/MatchedUserCard';
import ScreenWrapper from '../../components/ScreenWrapper';

// Define the possible states for our screen's UI for clean state management
type ScreenState = 'idle' | 'active_search' | 'searching' | 'results';

export default function PoolingScreen() {
  // --- Hooks ---
  const { token } = useAuth(); // Get the user's authentication token
  const { location, errorMsg, getUserLocation } = useLocation(); // Hook for GPS functionality
  const { isConnected, match, error: wsError, connect, disconnect } = usePoolingSocket(token); // Hook for WebSocket

  // --- State Management ---
  const [screenState, setScreenState] = useState<ScreenState>('idle');
  const [startLocationName, setStartLocationName] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<PlaceDetails | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  
  // --- Effect to handle incoming matches from the WebSocket ---
  useEffect(() => {
    // This effect runs whenever the 'match' state from our WebSocket hook changes.
    if (match) {
      // A match was found and pushed by the server!
      console.log('WebSocket received a match:', match);
      // Add the new match to our existing list of matches
      setMatches(prevMatches => [...prevMatches, match]);
      setScreenState('results'); // Switch the UI to the results view
      disconnect(); // Disconnect the socket as we've found a match and our job is done
    }
  }, [match]); // Dependency array: only re-run when 'match' changes

  // --- Handler Functions ---

  /**
   * Called when the user presses the initial "Find Nearby Poolers" button.
   */
  const handleFindPoolersPress = async () => {
    setIsLoadingLocation(true);
    const userLocation = await getUserLocation(); // Fetch fresh GPS coordinates
    
    if (userLocation) {
      const address = await getAddressFromCoords(userLocation.coords);
      setStartLocationName(address);
      setScreenState('active_search'); // Move to the search form view
    } else if (errorMsg) {
      Alert.alert('Location Error', errorMsg);
    }
    setIsLoadingLocation(false);
  };

  /**
   * Called by the AutocompleteInput when a user selects a destination from the list.
   */
  const handlePlaceSelected = async (place: AutocompleteSuggestion) => {
    console.log('Selected Autocomplete Suggestion:', place);
    const details = await getPlaceDetails(place.place_id);
    if (details) {
      console.log('Fetched Place Details:', details);
      setSelectedDestination(details); // Store the full destination object
    } else {
      Alert.alert('Error', 'Could not fetch details for the selected location.');
    }
  };
  
  /**
   * Called when the user submits their search.
   * Connects to the WebSocket and sends the initial HTTP request.
   */
  const handleSearchSubmit = async () => {
    if (!location?.coords || !selectedDestination?.geometry?.location || !token) {
      Alert.alert('Error', 'Please select a valid destination.');
      return;
    }

    setScreenState('searching'); // Show the "Searching..." view
    connect(); // Initiate the WebSocket connection to listen for future matches

    try {
      const destinationCoords = selectedDestination.geometry.location;
      // This HTTP call starts the request and finds any IMMEDIATE matches
      const response = await createRequestAndFindMatches(token, {
        start_latitude: location.coords.latitude,
        start_longitude: location.coords.longitude,
        destination_latitude: destinationCoords.lat,
        destination_longitude: destinationCoords.lng,
        destination_name: selectedDestination.name,
      });

      if (response.matches.length > 0) {
        // An immediate match was found! No need to wait.
        setMatches(response.matches);
        setScreenState('results');
        disconnect(); // Disconnect as the search is over
      }
      // If no immediate matches, we stay on the 'searching' screen.
      // The WebSocket is now listening in the background for another user to create a match.

    } catch (error: any) {
      Alert.alert('Search Failed', error.message);
      setScreenState('active_search');
      disconnect(); // Disconnect on failure
    }
  };
  
  /**
   * Called from the "Searching..." view if the user cancels.
   */
  const handleCancelSearch = () => {
    disconnect(); // Disconnect the WebSocket
    // TODO: Call backend DELETE endpoint to cancel the PoolingRequest on the server
    console.log('Search cancelled by user.');
    setScreenState('idle'); // Reset the UI to the initial state
  };
  
  // --- Conditional Rendering Logic ---
  
  if (screenState === 'idle') {
    return <IdlePoolingView onFindPoolers={handleFindPoolersPress} isLoading={isLoadingLocation} />;
  }

  if (screenState === 'active_search') {
    return (
      <ActivePoolingView
        startLocation={startLocationName}
        onStartLocationChange={setStartLocationName}
        onPlaceSelected={handlePlaceSelected}
        onSearch={handleSearchSubmit}
        onGoToCollege={() => {
          // TODO: Implement "Go to College" logic
          console.log('Go to College pressed');
        }}
        isSearchDisabled={!selectedDestination}
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
          ListEmptyComponent={<Text>No active poolers were found nearby.</Text>}
        />
        <Button mode="contained" onPress={() => setScreenState('idle')} style={{ marginTop: 20 }}>
          Start a New Search
        </Button>
      </ScreenWrapper>
    );
  }

  // Fallback case, should not be reached
  return null;
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20 
  },
});