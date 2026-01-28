// API Configuration
// Update BASE_URL with your computer's IP address
// Find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)

export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.100:8080', // CHANGE THIS TO YOUR IP
  ENDPOINTS: {
    REVIEWS: '/api/customer/reviews',
  },
  TIMEOUT: 10000, // 10 seconds
};

// Alternative URLs to try if primary fails
export const FALLBACK_URLS = [
  'http://10.0.2.2:8080', // Android emulator
  'http://localhost:8080', // Local development
  'http://127.0.0.1:8080', // Localhost alternative
];