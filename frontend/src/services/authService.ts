// src/services/authService.ts

import apiClient from './api';

export interface RegisterData {
  email: string;
  full_name: string;
  password: string;
  college_name: string;
}

export const register = async (userData: RegisterData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error: any) { // It's good practice to type the error
    // Log the detailed error for debugging
    console.error('Registration API error:', error.response?.data || error.message);
    // Throw a user-friendly error message for the UI to catch
    throw new Error(error.response?.data?.detail || 'An unexpected error occurred.');
  }
};