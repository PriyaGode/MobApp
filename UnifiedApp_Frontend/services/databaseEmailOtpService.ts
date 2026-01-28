import { DatabaseService } from './database';
import { EmailService } from './emailService';
import { getDeviceFingerprint } from '../utils/deviceId';
import { trackTelemetry } from './telemetry';

export interface EmailOtpResult {
  success: boolean;
  expiresAt?: Date;
  debugCode?: string;
  cooldownMs?: number;
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
  attemptsRemaining?: number;
}

export class DatabaseEmailOtpService {
  
  private static readonly OTP_EXPIRY_MINUTES = 10;
  private static readonly RESEND_COOLDOWN_SECONDS = 60;
  private static readonly MAX_ATTEMPTS = 5;

  /**
   * Generate a 6-digit OTP code
   */
  private static generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send email OTP (Dev Mode returns debugCode, prod sends real email)
   */
  static async sendEmailOtp(
    email: string, 
    purpose: 'registration' | 'login' | 'password_reset' = 'registration',
    deviceId?: string
  ): Promise<EmailOtpResult> {
    
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const finalDeviceId = deviceId || await getDeviceFingerprint();

      // Check for existing non-expired, non-used verification
      const existingQuery = `
        SELECT * FROM email_verifications 
        WHERE email = $1 AND purpose = $2 AND expires_at > NOW() AND is_used = FALSE
        ORDER BY created_at DESC LIMIT 1
      `;
      
      const existingResult = await DatabaseService.query(existingQuery, [normalizedEmail, purpose]);
      
      if (existingResult.rows.length > 0) {
        const existing = existingResult.rows[0];
        const timeSinceCreated = Date.now() - new Date(existing.created_at).getTime();
        const cooldownMs = (this.RESEND_COOLDOWN_SECONDS * 1000) - timeSinceCreated;
        
        if (cooldownMs > 0) {
          trackTelemetry('email_otp_send_rate_limited', { 
            email: normalizedEmail, 
            purpose, 
            cooldownMs: Math.ceil(cooldownMs / 1000)
          });
          return {
            success: false,
            error: `Please wait ${Math.ceil(cooldownMs / 1000)} seconds before requesting a new code`,
            cooldownMs: Math.ceil(cooldownMs / 1000)
          };
        }
      }

      // Generate new OTP code
      const otpCode = this.generateOtpCode();
      const expiresAt = new Date(Date.now() + (this.OTP_EXPIRY_MINUTES * 60 * 1000));

      // Store in database
      const insertQuery = `
        INSERT INTO email_verifications (email, code, purpose, expires_at, device_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
      
      const insertResult = await DatabaseService.query(insertQuery, [
        normalizedEmail,
        otpCode,
        purpose,
        expiresAt,
        finalDeviceId
      ]);

      // Dev mode: return debugCode and don't send actual email
      if (__DEV__) {
        console.log(`📧 [DEV MODE] Email OTP generated for ${normalizedEmail}: ${otpCode}`);
        return {
          success: true,
          expiresAt,
          debugCode: otpCode,
          cooldownMs: this.RESEND_COOLDOWN_SECONDS
        };
      }

      // Production: send email
      const emailSent = await EmailService.sendVerificationEmail(
        normalizedEmail, 
        otpCode, 
        purpose
      );

      if (!emailSent) {
        // Remove from database if email failed
        await DatabaseService.query('DELETE FROM email_verifications WHERE id = $1', [insertResult.rows[0].id]);
        
        trackTelemetry('email_otp_send_failed', { 
          email: normalizedEmail, 
          purpose,
          error: 'Email sending failed'
        });
        
        return {
          success: false,
          error: 'Failed to send verification email. Please try again.'
        };
      }

      trackTelemetry('email_otp_send_success', { 
        email: normalizedEmail, 
        purpose, 
        deviceId: finalDeviceId 
      });

      return {
        success: true,
        expiresAt,
        cooldownMs: this.RESEND_COOLDOWN_SECONDS
      };

    } catch (error) {
      console.error('❌ Database OTP send error:', error);
      trackTelemetry('email_otp_send_error', { 
        email, 
        purpose,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {
        success: false,
        error: 'Something went wrong. Please try again.'
      };
    }
  }

  /**
   * Verify email OTP
   */
  static async verifyEmailOtp(
    email: string,
    code: string,
    purpose: 'registration' | 'login' | 'password_reset' = 'registration',
    deviceId?: string
  ): Promise<VerifyOtpResult> {
    
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const normalizedCode = code.trim();
      const finalDeviceId = deviceId || await getDeviceFingerprint();

      // Find the verification record
      const selectQuery = `
        SELECT * FROM email_verifications 
        WHERE email = $1 AND purpose = $2 AND expires_at > NOW() AND is_used = FALSE
        ORDER BY created_at DESC LIMIT 1
      `;
      
      const result = await DatabaseService.query(selectQuery, [normalizedEmail, purpose]);
      
      if (result.rows.length === 0) {
        trackTelemetry('email_otp_verify_fail', { 
          email: normalizedEmail, 
          reason: 'not_found',
          purpose 
        });
        return {
          success: false,
          error: 'No valid verification code found. Please request a new one.'
        };
      }

      const verification = result.rows[0];

      // Check if too many attempts
      if (verification.attempts >= this.MAX_ATTEMPTS) {
        // Mark as used to prevent further attempts
        await DatabaseService.query(
          'UPDATE email_verifications SET is_used = TRUE WHERE id = $1',
          [verification.id]
        );
        trackTelemetry('email_otp_verify_fail', { 
          email: normalizedEmail, 
          reason: 'too_many_attempts',
          purpose 
        });
        return {
          success: false,
          error: 'Too many incorrect attempts. Please request a new verification code.'
        };
      }

      // Check if code matches
      if (verification.code !== normalizedCode) {
        // Increment attempts
        await DatabaseService.query(
          'UPDATE email_verifications SET attempts = attempts + 1 WHERE id = $1',
          [verification.id]
        );
        
        const attemptsRemaining = this.MAX_ATTEMPTS - (verification.attempts + 1);
        trackTelemetry('email_otp_verify_fail', { 
          email: normalizedEmail, 
          reason: 'code_mismatch',
          purpose,
          attempts: verification.attempts + 1,
          attemptsRemaining 
        });
        return {
          success: false,
          error: `Incorrect verification code. ${attemptsRemaining} attempts remaining.`,
          attemptsRemaining
        };
      }

      // Success! Mark as used
      await DatabaseService.query(
        'UPDATE email_verifications SET is_used = TRUE WHERE id = $1',
        [verification.id]
      );

      trackTelemetry('email_otp_verify_success', { 
        email: normalizedEmail, 
        purpose,
        deviceId: finalDeviceId 
      });

      return {
        success: true
      };

    } catch (error) {
      console.error('❌ Database OTP verification error:', error);
      return {
        success: false,
        error: 'Something went wrong. Please try again.'
      };
    }
  }

  /**
   * Check if email has pending verification
   */
  static async hasPendingVerification(
    email: string, 
    purpose: 'registration' | 'login' | 'password_reset' = 'registration'
  ): Promise<boolean> {
    try {
      const query = `
        SELECT COUNT(*) as count FROM email_verifications 
        WHERE email = $1 AND purpose = $2 AND expires_at > NOW() AND is_used = FALSE
      `;
      
      const result = await DatabaseService.query(query, [email.toLowerCase().trim(), purpose]);
      return parseInt(result.rows[0].count) > 0;
      
    } catch (error) {
      console.error('❌ Error checking pending verification:', error);
      return false;
    }
  }

  /**
   * Get resend cooldown for email
   */
  static async getResendCooldown(
    email: string, 
    purpose: 'registration' | 'login' | 'password_reset' = 'registration'
  ): Promise<number> {
    try {
      const query = `
        SELECT created_at FROM email_verifications 
        WHERE email = $1 AND purpose = $2 AND expires_at > NOW() AND is_used = FALSE
        ORDER BY created_at DESC LIMIT 1
      `;
      
      const result = await DatabaseService.query(query, [email.toLowerCase().trim(), purpose]);
      
      if (result.rows.length === 0) {
        return 0;
      }

      const timeSinceCreated = Date.now() - new Date(result.rows[0].created_at).getTime();
      const cooldownMs = (this.RESEND_COOLDOWN_SECONDS * 1000) - timeSinceCreated;
      
      return Math.max(0, Math.ceil(cooldownMs / 1000));
      
    } catch (error) {
      console.error('❌ Error getting resend cooldown:', error);
      return 0;
    }
  }
}

export default DatabaseEmailOtpService;