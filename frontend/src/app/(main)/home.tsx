// src/app/(main)/home.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from 'expo-router';

// --- Local Hooks & Context ---
import { useLocation } from '../../hooks/useLocation';
import { useAuth } from '../../context/AuthContext';
import { usePoolingSocket } from '../../hooks/usePoolingSocket';

// --- API Service Functions & Types ---
import {
  getAddressFromCoords,
  getPlaceDetails,
  AutocompleteSuggestion,
  PlaceDetails
} from '../../services/locationService';
import {
  getRouteDetails,
  RouteDetails,
  MatchedUser,
  createRequestAndFindMatches,
  RouteResult // Import the resilient result type
} from '../../services/poolingService';

// --- UI Components ---
import OlaMapWebView from '../../components/pooling/OlaMapWebView';
import MapInterface from '../../components/pooling/MapInterface';
import LocationSearchModal from '../../components/pooling/LocationSearchModal';
import RouteConfirmationCard from '../../components/pooling/RouteConfirmationCard';
import SearchingOverlay from '../../components/pooling/SearchingOverlay';
import MatchFoundModal from '../../components/pooling/MatchFoundModal';

type ScreenState = 'idle' | 'confirming_route' | 'searching' | 'results';
type MapPitch = 60 | 0;

export default function PoolingScreen() {
  const { token } = useAuth();
  const { location: liveLocation, getUserLocation } = useLocation();
  const { match, connect, disconnect } = usePoolingSocket(token);

  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [screenState, setScreenState] = useState<ScreenState>('idle');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupLocationName, setPickupLocationName] = useState('Setting pickup location...');
  const [selectedDestination, setSelectedDestination] = useState<PlaceDetails | null>(null);
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  const [mapPitch, setMapPitch] = useState<MapPitch>(60);

  const webViewRef = useRef<WebView>(null);
  const isMapReady = useRef(false);

  // --- Map and Location Logic ---

  const handleMapReady = useCallback(() => {
    isMapReady.current = true;
    (async () => {
      const userLocation = await getUserLocation();
      if (userLocation) {
        const coords = { lat: userLocation.coords.latitude, lng: userLocation.coords.longitude };
        flyTo(coords);
      } else {
        Alert.alert("Location Error", "Could not get your location. Please enable location services.");
      }
    })();
  }, [getUserLocation]);

  const flyTo = (coords: { lat: number; lng: number }) => {
    if (isMapReady.current && webViewRef.current) {
      webViewRef.current.injectJavaScript(`window.flyTo({ lat: ${coords.lat}, lng: ${coords.lng} }); true;`);
    }
  };

  const handleRecenter = () => {
    if (liveLocation) {
      flyTo({ lat: liveLocation.coords.latitude, lng: liveLocation.coords.longitude });
    } else {
        Alert.alert("Can't Recenter", "Your current location is not available yet.");
    }
  };

  const toggleMapPitch = () => {
    const newPitch = mapPitch === 60 ? 0 : 60;
    setMapPitch(newPitch);
    if (isMapReady.current && webViewRef.current) {
        webViewRef.current.injectJavaScript(`window.setMapPitch(${newPitch}); true;`);
    }
  };

  const handleMapCenterChange = useCallback((coords: { lat: number; lng: number }) => {
    setMapCenter(coords);
  }, []);

  useEffect(() => {
    const debounceTimeout = setTimeout(async () => {
      if (mapCenter && screenState === 'idle') {
        const address = await getAddressFromCoords({ latitude: mapCenter.lat, longitude: mapCenter.lng });
        setPickupLocationName(address);
      }
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [mapCenter, screenState]);
  
  // --- Ride Logic ---

  const handlePlaceSelected = async (place: AutocompleteSuggestion) => {
    setIsSearchModalVisible(false);

    const details = await getPlaceDetails(place.place_id);
    if (!details || !mapCenter || !token) {
        Alert.alert("Error", "Could not get details for the selected location.");
        return;
    }

    setSelectedDestination(details);
    const destinationCoords = details.geometry.location;
    
    // Use the resilient getRouteDetails function
    const result: RouteResult = await getRouteDetails(token, {
      start_lat: mapCenter.lat,
      start_lng: mapCenter.lng,
      end_lat: destinationCoords.lat,
      end_lng: destinationCoords.lng
    });

    if (result.success && result.route) {
      // If the API call was successful, store the route and draw it
      setRouteDetails(result.route);
      const polylineString = JSON.stringify(result.route.polyline);
      webViewRef.current?.injectJavaScript(`window.drawRoute(${polylineString}); true;`);
    } else {
      // If the API call failed, log the error silently and proceed without a route
      console.log("Could not fetch route, proceeding without it:", result.error);
      setRouteDetails(null);
    }
    
    // Always add destination marker and move to confirmation screen
    webViewRef.current?.injectJavaScript(`window.addOrUpdateDestinationMarker({lat: ${destinationCoords.lat}, lng: ${destinationCoords.lng}}); true;`);
    setScreenState('confirming_route');
  };

  const handleConfirmAndFindMatches = async () => {
    if (!mapCenter || !selectedDestination || !token) {
        Alert.alert('Error', 'Missing trip details. Please start over.');
        return;
    }
    setScreenState('searching');
    connect();

    try {
        const destCoords = selectedDestination.geometry.location;
        const response = await createRequestAndFindMatches(token, {
            start_latitude: mapCenter.lat,
            start_longitude: mapCenter.lng,
            destination_latitude: destCoords.lat,
            destination_longitude: destCoords.lng,
            destination_name: selectedDestination.name,
        });

        if (response.matches.length > 0) {
            setMatches(response.matches);
            setScreenState('results');
            disconnect();
        }
    } catch (error: any) {
        Alert.alert('Search Failed', error.message);
        setScreenState('confirming_route');
        disconnect();
    }
  };
  
  const handleNewSearch = () => {
    setScreenState('idle');
    setSelectedDestination(null);
    setRouteDetails(null);
    setMatches([]);
    if (isMapReady.current && webViewRef.current) {
        webViewRef.current.injectJavaScript('window.clearRoute(); true;');
        webViewRef.current.injectJavaScript('window.clearDestinationMarker(); true;');
    }
  };

  useFocusEffect(
    useCallback(() => {
      handleNewSearch();
    }, [])
  );

  useEffect(() => {
    if (match) {
      setMatches(prevMatches => {
        const isAlreadyMatched = prevMatches.some(prevMatch => prevMatch.id === match.id);
        if (isAlreadyMatched) {
          return prevMatches;
        }
        return [...prevMatches, match];
      });
      setScreenState('results');
      disconnect();
    }
  }, [match, disconnect]);

  // --- RENDER ---
  return (
    <View style={styles.container}>
      <OlaMapWebView
        ref={webViewRef}
        onMapReady={handleMapReady}
        onMapCenterChange={handleMapCenterChange}
      />

      {(screenState === 'idle' || screenState === 'confirming_route') && (
        <MapInterface
          pickupLocationName={pickupLocationName}
          destinationName={selectedDestination?.name}
          onWhereToPress={() => setIsSearchModalVisible(true)}
          onRecenterPress={handleRecenter}
          onTogglePitch={toggleMapPitch}
          mapPitch={mapPitch}
        />
      )}
      
      <LocationSearchModal
        visible={isSearchModalVisible}
        onDismiss={() => setIsSearchModalVisible(false)}
        pickupLocationName={pickupLocationName}
        onPlaceSelected={handlePlaceSelected}
      />

      {screenState === 'confirming_route' && selectedDestination && (
        <RouteConfirmationCard
          destinationName={selectedDestination.name}
          routeDetails={routeDetails}
          onConfirm={handleConfirmAndFindMatches}
          onCancel={handleNewSearch}
        />
      )}

      <SearchingOverlay
        visible={screenState === 'searching'}
        onCancel={() => {
          disconnect();
          handleNewSearch();
        }}
      />
      
      <MatchFoundModal
        visible={screenState === 'results'}
        matches={matches}
        onNewSearch={handleNewSearch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});