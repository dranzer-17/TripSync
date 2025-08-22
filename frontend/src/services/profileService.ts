// src/services/profileService.ts

import apiClient from './api';

// This interface matches the Profile schema from our backend
export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  college_name: string;
  username?: string;
  phone_number?: string;
  bio?: string;
  year_of_study?: string;
  has_resume: boolean;
}

// This interface matches the ProfileUpdate schema
export interface ProfileUpdateData {
    username?: string;
    full_name?: string;
    phone_number?: string;
    bio?: string;
    year_of_study?: string;
}

export const getMyProfile = async (): Promise<UserProfile> => {
  try {
    const response = await apiClient.get('/profile/me');
    return response.data;
  } catch (error: any) {
    console.error('Get profile failed:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to fetch profile.');
  }
};

export const updateMyProfile = async (profileData: ProfileUpdateData): Promise<UserProfile> => {
    try {
        const response = await apiClient.put('/profile/me', profileData);
        return response.data;
    } catch (error: any) {
        console.error('Update profile failed:', error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || 'Failed to update profile.');
    }
};

/**
 * Uploads a profile image to the backend.
 * @param uri The local file URI of the image to upload.
 * @returns The updated user profile.
 */
export const uploadProfileImage = async (uri: string): Promise<UserProfile> => {
    // FormData is a special object for sending files in HTTP requests.
    const formData = new FormData();
    
    // Append the file to the form data.
    // The field name 'file' MUST match the parameter name in our FastAPI endpoint.
    formData.append('file', {
        uri,
        name: `profile_${Date.now()}.jpg`, // Create a unique filename
        type: 'image/jpeg',
    } as any); // The 'as any' cast is needed because React Native's FormData type is slightly different

    try {
        const response = await apiClient.post('/profile/me/image', formData, {
            headers: {
                // This header is crucial for file uploads
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        console.error('Image upload failed:', error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || 'Failed to upload image.');
    }
};