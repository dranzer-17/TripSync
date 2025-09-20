// src/services/poolingService.ts

import { API_BASE_URL } from '../constants/config';

export interface RouteDetails {
  polyline: [number, number][]; // Array of [lng, lat] coordinates
  distance_meters: number;
  duration_seconds: number;
}

export interface RouteResponse {
  status: string;
  route: RouteDetails | null;
}

export interface MatchedUser {
  id: number;
  full_name: string;
  phone_number: string;
  current_location: {
    latitude: number;
    longitude: number;
  };
}

// Debug function to log coordinates
function logCoordinates(description: string, lat: number, lng: number) {
  console.log(`${description}: lat=${lat}, lng=${lng}`);
  
  // Validate coordinates
  if (!isFinite(lat) || !isFinite(lng)) {
    console.error(`Invalid coordinates - ${description}: lat=${lat}, lng=${lng}`);
    return false;
  }
  
  if (lat < -90 || lat > 90) {
    console.error(`Invalid latitude - ${description}: ${lat} (must be between -90 and 90)`);
    return false;
  }
  
  if (lng < -180 || lng > 180) {
    console.error(`Invalid longitude - ${description}: ${lng} (must be between -180 and 180)`);
    return false;
  }
  
  return true;
}

export async function getRouteDetails(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<RouteDetails> {
  console.log('Getting route details...');
  
  // Validate and log all coordinates
  const startValid = logCoordinates('Start', startLat, startLng);
  const endValid = logCoordinates('End', endLat, endLng);
  
  if (!startValid || !endValid) {
    throw new Error('Invalid coordinates provided');
  }

  // Get auth token
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const requestBody = {
    start_lat: startLat,
    start_lng: startLng,
    end_lat: endLat,
    end_lng: endLng,
  };

  console.log('Route request body:', requestBody);
  console.log('API URL:', `${API_BASE_URL}/api/map/route`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/map/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Get response text first for debugging
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      console.error('Route API error:', responseText);
      
      // Try to parse error message
      let errorDetail = 'Failed to get route details';
      try {
        const errorData = JSON.parse(responseText);
        errorDetail = errorData.detail || errorDetail;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }
      
      throw new Error(`Get route details API error: ${errorDetail}`);
    }

    // Parse the JSON response
    let data: RouteResponse;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error('Invalid JSON response from server');
    }

    console.log('Parsed response:', data);

    if (!data.route) {
      throw new Error('No route data in response');
    }

    // Validate the route data
    if (!Array.isArray(data.route.polyline)) {
      console.error('Invalid polyline data:', data.route.polyline);
      throw new Error('Invalid route polyline data');
    }

    if (data.route.polyline.length === 0) {
      console.error('Empty polyline data');
      throw new Error('Route polyline is empty');
    }

    console.log(`Route details received: ${data.route.distance_meters}m, ${data.route.duration_seconds}s, ${data.route.polyline.length} points`);

    return data.route;
  } catch (error) {
    console.error('Error in getRouteDetails:', error);
    
    // If it's already our custom error, re-throw it
    if (error instanceof Error) {
      throw error;
    }
    
    // For network errors or other unknown errors
    throw new Error(`Network error: ${error}`);
  }
}

export async function findNearbyPoolers(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<MatchedUser[]> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Authentication token not found');
  }

  console.log('Finding nearby poolers...');
  logCoordinates('Search start', startLat, startLng);
  logCoordinates('Search end', endLat, endLng);

  try {
    const response = await fetch(`${API_BASE_URL}/api/pooling/find-matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        start_lat: startLat,
        start_lng: startLng,
        end_lat: endLat,
        end_lng: endLng,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Find poolers API error:', errorText);
      throw new Error(`Find poolers API error: ${errorText}`);
    }

    const data = await response.json();
    console.log('Found poolers:', data);
    
    return data.matches || [];
  } catch (error) {
    console.error('Error finding nearby poolers:', error);
    throw error;
  }
}