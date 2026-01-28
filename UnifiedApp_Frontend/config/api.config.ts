// API Configuration - Unified Backend
export const API_CONFIG = {
  // Unified Backend (port 8080)
  BASE_URL: 'http:// 172.16.33.159:8080',

  
  // Production (uncomment when deploying)
  // BASE_URL: 'https://your-production-api.com',
  
  // Local development (use this for web browser testing)
  // BASE_URL: 'http://localhost:8080',
  
  // Android Emulator (use this if running on Android emulator)
  // BASE_URL: 'http://10.0.2.2:8080',
  
  // Network IP for iOS Simulator/Device (update with your machine's IP)
  // BASE_URL: 'http://172.16.217.9:8080',
  
  WEBSOCKET_URL: 'ws://localhost:8080/ws/tickets',
  // WEBSOCKET_URL: 'ws://10.0.2.2:8080/ws/tickets', // For Android emulator
  // WEBSOCKET_URL: 'ws://172.16.217.9:8080/ws/tickets', // For network IP
  
  // API Endpoints
  ENDPOINTS: {
    SUPPORT_TICKETS: '/api/support/tickets',
  },
  
  // Timeouts
  TIMEOUT: 30000, // 30 seconds
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export default API_CONFIG;
