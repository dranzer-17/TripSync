// src/services/locationService.ts
import axios from 'axios';
import { OLA_MAPS_API_KEY } from '../constants/config';

const OLA_GEOCODE_API_URL = 'https://api.olamaps.io/places/v1/reverse-geocode';
const OLA_AUTOCOMPLETE_API_URL = 'https://api.olamaps.io/places/v1/autocomplete';
const OLA_PLACES_DETAILS_API_URL = 'https://api.olamaps.io/places/v1/details';

interface LatLng {
  latitude: number;
  longitude: number;
}

// Interface for a suggestion from the Autocomplete API (has no coordinates)
export interface AutocompleteSuggestion {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

// Interface for the response from the Place Details API (has coordinates)
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

// Function 1: Gets address from coordinates (unchanged)
export const getAddressFromCoords = async ({ latitude, longitude }: LatLng): Promise<string> => {
  try {
    const response = await axios.get(OLA_GEOCODE_API_URL, {
      params: { latlng: `${latitude},${longitude}`, api_key: OLA_MAPS_API_KEY },
    });
    if (response.data?.results?.length > 0) {
      return response.data.results[0].formatted_address;
    }
    return 'Unknown Location';
  } catch (error: any) {
    console.error('Reverse geocode failed:', error.response?.data || error.message);
    return `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
  }
};

// Function 2: Gets a list of suggestions (unchanged)
export const getAutocompleteSuggestions = async (query: string): Promise<AutocompleteSuggestion[]> => {
  if (!query || query.length < 3) return [];
  try {
    console.log('Calling autocomplete API with query:', query);
    const response = await axios.get(OLA_AUTOCOMPLETE_API_URL, {
      params: { input: query, api_key: OLA_MAPS_API_KEY },
    });
    console.log('Autocomplete API response:', response.data);
    return response.data?.predictions || [];
  } catch (error: any) {
    console.error('Autocomplete failed:', error.response?.data || error.message);
    return [];
  }
};

// --- Function 3: THE CRITICAL MISSING PIECE ---
// This function takes a place_id and returns the full details, including coordinates.
export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
  if (!placeId) {
    console.error('getPlaceDetails called with empty place_id');
    return null;
  }
  try {
    console.log('Calling place details API with place_id:', placeId);
    const response = await axios.get(OLA_PLACES_DETAILS_API_URL, {
      params: {
        place_id: placeId,
        api_key: OLA_MAPS_API_KEY,
      },
    });
    console.log('Place details API response status:', response.data?.status);
    console.log('Place details API full response:', JSON.stringify(response.data, null, 2));
    
    const result = response.data?.result;
    if (!result) {
      console.error('No result in place details response');
      return null;
    }
    
    // Validate that we have the required geometry data
    if (!result.geometry || !result.geometry.location) {
      console.error('Missing geometry or location in result:', result);
      return null;
    }
    
    console.log('Successfully parsed place details:', {
      name: result.name,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng
    });
    
    return result;
  } catch (error: any) {
    console.error('Get place details failed:', error.response?.data || error.message);
    return null;
  }
};