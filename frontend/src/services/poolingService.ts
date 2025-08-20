// src/services/poolingService.ts

import apiClient from './api';

// This matches the PoolingRequestCreate schema on the backend
interface PoolingRequestData {
  start_latitude: number;
  start_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  destination_name?: string;
}

// This matches the MatchedUser schema on the backend
export interface MatchedUser {
  id: number;
  full_name: string;
  phone_number?: string;
  profile_image_url?: string;
}

// This matches the PoolingMatchResponse schema on the backend
export interface PoolingMatchResponse {
  request_id: number;
  matches: MatchedUser[];
}

export const createRequestAndFindMatches = async (
  token: string,
  requestData: PoolingRequestData
): Promise<PoolingMatchResponse> => {
  try {
    const response = await apiClient.post('/pool/requests', requestData, {
      headers: {
        // This is how we send our JWT for protected endpoints
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Pooling request API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to find matches.');
  }
};