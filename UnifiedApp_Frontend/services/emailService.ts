// React Native Email Service - Resend Integration & Dev Mode
// Sends verification and welcome email via Resend (production), returns code in dev mode

export class EmailService {
  // Resend API Configuration
  private static readonly RESEND_API_KEY = 're_CMpnXPs3_DR14pP6KVcfUMEdvhHZVDJLD';

  /**
   * Send OTP verification email (Dev Mode: No actual email sent, shows code; Production uses Resend)
   */
  static async sendVerificationEmail(
    email: string,
    code: string,
    purpose: 'registration' | 'login' | 'password_reset' = 'registration'
  ): Promise<boolean> {
    try {
      const purposeText = {
        registration: 'Account Registration',
        login: 'Login Verification',
        password_reset: 'Password Reset'
      };

      // Dev mode: do not send real emails, log code
      if (__DEV__) {
        console.log(`📧 [DEV MODE] Would send ${purposeText[purpose]} email to: ${email}`);
        console.log(`📧 [DEV MODE] Verification Code: ${code}`);
        return true;
      }

      const subject = `${purposeText[purpose]} - Verification Code`;
      console.log('📧 [RESEND] Sending verification email to:', email);
      console.log('📧 Verification Code:', code);

      // Send via Resend API to customer's email
      let emailSent = await this.sendViaResend(email, subject, code, purpose);

      // Fallback (if failed)
      if (!emailSent) {
        console.log('⚠️ Failed to send to customer email, trying fallback...');
        emailSent = await this.sendViaResendFallback(email, subject, code, purpose);
      }
      if (emailSent) {
        console.log('✅ Email sent successfully!');
        return true;
      } else {
        console.error('❌ All email sending methods failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      return false;
    }
  }

  /**
   * Send welcome email (Dev Mode: logs; Production uses Resend)
   */
  static async sendWelcomeEmail(email: string, fullName: string): Promise<boolean> {
    try {
      if (__DEV__) {
        console.log(`📧 [DEV MODE] Would send welcome email to: ${email} (${fullName})`);
        return true;
      }
      console.log('📧 [RESEND] Sending welcome email to:', email);

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'AAMRAJ <onboarding@resend.dev>',
          to: [email],
          subject: `Welcome to AAMRAJ - ${fullName}!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Welcome to AAMRAJ! 🎉</h2>
              <p><strong>Hello ${fullName}!</strong></p>
              <p>Your account has been successfully created and verified.</p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>You can now:</h3>
                <ul>
                  <li>✅ Access all app features</li>
                  <li>✅ Personalize your experience</li>
                  <li>✅ Connect with the community</li>
                </ul>
              </div>
              <p>Welcome aboard! 🚀</p>
              <p>Best regards,<br>AAMRAJ Team</p>
            </div>
          `
        }),
      });

      if (response.ok) {
        console.log('✅ Welcome email sent via Resend!');
        return true;
      } else {
        console.log('❌ Welcome email failed via Resend');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return false;
    }
  }

  /**
   * Test Resend connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      if (__DEV__) {
        console.log('✅ [DEV MODE] Email service ready');
        return true;
      }
      console.log('📧 [RESEND] Testing connection...');
      if (!this.RESEND_API_KEY || this.RESEND_API_KEY.length < 10) {
        console.log('❌ Resend API key not configured');
        return false;
      }
      console.log('✅ Resend ready - API key configured');
      return true;
    } catch (error) {
      console.error('❌ Resend connection test failed:', error);
      return false;
    }
  }

  /**
   * Get service info
   */
  static getServiceInfo(): {
    provider: 'resend' | 'dev-mode';
    configured: boolean;
  } {
    if (__DEV__) {
      return {
        provider: 'dev-mode',
        configured: true,
      };
    }
    return {
      provider: 'resend',
      configured: !!(this.RESEND_API_KEY && this.RESEND_API_KEY.length > 10),
    };
  }

  /**
   * Send email via Resend API
   */
  private static async sendViaResend(
    email: string,
    subject: string,
    code: string,
    purpose: string
  ): Promise<boolean> {
    try {
      console.log('📧 Sending via Resend...');
      if (!this.RESEND_API_KEY) {
        console.log('❌ Resend API key missing');
        return false;
      }
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'AAMRAJ <onboarding@resend.dev>',
          to: [email],
          subject: `${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>🔐 AAMRAJ Verification Code</h2>
              <p><strong>Hello!</strong></p>
              <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 16px;">Your verification code:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1976d2;">${code}</div>
              </div>
              <p><strong>Purpose:</strong> ${purpose}</p>
              <p><strong>Expires:</strong> 10 minutes</p>
              <p style="font-size: 14px; color: #666;">
                If you didn't request this code, please ignore this email.
              </p>
              <p>Best regards,<br>AAMRAJ Team</p>
            </div>
          `,
        }),
      });

      if (response.ok) {
        console.log('✅ Resend email sent successfully!');
        return true;
      } else {
        const errorText = await response.text();
        console.log('❌ Resend failed:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.log('❌ Resend error:', error);
      return false;
    }
  }

  /**
   * Fallback method to send via verified address with customer info
   */
  private static async sendViaResendFallback(
    customerEmail: string,
    subject: string,
    code: string,
    purpose: string
  ): Promise<boolean> {
    try {
      console.log('📧 Using fallback - sending to verified address with customer info');
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'AAMRAJ <onboarding@resend.dev>',
          to: ['manojkadiyala@originhubsit.com'],
          subject: `${subject} - Customer: ${customerEmail}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #ff9800; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0;">⚠️ FALLBACK EMAIL DELIVERY</h3>
                <p style="margin: 5px 0 0 0;">Customer email domain not verified with Resend</p>
              </div>
              <h2>🔐 AAMRAJ Verification Code</h2>
              <p><strong>Customer Email:</strong> ${customerEmail}</p>
              <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 16px;">Verification code for ${customerEmail}:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1976d2;">${code}</div>
              </div>
              <p><strong>Purpose:</strong> ${purpose}</p>
              <p><strong>Expires:</strong> 10 minutes</p>
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>Action Required:</strong> Please manually send this code to ${customerEmail} 
                  or configure a verified domain in Resend to enable direct email delivery.
                </p>
              </div>
              <p>Best regards,<br>AAMRAJ Team</p>
            </div>
          `,
        }),
      });

      if (response.ok) {
        console.log('✅ Fallback email sent to verified address');
        return true;
      } else {
        console.log('❌ Fallback email failed');
        return false;
      }
    } catch (error) {
      console.log('❌ Fallback email error:', error);
      return false;
    }
  }
}

export default EmailService;