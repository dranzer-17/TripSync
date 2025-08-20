// src/services/locationService.ts
import axios from 'axios';
import { OLA_MAPS_API_KEY } from '../constants/config';

const OLA_GEOCODE_API_URL = 'https://api.olamaps.io/places/v1/reverse-geocode';
// --- ADD THE NEW AUTOCOMPLETE API URL ---
const OLA_AUTOCOMPLETE_API_URL = 'https://api.olamaps.io/places/v1/autocomplete';
const OLA_PLACES_DETAILS_API_URL = 'https://api.olamaps.io/places/v1/details';

interface LatLng {
  latitude: number;
  longitude: number;
}

export interface PlaceDetails {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_address: string;
  name: string;
}
// This is the structure of a single suggestion from the OLA API
export interface AutocompleteSuggestion {
  place_id: string;
  description: string;
  // We can add more fields if needed, like structured_formatting
}

// (The getAddressFromCoords function is unchanged)
export const getAddressFromCoords = async ({ latitude, longitude }: LatLng): Promise<string> => {
  try {
    const response = await axios.get(OLA_GEOCODE_API_URL, {
      params: {
        latlng: `${latitude},${longitude}`,
        api_key: OLA_MAPS_API_KEY,
      },
    });

    if (response.data?.results?.length > 0) {
      return response.data.results[0].formatted_address;
    }
    
    // If API returns no results, provide a fallback
    return 'Unknown Location';

  } catch (error: any) {
    console.error('Reverse geocode failed:', error.response?.data || error.message);
    
    // --- THIS IS THE FIX ---
    // Return a fallback string on error to satisfy the Promise<string> return type
    const fallbackString = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
    return fallbackString;
    // -----------------------
  }
};

// --- ADD THE NEW AUTOCOMPLETE FUNCTION ---
export const getAutocompleteSuggestions = async (
  query: string,
  location?: LatLng // Optional: provide user's location for better, nearby results
): Promise<AutocompleteSuggestion[]> => {
  if (!query) {
    return []; // Return empty array if the search query is empty
  }

  const params: { input: string; api_key: string; latlng?: string } = {
    input: query,
    api_key: OLA_MAPS_API_KEY,
  };

  if (location) {
    params.latlng = `${location.latitude},${location.longitude}`;
  }

  try {
    const response = await axios.get(OLA_AUTOCOMPLETE_API_URL, { params });
    // The OLA API returns predictions in the 'predictions' field
    return response.data?.predictions || [];
  } catch (error: any) {
    console.error('Autocomplete failed:', error.response?.data || error.message);
    return []; // Return empty array on error
  }
};

export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
  try {
    const response = await axios.get(OLA_PLACES_DETAILS_API_URL, {
      params: {
        place_id: placeId,
        api_key: OLA_MAPS_API_KEY,
      },
    });
    // The details are in the 'result' field
    return response.data?.result || null;
  } catch (error: any) {
    console.error('Get place details failed:', error.response?.data || error.message);
    return null;
  }
};