// React Native Database Service
// This service provides a mock implementation for React Native since direct database connections are not supported

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailVerification {
  id: number;
  email: string;
  code: string;
  purpose: string;
  expires_at: string;
  attempts: number;
  verified: boolean;
  created_at: string;
}

export class DatabaseService {
  
  private static readonly API_BASE_URL = 'https://your-backend-api.com';
  private static readonly IS_DEVELOPMENT = true; // Change to false for production
  
  // Mock storage for development
  private static mockEmailVerifications: any[] = [];
  private static mockUsers: any[] = [];
  
  /**
   * Initialize database connection (mock implementation for React Native)
   */
  static async initialize(): Promise<void> {
    try {
      if (this.IS_DEVELOPMENT) {
        console.log(' [MOCK DATABASE] Initializing database service...');
        
        // Simulate database initialization delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log(' [MOCK DATABASE] Database service initialized');
        console.log(' [MOCK DATABASE] Tables: users, email_verifications');
        console.log('[MOCK DATABASE] Connection pool ready');
        
        // Initialize mock tables
        await this.initializeTables();
        return;
      }

      // Production mode - test API connection
      try {
        const response = await fetch(`${this.API_BASE_URL}/api/database/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API Health Check Failed: ${response.status}`);
        }

        console.log(' Database API connection established');
        
      } catch (apiError) {
        console.error(' Database API connection failed:', apiError);
        console.log(' Falling back to mock database for development');
      }
      
    } catch (error) {
      console.error(' Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Execute a query with parameters (mock implementation)
   */
  static async query(text: string, params?: any[]): Promise<any> {
    try {      
      if (this.IS_DEVELOPMENT) {
        console.log('📊 [MOCK DATABASE] Executing query:', text.substring(0, 100) + '...');
        console.log('📊 [MOCK DATABASE] Parameters:', params);
        
        // Simulate query execution time
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return this.handleMockQuery(text, params || []);
      }

      // Production mode - call API
      const response = await fetch(`${this.API_BASE_URL}/api/database/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: text,
          params: params || []
        }),
      });

      if (!response.ok) {
        throw new Error(`Database API Error: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('❌ Database query failed:', error);
      throw error;
    }
  }

  /**
   * Execute a transaction (mock implementation)
   */
  static async transaction<T>(
    callback: (client: any) => Promise<T>
  ): Promise<T> {
    try {      
      if (this.IS_DEVELOPMENT) {
        console.log('📊 [MOCK DATABASE] Starting transaction...');
        
        const mockClient = {
          query: this.query.bind(this)
        };
        
        const result = await callback(mockClient);
        
        console.log('✅ [MOCK DATABASE] Transaction completed');
        return result;
      }

      // Production mode - execute callback with API client
      const mockClient = {
        query: this.query.bind(this)
      };

      return await callback(mockClient);

    } catch (error) {
      console.error('❌ Database transaction failed:', error);
      throw error;
    }
  }

  /**
   * Initialize database tables (mock implementation)
   */
  static async initializeTables(): Promise<void> {
    try {      
      if (this.IS_DEVELOPMENT) {
        console.log('🔄 [MOCK DATABASE] Initializing tables...');
        
        // Simulate table creation time
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ [MOCK DATABASE] Table "users" ready');
        console.log('✅ [MOCK DATABASE] Table "email_verifications" ready');
        console.log('🔍 [MOCK DATABASE] Indexes created');
        
        // Clean up expired verifications
        await this.cleanupExpiredVerifications();
        return;
      }

      // Production mode - call API
      const response = await fetch(`${this.API_BASE_URL}/api/database/init-tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Table Initialization API Error: ${response.status}`);
      }

      console.log('✅ Database tables initialized via API');
      
    } catch (error) {
      console.error('❌ Failed to initialize database tables:', error);
      // Don't throw in development mode
      if (!this.IS_DEVELOPMENT) {
        throw error;
      }
    }
  }

  /**
   * Clean up expired email verifications
   */
  static async cleanupExpiredVerifications(): Promise<void> {
    try {      
      if (this.IS_DEVELOPMENT) {
        const expiredCount = Math.floor(Math.random() * 5);
        console.log(`🧹 [MOCK DATABASE] Cleaned up ${expiredCount} expired verifications`);
        return;
      }

      const response = await fetch(`${this.API_BASE_URL}/api/database/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`🧹 Cleaned up ${result.deletedCount || 0} expired verifications`);
      }
      
    } catch (error) {
      console.error('❌ Failed to cleanup expired verifications:', error);
    }
  }

  /**
   * Close database connection (no-op in React Native)
   */
  static async close(): Promise<void> {
    if (this.IS_DEVELOPMENT) {
      console.log('✅ [MOCK DATABASE] Connection closed');
    }
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<boolean> {
    try {      
      if (this.IS_DEVELOPMENT) {
        console.log('💚 [MOCK DATABASE] Health check - OK');
        return true;
      }

      const response = await fetch(`${this.API_BASE_URL}/api/database/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;

    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get service information
   */
  static getServiceInfo(): {
    mode: 'development' | 'production';
    provider: 'mock' | 'api';
    apiUrl?: string;
  } {
    return {
      mode: this.IS_DEVELOPMENT ? 'development' : 'production',
      provider: this.IS_DEVELOPMENT ? 'mock' : 'api',
      apiUrl: this.IS_DEVELOPMENT ? undefined : this.API_BASE_URL
    };
  }

  /**
   * Handle mock database queries for development
   */
  private static handleMockQuery(text: string, params: any[]): any {
    const query = text.trim().toUpperCase();
    
    console.log('🔍 [MOCK DATABASE] Full query:', text);
    console.log('🔍 [MOCK DATABASE] Query uppercase:', query);
    console.log('🔍 [MOCK DATABASE] Contains email_verifications?', query.includes('EMAIL_VERIFICATIONS'));
    
    // Handle email_verifications table queries
    if (query.includes('EMAIL_VERIFICATIONS')) {
      
      // INSERT email verification
      if (query.includes('INSERT INTO EMAIL_VERIFICATIONS')) {
        const [email, code, purpose, expires_at, device_id] = params;
        const newVerification = {
          id: Math.floor(Math.random() * 1000) + 1,
          email,
          code,
          purpose,
          expires_at,
          device_id,
          attempts: 0,
          is_used: false,
          created_at: new Date().toISOString()
        };
        
        // Remove any existing verification for this email/purpose
        this.mockEmailVerifications = this.mockEmailVerifications.filter(
          v => !(v.email === email && v.purpose === purpose)
        );
        
        this.mockEmailVerifications.push(newVerification);
        
        console.log('📊 [MOCK DATABASE] Stored verification:', { email, code, purpose });
        console.log('📊 [MOCK DATABASE] Total verifications after insert:', this.mockEmailVerifications.length);
        
        return { rows: [{ id: newVerification.id }], rowCount: 1 };
      }
      
      // SELECT email verification
      if (query.includes('SELECT') && query.includes('WHERE EMAIL =')) {
        const email = params[0];
        const purpose = params[1];
        
        console.log('📊 [MOCK DATABASE] Searching for verification:', { email, purpose });
        console.log('📊 [MOCK DATABASE] Available verifications:', this.mockEmailVerifications.map(v => ({
          email: v.email,
          purpose: v.purpose,
          code: v.code,
          is_used: v.is_used,
          expired: new Date(v.expires_at) <= new Date()
        })));
        
        const verification = this.mockEmailVerifications.find(v => 
          v.email === email && 
          v.purpose === purpose && 
          !v.is_used &&
          new Date(v.expires_at) > new Date()
        );
        
        if (verification) {
          console.log('📊 [MOCK DATABASE] Found verification:', { email, code: verification.code });
          return { rows: [verification], rowCount: 1 };
        } else {
          console.log('📊 [MOCK DATABASE] No valid verification found for:', { email, purpose });
          console.log('📊 [MOCK DATABASE] Total verifications in storage:', this.mockEmailVerifications.length);
          return { rows: [], rowCount: 0 };
        }
      }
      
      // UPDATE email verification (mark as used or increment attempts)
      if (query.includes('UPDATE EMAIL_VERIFICATIONS')) {
        const verificationId = params[params.length - 1]; // ID is usually the last parameter
        
        const verification = this.mockEmailVerifications.find(v => v.id === verificationId);
        if (verification) {
          if (query.includes('IS_USED = TRUE')) {
            verification.is_used = true;
            console.log('📊 [MOCK DATABASE] Marked verification as used:', verificationId);
          } else if (query.includes('ATTEMPTS = ATTEMPTS + 1')) {
            verification.attempts += 1;
            console.log('📊 [MOCK DATABASE] Incremented attempts:', verificationId, 'attempts:', verification.attempts);
          }
        } else {
          console.log('⚠️ [MOCK DATABASE] Verification not found for ID:', verificationId);
        }
        
        return { rows: [], rowCount: 1 };
      }
      
      // DELETE expired verifications
      if (query.includes('DELETE FROM EMAIL_VERIFICATIONS')) {
        const beforeCount = this.mockEmailVerifications.length;
        this.mockEmailVerifications = this.mockEmailVerifications.filter(v => 
          !v.is_used && new Date(v.expires_at) > new Date()
        );
        const deletedCount = beforeCount - this.mockEmailVerifications.length;
        console.log('📊 [MOCK DATABASE] Cleaned up expired verifications:', deletedCount);
        return { rows: [], rowCount: deletedCount };
      }
    }
    
    // Handle users table queries
    if (query.includes('USERS')) {
      
      // INSERT user
      if (query.includes('INSERT INTO USERS')) {
        const [email, full_name, password_hash, referral_code, is_verified] = params;
        const now = new Date();
        const newUser = {
          id: Math.floor(Math.random() * 1000) + 1,
          email,
          full_name,
          password_hash,
          referral_code,
          is_verified,
          created_at: now,
          updated_at: now
        };
        
        // Remove existing user with same email (if any)
        this.mockUsers = this.mockUsers.filter(u => u.email !== email);
        this.mockUsers.push(newUser);
        
        console.log('📊 [MOCK DATABASE] Created user:', { id: newUser.id, email });
        
        return { rows: [newUser], rowCount: 1 };
      }
      
      // SELECT user by email or ID
      if (query.includes('SELECT') && query.includes('FROM USERS WHERE')) {
        const searchValue = params[0];
        
        const user = this.mockUsers.find(u => 
          u.email === searchValue || u.id === searchValue
        );
        
        if (user) {
          console.log('📊 [MOCK DATABASE] Found user:', { id: user.id, email: user.email });
          return { rows: [user], rowCount: 1 };
        } else {
          console.log('📊 [MOCK DATABASE] User not found:', searchValue);
          return { rows: [], rowCount: 0 };
        }
      }
    }
    
    // Default responses for other queries
    console.log('⚠️ [MOCK DATABASE] Unhandled query, using fallback');
    
    if (query.includes('SELECT')) {
      console.log('📊 [MOCK DATABASE] Fallback SELECT - returning empty result');
      return { rows: [], rowCount: 0 };
    } else if (query.includes('INSERT')) {
      console.log('📊 [MOCK DATABASE] Fallback INSERT - returning random ID');
      return { rows: [{ id: Math.floor(Math.random() * 1000) + 1 }], rowCount: 1 };
    } else if (query.includes('UPDATE') || query.includes('DELETE')) {
      console.log('📊 [MOCK DATABASE] Fallback UPDATE/DELETE - returning success');
      return { rows: [], rowCount: 1 };
    }
    
    console.log('📊 [MOCK DATABASE] Unknown query type, returning empty');
    return { rows: [], rowCount: 0 };
  }
}