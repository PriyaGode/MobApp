// API Service - Connects React Native frontend to Spring Boot backend
import { Platform } from 'react-native';

// Configuration
const API_CONFIG = {
  // For local development
  LOCAL_BASE_URL: Platform.OS === 'android' 
    ? 'http://10.0.2.2:8081' // Android emulator
    : 'http://localhost:8081', // iOS simulator
  
  // For production (your deployed backend)
  PRODUCTION_BASE_URL: 'https://your-backend-url.com',
  
  // Toggle between local and production
  USE_PRODUCTION: false,
  
  TIMEOUT: 60000, // 60 seconds - increased for slower networks
};

export const API_BASE_URL = API_CONFIG.USE_PRODUCTION 
  ? API_CONFIG.PRODUCTION_BASE_URL 
  : API_CONFIG.LOCAL_BASE_URL;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User types matching backend
export interface BackendUser {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface EmailOtpRequest {
  email: string;
  purpose: 'registration' | 'login' | 'password_reset';
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
  purpose: 'registration' | 'login' | 'password_reset';
}

/**
 * Base API class with common HTTP methods
 */
class ApiService {
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      if (!response.ok) {
        const errorData = isJson ? await response.json() : await response.text();
        console.error(`❌ API Error ${response.status}:`, errorData);
        
        return {
          success: false,
          error: typeof errorData === 'string' ? errorData : errorData.message || 'Request failed',
        };
      }

      const data = isJson ? await response.json() : await response.text();
      console.log(`✅ API Response:`, data);

      return {
        success: true,
        data,
      };

    } catch (error: any) {
      console.error('❌ API Request failed:', error);
      
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
        };
      }

      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers,
    });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/api/users');
      return response.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get service info
   */
  getServiceInfo() {
    return {
      baseUrl: API_BASE_URL,
      isProduction: API_CONFIG.USE_PRODUCTION,
      platform: Platform.OS,
    };
  }
}

// Singleton instance
export const apiService = new ApiService();

/**
 * User API endpoints
 */
export class UserApi {
  
  /**
   * Get all users
   */
  static async getAllUsers(): Promise<ApiResponse<BackendUser[]>> {
    return apiService.get<BackendUser[]>('/api/users');
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: number): Promise<ApiResponse<BackendUser>> {
    return apiService.get<BackendUser>(`/api/users/${id}`);
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<ApiResponse<BackendUser>> {
    return apiService.get<BackendUser>(`/api/users/email/${encodeURIComponent(email)}`);
  }

  /**
   * Create new user
   */
  static async createUser(userData: CreateUserRequest): Promise<ApiResponse<BackendUser>> {
    return apiService.post<BackendUser>('/api/users', userData);
  }

  /**
   * Update user
   */
  static async updateUser(id: number, userData: Partial<BackendUser>): Promise<ApiResponse<BackendUser>> {
    return apiService.put<BackendUser>(`/api/users/${id}`, userData);
  }

  /**
   * Delete user
   */
  static async deleteUser(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/api/users/${id}`);
  }

  /**
   * Login
   */
  static async login(credentials: LoginRequest): Promise<ApiResponse<{ user: BackendUser; token: string }>> {
    return apiService.post<{ user: BackendUser; token: string }>('/api/auth/login', credentials);
  }

  /**
   * Register
   */
  static async register(userData: CreateUserRequest): Promise<ApiResponse<{ user: BackendUser; token: string }>> {
    return apiService.post<{ user: BackendUser; token: string }>('/api/auth/register', userData);
  }
}

/**
 * Email OTP API endpoints
 */
export class EmailOtpApi {
  
  /**
   * Send email OTP
   */
  static async sendOtp(request: EmailOtpRequest): Promise<ApiResponse<{ expiresAt: string }>> {
    return apiService.post<{ expiresAt: string }>('/api/email-otp/send', request);
  }

  /**
   * Verify email OTP
   */
  static async verifyOtp(request: VerifyOtpRequest): Promise<ApiResponse<{ verified: boolean }>> {
    return apiService.post<{ verified: boolean }>('/api/email-otp/verify', request);
  }

  /**
   * Resend OTP
   */
  static async resendOtp(email: string, purpose: string): Promise<ApiResponse<{ expiresAt: string }>> {
    return apiService.post<{ expiresAt: string }>('/api/email-otp/resend', { email, purpose });
  }

  /**
   * Get OTP status
   */
  static async getOtpStatus(email: string, purpose: string): Promise<ApiResponse<{ hasPending: boolean; attemptsRemaining: number }>> {
    return apiService.get<{ hasPending: boolean; attemptsRemaining: number }>(
      `/api/email-otp/status?email=${encodeURIComponent(email)}&purpose=${purpose}`
    );
  }
}

export default apiService;
