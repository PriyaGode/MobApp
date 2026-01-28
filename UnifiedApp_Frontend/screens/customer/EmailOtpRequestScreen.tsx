import React, { useState, useContext } from "react";
import { Alert, StyleSheet, Text, View, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import Button from "../../components/customer/Button";
import { LoadingContext } from "../../contexts/AuthContext";
import { DatabaseEmailOtpService } from "../../services/databaseEmailOtpService";
import { getDeviceFingerprint } from "../../utils/deviceId";

type Props = {
  navigation: any;
};

export default function EmailOtpRequestScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const { setLoading } = useContext(LoadingContext);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOtp = async () => {
    setEmailError("");

    // Validate email
    if (!email.trim()) {
      setEmailError("Please enter your email address");
      return;
    }

    if (!validateEmail(email.trim())) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const deviceId = await getDeviceFingerprint();
      const result = await DatabaseEmailOtpService.sendEmailOtp(
        email.trim(),
        "registration",
        deviceId
      );

      setLoading(false);

      // Always navigate to verification screen (with debugCode in dev mode)
      const verificationParams: any = {
        email: email.trim(),
        purpose: "verification",
      };
      if (result.debugCode) verificationParams.debugCode = result.debugCode;

      if (result.debugCode && __DEV__) {
        console.log(`🔧 DEBUG: Email OTP code is ${result.debugCode}`);
        Alert.alert(
          "Code Sent!", 
          `Verification code sent to ${email.trim()}\n\nDEV MODE: Your code is ${result.debugCode}`,
          [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("EmailOtpVerify", verificationParams);
              }
            }
          ]
        );
      } else {
        Alert.alert(
          "Code Sent!", 
          `A 6-digit verification code has been sent to ${email.trim()}`,
          [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("EmailOtpVerify", verificationParams);
              }
            }
          ]
        );
      }

    } catch (error: any) {
      setLoading(false);
      console.error("Send OTP error:", error);

      if (error.message?.includes("RESEND_TOO_SOON")) {
        const seconds = error.message.split(":")[1];
        setEmailError(`Please wait ${seconds} seconds before requesting a new code`);
      } else if (error.message === "EMAIL_SEND_FAILED") {
        setEmailError("Failed to send email. Please check your email address and try again.");
      } else if (error.message === "INVALID_EMAIL_FORMAT") {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Email Verification</Text>
        
        <Text style={styles.subtitle}>
          Enter your email address to receive a verification code
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="Enter your email address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            testID="email-input"
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title="Send Verification Code" 
            onPress={handleSendOtp}
            disabled={!email.trim()}
          />

          <Button 
            title="Go Back" 
            onPress={() => navigation.goBack()}
            outline
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ How it works:</Text>
          <Text style={styles.infoText}>
            1. Enter your email address{"\n"}
            2. We'll send you a 6-digit code{"\n"}
            3. Enter the code to verify your email{"\n"}
            4. Code expires in 10 minutes
          </Text>
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
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#ff6b6b",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
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