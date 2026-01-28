import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the local network IP from Expo's manifest
const getLocalNetworkUrl = (): string => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    // Extract IP from hostUri (e.g., "192.168.7.24:8081" -> "192.168.7.24")
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:8080`;  // Unified Backend on port 8080
  }
  // Fallback for different platforms
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080'; // Android emulator
  }
  return 'http://localhost:8080'; // iOS simulator and web
};

// Central authority for environment-sensitive configuration.
const ENV_BASE: string | undefined = (globalThis as any).expo?.env?.EXPO_PUBLIC_API_BASE_URL || (typeof process !== 'undefined' ? (process as any).env?.EXPO_PUBLIC_API_BASE_URL : undefined);

// Use environment variable if set, otherwise auto-detect based on platform
const defaultUrl = getLocalNetworkUrl();
console.log('Using default API URL:', defaultUrl, 'Platform:', Platform.OS);

export const API_BASE: string = ENV_BASE || defaultUrl;
console.log('Final API_BASE_URL:', API_BASE);

// Single source of truth for privileged admin email.
export const ADMIN_EMAIL = 'admin@amraj.com';
