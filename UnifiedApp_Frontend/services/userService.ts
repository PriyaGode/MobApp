import { DatabaseService } from './database';
// Note: bcrypt removed for React Native compatibility

export interface User {
  id: number;
  email: string;
  fullName: string;
  isVerified: boolean;
  referralCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  fullName: string;
  password: string;
  referralCode?: string;
}

export class UserService {
  
  /**
   * Hash password (React Native compatible mock)
   */
  private static async hashPassword(password: string): Promise<string> {
    // In development mode, use a simple hash simulation
    if (typeof password !== 'string') {
      throw new Error('Password must be a string');
    }
    
    // Simple hash simulation for React Native compatibility
    // In production, this should call a backend API for secure hashing
    const mockHash = `mock_hash_${password.length}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🔐 [MOCK] Password hashed for development');
    return mockHash;
  }

  /**
   * Verify password against hash (React Native compatible mock)
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (typeof password !== 'string' || typeof hash !== 'string') {
      return false;
    }
    
    // In development mode, accept any password for testing
    // In production, this should call a backend API for secure verification
    console.log('🔐 [MOCK] Password verification - accepting for development');
    return true;
  }

  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<User> {
    const { email, fullName, password, referralCode } = userData;
    
    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Check if user already exists
      const existingUser = await this.getUserByEmail(normalizedEmail);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Insert user
      const query = `
        INSERT INTO users (email, full_name, password_hash, referral_code, is_verified)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, full_name, is_verified, referral_code, created_at, updated_at
      `;

      const result = await DatabaseService.query(query, [
        normalizedEmail,
        fullName.trim(),
        passwordHash,
        referralCode || null,
        true // Set as verified since they completed email verification
      ]);

      const user = result.rows[0];
      
      console.log('✅ User created successfully:', { id: user.id, email: user.email });
      
      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        isVerified: user.is_verified,
        referralCode: user.referral_code,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };

    } catch (error) {
      console.error('❌ Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const query = `
        SELECT id, email, full_name, is_verified, referral_code, created_at, updated_at
        FROM users WHERE email = $1
      `;
      
      const result = await DatabaseService.query(query, [email.toLowerCase().trim()]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        isVerified: user.is_verified,
        referralCode: user.referral_code,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };

    } catch (error) {
      console.error('❌ Failed to get user by email:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: number): Promise<User | null> {
    try {
      const query = `
        SELECT id, email, full_name, is_verified, referral_code, created_at, updated_at
        FROM users WHERE id = $1
      `;
      
      const result = await DatabaseService.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        isVerified: user.is_verified,
        referralCode: user.referral_code,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };

    } catch (error) {
      console.error('❌ Failed to get user by ID:', error);
      return null;
    }
  }

  /**
   * Authenticate user with email and password
   */
  static async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const query = `
        SELECT id, email, full_name, password_hash, is_verified, referral_code, created_at, updated_at
        FROM users WHERE email = $1
      `;
      
      const result = await DatabaseService.query(query, [email.toLowerCase().trim()]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      
      // Verify password
      const passwordValid = await this.verifyPassword(password, user.password_hash);
      if (!passwordValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        isVerified: user.is_verified,
        referralCode: user.referral_code,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };

    } catch (error) {
      console.error('❌ Failed to authenticate user:', error);
      return null;
    }
  }

  /**
   * Update user verification status
   */
  static async markUserAsVerified(email: string): Promise<boolean> {
    try {
      const query = `
        UPDATE users SET is_verified = TRUE, updated_at = NOW()
        WHERE email = $1
        RETURNING id
      `;
      
      const result = await DatabaseService.query(query, [email.toLowerCase().trim()]);
      
      return result.rows.length > 0;
      
    } catch (error) {
      console.error('❌ Failed to mark user as verified:', error);
      return false;
    }
  }

  /**
   * Update user password
   */
  static async updateUserPassword(email: string, newPassword: string): Promise<boolean> {
    try {
      const passwordHash = await this.hashPassword(newPassword);
      
      const query = `
        UPDATE users SET password_hash = $1, updated_at = NOW()
        WHERE email = $2
        RETURNING id
      `;
      
      const result = await DatabaseService.query(query, [passwordHash, email.toLowerCase().trim()]);
      
      return result.rows.length > 0;
      
    } catch (error) {
      console.error('❌ Failed to update user password:', error);
      return false;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<{ total: number; verified: number; unverified: number }> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) as verified,
          SUM(CASE WHEN is_verified = FALSE THEN 1 ELSE 0 END) as unverified
        FROM users
      `;
      
      const result = await DatabaseService.query(query);
      const stats = result.rows[0];
      
      return {
        total: parseInt(stats.total),
        verified: parseInt(stats.verified),
        unverified: parseInt(stats.unverified)
      };
      
    } catch (error) {
      console.error('❌ Failed to get user stats:', error);
      return { total: 0, verified: 0, unverified: 0 };
    }
  }
}

export default UserService;