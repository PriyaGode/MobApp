import { useContext, useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import Button from "../../components/superadmin/Button";
import { OTPInput } from "../../components/superadmin/otp/OTPInput";
import { AuthContext, LoadingContext } from "../contexts/AuthContext";
import { DatabaseService } from "../services/database";
import { DatabaseEmailOtpService } from "../services/databaseEmailOtpService";
import { EmailService } from "../services/emailService";
import { trackTelemetry } from "../services/telemetry";
import { UserService } from "../services/userService";
import { getDeviceFingerprint } from "../../utils/deviceId";

type Props = {
  navigation: any;
  route: { 
    params?: { 
      email?: string; 
      purpose?: "verification" | "registration" | "password_reset" | "login";
      debugCode?: string;
      registrationData?: {
        fullName: string;
        password: string;
        referralCode?: string;
      };
    } 
  };
};

export default function EmailOtpVerifyScreen({ navigation, route }: Props) {
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | undefined>(undefined);
  const [debugCode, setDebugCode] = useState<string | undefined>(route.params?.debugCode);
  const { setLoading } = useContext(LoadingContext)!;
  
  const email = route.params?.email || "";
  const purpose = route.params?.purpose || "verification";
  const registrationData = route.params?.registrationData;
  const { setUserToken } = useContext(AuthContext)!;

  // Handle registration completion after email verification
  const handleRegistrationCompletion = async () => {
    if (!registrationData) return;

    try {
      // Initialize database if needed
      await DatabaseService.initializeTables();

      // Create user in database
      const user = await UserService.createUser({
        email,
        fullName: registrationData.fullName,
        password: registrationData.password,
        referralCode: registrationData.referralCode
      });

      // Generate auth token with user ID
      const authToken = `auth_${user.id}_${Date.now()}`;
      
      // Store user data and auth token
      const { secureStorage } = await import("../utils/secureStorage");
      const userData = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        verified: user.isVerified,
        registeredAt: user.createdAt.toISOString(),
        referralCode: user.referralCode || null,
      };

      await secureStorage.setAuthToken(authToken);
      await secureStorage.setUserData(userData);

      // Set user as authenticated
      setUserToken(authToken);

      // Send welcome email
      try {
        await EmailService.sendWelcomeEmail(email, registrationData.fullName);
      } catch (emailError) {
        // Don't fail registration if welcome email fails
      }

      // Telemetry: email verification success
      trackTelemetry("email_otp_verify_success", {
        userId: user.id,
        email: user.email,
        verified: user.isVerified
      });

      Alert.alert(
        "Welcome! 🎉", 
        `Your account has been created successfully!\n\nWelcome to AAMRAJ, ${registrationData.fullName}!`,
        [
          {
            text: "Get Started",
            onPress: () => {
              // Navigation will be handled by AuthContext automatically
            }
          }
        ]
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Registration completion failed:", errorMessage);
      Alert.alert(
        "Registration Failed",
        "There was an error creating your account. Please try again.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  };

  // Initialize resend cooldown
  useEffect(() => {
    const updateCooldown = async () => {
      const dbPurpose = purpose === "verification" ? "registration" : purpose;
      const cooldownSeconds = await DatabaseEmailOtpService.getResendCooldown(email, dbPurpose);
      setResendTimer(cooldownSeconds);
    };
    updateCooldown();
  }, [email, purpose]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Clear error when user starts typing
  useEffect(() => {
    if (otpCode.length > 0 && error) {
      setError("");
    }
  }, [otpCode, error]);

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const deviceId = await getDeviceFingerprint();
      const dbPurpose = purpose === "verification" ? "registration" : purpose;
      const result = await DatabaseEmailOtpService.verifyEmailOtp(
        email,
        otpCode,
        dbPurpose,
        deviceId
      );

      if (result.success) {
        setLoading(false);
        
        // Handle registration completion if we have registration data
        if (registrationData && purpose === "registration") {
          await handleRegistrationCompletion();
        } else {
          // For other purposes, just show success and go back
          Alert.alert(
            "Success!", 
            "Email verified successfully!",
            [
              {
                text: "OK",
                onPress: () => navigation.goBack()
              }
            ]
          );
        }
      } else {
        setLoading(false);
        setError(result.error || "Verification failed");
        setAttemptsRemaining(result.attemptsRemaining);
        setOtpCode(""); // Clear the input for retry
      }
    } catch (error) {
      setLoading(false);
      console.error("OTP verification error:", error);
      setError("Something went wrong. Please try again.");
      setOtpCode("");
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setError("");
    setLoading(true);

    try {
      const deviceId = await getDeviceFingerprint();
      const dbPurpose = purpose === "verification" ? "registration" : purpose;
      const result = await DatabaseEmailOtpService.sendEmailOtp(
        email,
        dbPurpose,
        deviceId
      );

      setLoading(false);
      setResendTimer(result.cooldownMs || 60);
      setAttemptsRemaining(undefined); // Reset attempts counter
      
      // Update debug code if available
      if (result.debugCode) {
        setDebugCode(result.debugCode);
      }
      
      // Show success message with debug code in dev mode
      if (result.debugCode && __DEV__) {
        console.log(`🔧 DEBUG: Email OTP code is ${result.debugCode}`);
        Alert.alert(
          "Code Sent!", 
          `A new verification code has been sent to ${email}\n\nDEV MODE: Your code is ${result.debugCode}`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Code Sent!", 
          `A new verification code has been sent to ${email}`,
          [{ text: "OK" }]
        );
      }

    } catch (error: any) {
      setLoading(false);
      console.error("Resend OTP error:", error);
      
      if (error.message?.includes("RESEND_TOO_SOON")) {
        const seconds = error.message.split(":")[1];
        setError(`Please wait ${seconds} seconds before requesting a new code`);
        setResendTimer(parseInt(seconds));
      } else if (error.message === "EMAIL_SEND_FAILED") {
        setError("Failed to send email. Please check your email address and try again.");
      } else if (error.message === "INVALID_EMAIL_FORMAT") {
        setError("Invalid email format");
      } else {
        setError("Failed to send code. Please try again.");
      }
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const getTitle = () => {
    switch (purpose) {
      case "password_reset":
        return "Reset Password";
      case "login":
        return "Verify Login";
      default:
        return "Verify Email";
    }
  };

  const getSubtitle = () => {
    switch (purpose) {
      case "password_reset":
        return "Enter the verification code sent to your email to reset your password";
      case "login":
        return "Enter the verification code sent to your email to complete login";
      default:
        return "Enter the 6-digit verification code sent to your email";
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{getTitle()}</Text>
        
        <Text style={styles.subtitle}>{getSubtitle()}</Text>
        
        <Text style={styles.email}>{email}</Text>

        <View style={styles.otpContainer}>
          <OTPInput
            length={6}
            value={otpCode}
            onChange={setOtpCode}
            error={error}
            testIDPrefix="email-otp"
          />
        </View>

        {attemptsRemaining !== undefined && attemptsRemaining < 5 && (
          <Text style={styles.attemptsWarning}>
            {attemptsRemaining} attempts remaining
          </Text>
        )}

        {debugCode && __DEV__ && (
          <View style={styles.debugCodeBox}>
            <Text style={styles.debugCodeTitle}>🔧 Dev Mode - OTP Code:</Text>
            <Text style={styles.debugCodeText}>{debugCode}</Text>
            <Text style={styles.debugCodeHint}>Copy this code to test verification</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button 
            title="Verify Code" 
            onPress={handleVerifyOtp}
            disabled={otpCode.length !== 6}
          />

          <Button 
            title={resendTimer > 0 ? `Resend in ${formatTime(resendTimer)}` : "Resend Code"}
            onPress={handleResendOtp}
            outline
            disabled={resendTimer > 0}
          />

          <Button 
            title="Go Back" 
            onPress={handleGoBack}
            outline
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Tips:</Text>
          <Text style={styles.infoText}>• Check your spam/junk folder</Text>
          <Text style={styles.infoText}>• Code expires in 10 minutes</Text>
          <Text style={styles.infoText}>• Make sure you have internet connection</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 22,
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2196F3",
    marginBottom: 30,
    textAlign: "center",
  },
  otpContainer: {
    marginBottom: 20,
  },
  attemptsWarning: {
    fontSize: 14,
    color: "#ff6b6b",
    marginBottom: 20,
    textAlign: "center",
  },
  debugCodeBox: {
    backgroundColor: "#FFF9E6",
    borderWidth: 2,
    borderColor: "#FF9800",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  debugCodeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F57C00",
    marginBottom: 12,
  },
  debugCodeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#E65100",
    letterSpacing: 8,
    marginBottom: 8,
  },
  debugCodeHint: {
    fontSize: 12,
    color: "#F57C00",
    fontStyle: "italic",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
});