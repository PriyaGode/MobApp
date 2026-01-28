import { Platform } from 'react-native';
import { API_BASE } from '../services/apiBase';

// Use the unified backend with admin prefix for superadmin features
const getApiBaseUrl = () => {
  console.log('Platform.OS:', Platform.OS);
  console.log('typeof window:', typeof window);
  
  // Use the unified backend base URL with admin prefix
  const adminApiUrl = `${API_BASE}/api/admin`;
  console.log('Using unified admin API URL:', adminApiUrl, 'Platform:', Platform.OS);
  return adminApiUrl;
};

export const API_BASE_URL = getApiBaseUrl();
console.log('Final API_BASE_URL:', API_BASE_URL);
