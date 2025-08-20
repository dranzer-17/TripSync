// src/hooks/useLocation.ts
import { useState } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return null;
    }
    
    try {
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setErrorMsg(null); // Clear previous errors
      return currentLocation;
    } catch (error) {
      setErrorMsg('Failed to fetch location. Please ensure GPS is enabled.');
      return null;
    }
  };

  return { location, errorMsg, getUserLocation };
}