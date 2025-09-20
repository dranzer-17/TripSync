// src/services/poolingService.ts

import apiClient from './api';

// --- INTERFACES / TYPES ---

interface PoolingRequestData {
  start_latitude: number;
  start_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  destination_name: string;
}

export interface PoolingMatchResponse {
  request_id: number;
  matches: MatchedUser[];
}

export interface MatchedUser {
  id: number;
  full_name: string;
  phone_number?: string;
  profile_image_url?: string;
}

interface RouteRequestData {
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
}

export interface RouteDetails {
  polyline: [number, number][];
  distance_meters: number;
  duration_seconds: number;
  is_fallback: boolean;
}

// --- NEW: A result type for our resilient function ---
export interface RouteResult {
  success: boolean;
  route: RouteDetails | null;
  error: string | null;
}


// --- API FUNCTIONS ---

export const createRequestAndFindMatches = async (
  token: string,
  requestData: PoolingRequestData
): Promise<PoolingMatchResponse> => {
  try {
    const response = await apiClient.post('/pool/requests', requestData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error('Pooling request API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to find matches.');
  }
};

// --- THIS IS THE DEFINITIVE FIX ---
// The function no longer throws an error for API failures.
// It always returns a RouteResult object.
export const getRouteDetails = async (
  token: string,
  routeData: RouteRequestData
): Promise<RouteResult> => {
  try {
    const response = await apiClient.post('/map/route', routeData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data?.status === 'success' && response.data?.route) {
      // On success, return a success object with the route data.
      return { success: true, route: response.data.route, error: null };
    } else {
      // If the server gives a weird success response, treat it as a failure.
      return { success: false, route: null, error: 'Invalid route response from server.' };
    }
  } catch (error: any) {
    // On any failure (404, 500, network error), return a failure object.
    const errorMessage = error.response?.data?.detail || 'Failed to calculate route.';
    return { success: false, route: null, error: errorMessage };
  }
};