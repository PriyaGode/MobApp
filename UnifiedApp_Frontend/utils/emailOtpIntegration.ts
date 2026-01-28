import { Alert } from "react-native";
import { DatabaseEmailOtpService } from "../services/databaseEmailOtpService";
import { getDeviceFingerprint } from "../utils/deviceId";

export type EmailOtpPurpose = "registration" | "password_reset" | "login";

export interface EmailOtpIntegrationOptions {
  email: string;
  purpose: EmailOtpPurpose;
  navigation: any;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  autoNavigate?: boolean; // Whether to automatically navigate to OTP verification screen
}

/**
 * Sends an email OTP and optionally navigates to the verification screen
 */
export async function initiateEmailOtp(options: EmailOtpIntegrationOptions): Promise<boolean> {
  const {
    email,
    purpose,
    navigation,
    onSuccess,
    onError,
    autoNavigate = true
  } = options;

  try {
    const deviceId = await getDeviceFingerprint();
    const result = await DatabaseEmailOtpService.sendEmailOtp(
      email.trim(),
      purpose,
      deviceId
    );

    // Show success message
    const purposeText = purpose === "registration" ? "verification" : 
                       purpose === "password_reset" ? "password reset" : "login";
    
    const message = `A 6-digit ${purposeText} code has been sent to ${email.trim()}`;
    
    // Show debug code in development
    if (result.debugCode && __DEV__) {
      Alert.alert(
        "Code Sent!", 
        `${message}\n\nDEV MODE: Your code is ${result.debugCode}`,
        [
          {
            text: "OK",
            onPress: () => {
              if (autoNavigate) {
                navigation.navigate("EmailOtpVerify", {
                  email: email.trim(),
                  purpose,
                  onSuccess
                });
              }
            }
          }
        ]
      );
    } else {
      Alert.alert(
        "Code Sent!", 
        message,
        [
          {
            text: "OK",
            onPress: () => {
              if (autoNavigate) {
                navigation.navigate("EmailOtpVerify", {
                  email: email.trim(),
                  purpose,
                  onSuccess
                });
              }
            }
          }
        ]
      );
    }

    return true;

  } catch (error: any) {
    console.error("Email OTP initiation error:", error);
    
    let errorMessage = "Something went wrong. Please try again.";
    
    if (error.message?.includes("RESEND_TOO_SOON")) {
      const seconds = error.message.split(":")[1];
      errorMessage = `Please wait ${seconds} seconds before requesting a new code`;
    } else if (error.message === "EMAIL_SEND_FAILED") {
      errorMessage = "Failed to send email. Please check your email address and try again.";
    } else if (error.message === "INVALID_EMAIL_FORMAT") {
      errorMessage = "Please enter a valid email address";
    } else if (error.message === "RATE_LIMITED") {
      errorMessage = "Too many requests. Please wait before trying again.";
    }

    if (onError) {
      onError(errorMessage);
    } else {
      Alert.alert("Error", errorMessage);
    }

    return false;
  }
}

/**
 * Verifies an email OTP code
 */
export async function verifyEmailOtpCode(
  email: string,
  code: string,
  purpose: EmailOtpPurpose = "registration",
  onSuccess?: () => void,
  onError?: (error: string, attemptsRemaining?: number) => void
): Promise<boolean> {
  try {
    const deviceId = await getDeviceFingerprint();
    const result = await DatabaseEmailOtpService.verifyEmailOtp(
      email.trim(),
      code.trim(),
      purpose,
      deviceId
    );

    if (result.success) {
      if (onSuccess) {
        onSuccess();
      }
      return true;
    } else {
      if (onError) {
        onError(result.error || "Verification failed", result.attemptsRemaining);
      }
      return false;
    }

  } catch (error: any) {
    console.error("Email OTP verification error:", error);
    const errorMessage = "Something went wrong. Please try again.";
    
    if (onError) {
      onError(errorMessage);
    }
    
    return false;
  }
}

/**
 * Helper function to validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Creates a standard email OTP navigation function for screens
 */
export function createEmailOtpHandler(
  navigation: any,
  purpose: EmailOtpPurpose = "registration"
) {
  return async (email: string, onSuccess?: () => void) => {
    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    return await initiateEmailOtp({
      email,
      purpose,
      navigation,
      onSuccess,
      autoNavigate: true
    });
  };
}