export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://10.229.23.6:8000/api"; 
export const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_BASE_URL || "ws://10.229.23.6:8000/api";
export const OLA_MAPS_API_KEY = process.env.EXPO_PUBLIC_OLA_MAPS_API_KEY || "";

// For future production use, you would swap to this:
// export const API_BASE_URL = "https://your-deployed-api.com/api";
// export const WS_BASE_URL = "wss://your-deployed-api.com/api";