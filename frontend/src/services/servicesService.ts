// src/services/servicesService.ts

import apiClient from './api';

// This interface matches the ProfileBase sub-schema from the backend
interface PosterProfile {
  full_name: string;
}

// This interface matches the ServicePostList schema from our backend
export interface ServicePost {
  description: string;
  id: number;
  title: string;
  poster_user_id: number; 
  is_paid: boolean;
  price?: number;
  status: string;
  created_at: string; // Dates will be strings in JSON
  poster: PosterProfile;
}
export interface ServicePostCreateData {
  title: string;
  description: string;
  is_paid: boolean;
  price?: number;
  requirements: string[];
  filters: { type: string; value: string }[];
}
export const getAllServicePosts = async (): Promise<ServicePost[]> => {
  try {
    const response = await apiClient.get('/services');
    return response.data;
  } catch (error: any) {
    console.error('Get all service posts failed:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to fetch services.');
  }
};

export const createServicePost = async (
  token: string, 
  postData: ServicePostCreateData
): Promise<ServicePost> => {
  try {
    const response = await apiClient.post('/services', postData, {
      headers: {
        // We must include the token to access this protected endpoint
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Create service post failed:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to post service.');
  }
};

export const deleteServicePost = async (token: string, postId: number): Promise<void> => {
  try {
    await apiClient.delete(`/services/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    console.error('Delete service post failed:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to delete post.');
  }
};