// Environment Configuration for Backend Integration

import { Platform } from 'react-native';

export const ENV_CONFIG = {
  // Backend API Configuration
  API: {
    // For local development
    LOCAL_URL: Platform.OS === 'android' 
      ? 'http://10.0.2.2:8081' // Android emulator
      : 'http://localhost:8081', // iOS simulator
    
    // For production (your deployed backend)
    PRODUCTION_URL: 'https://your-backend-url.com',
    
    // Toggle between local and production
    USE_PRODUCTION: false,
    
    TIMEOUT: 60000, // 60 seconds - increased for slower networks
  },

  // Feature Flags
  FEATURES: {
    USE_BACKEND_API: true, // Set to true to use Spring Boot backend
    USE_MOCK_DATA: false,  // Set to true for offline development
  },

  // Database Configuration
  DATABASE: {
    NAME: 'neondb',
    SSL_MODE: 'require',
  },
};

// Helper to get the current API URL
export const getApiUrl = (): string => {
  return ENV_CONFIG.API.USE_PRODUCTION 
    ? ENV_CONFIG.API.PRODUCTION_URL 
    : ENV_CONFIG.API.LOCAL_URL;
};

// Helper to check if using backend
export const isUsingBackend = (): boolean => {
  return ENV_CONFIG.FEATURES.USE_BACKEND_API;
};

// Helper to check if using mock data
export const isUsingMockData = (): boolean => {
  return ENV_CONFIG.FEATURES.USE_MOCK_DATA;
};

export default ENV_CONFIG;
