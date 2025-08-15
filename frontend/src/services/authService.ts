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
    console.log("--- REGISTRATION SUCCESS ---");
    console.log("Response Data:", response.data);
    return response.data;
  } catch (error: any) {
    // --- DETAILED ERROR LOGGING ---
    console.error("--- REGISTRATION API CALL FAILED ---");
    if (error.response) {
      // The server responded with an error status (4xx or 5xx)
      console.error("Error Data:", error.response.data);
      console.error("Error Status:", error.response.status);
    } else if (error.request) {
      // The request was made, but no response was received (e.g., network error)
      console.error("No response received. Check your API server and network connection.");
      console.error("API Base URL:", apiClient.defaults.baseURL);
    } else {
      // Something else went wrong in setting up the request
      console.error('Error setting up request:', error.message);
    }
    // ---------------------------------
    
    // This is what the user will see in the Alert
    const errorMessage = error.response?.data?.detail || 'Network error or server is down. Please check your IP in constants/config.ts.';
    throw new Error(errorMessage);
  }
};