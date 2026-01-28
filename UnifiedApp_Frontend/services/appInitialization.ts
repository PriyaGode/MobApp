import { DatabaseService } from '../services/database';
import { EmailService } from '../services/emailService';

export class AppInitializationService {
  
  private static initialized = false;

  /**
   * Initialize the application
   */
  static async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    console.log('Initializing AAMRAJ app...');

    try {
      // Initialize database
      console.log(' Setting up database...');
      await DatabaseService.initialize();
      
      // Test database connection
      const dbConnected = await DatabaseService.healthCheck();
      if (!dbConnected) {
        throw new Error('Database connection failed');
      }
      console.log(' Database ready');

      // Test email service
      console.log(' Testing email service...');
      const emailConnected = await EmailService.testConnection();
      if (!emailConnected) {
        console.warn('Email service connection failed - emails may not work');
      } else {
        console.log(' Email service ready');
      }

      // Clean up old verification codes
      await DatabaseService.cleanupExpiredVerifications();

      this.initialized = true;
      console.log(' App initialization completed successfully!');
      return true;

    } catch (error) {
      console.error(' App initialization failed:', error);
      return false;
    }
  }

  /**
   * Check if app is initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get initialization status
   */
  static async getStatus(): Promise<{
    database: boolean;
    email: boolean;
    initialized: boolean;
  }> {
    try {
      const database = await DatabaseService.healthCheck();
      const email = await EmailService.testConnection();
      
      return {
        database,
        email,
        initialized: this.initialized
      };
    } catch (error) {
      return {
        database: false,
        email: false,
        initialized: false
      };
    }
  }
}

export default AppInitializationService;