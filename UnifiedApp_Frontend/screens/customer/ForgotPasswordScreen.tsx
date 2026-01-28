// ForgotPasswordScreen.tsx
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { LoadingContext } from "../../contexts/AuthContext";
import { API } from "../../config/apiConfig";

export default function ForgotPasswordScreen({ navigation }) {
  const { loading, setLoading } = useContext(LoadingContext);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  // Send OTP
  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Enter email", "Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API.SEND_RESET_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        Alert.alert("Success", data.message);
        setStep(2);
      } else {
        Alert.alert("Error", data.message || "Failed to send OTP.");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      Alert.alert("Error", "Network request failed.");
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Enter OTP", "Please enter the OTP sent to your email.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API.VERIFY_RESET_EMAIL_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        navigation.navigate("ResetPassword", { email, token: otp });
      } else {
        Alert.alert("Error", data.message || "Invalid or expired OTP.");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      Alert.alert("Error", "Network request failed.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/forgot-password-icon.png")} // replace with your image
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subText}>
          Enter your email to receive a password reset link.
        </Text>

        {step === 1 && (
          <>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: email ? "#5C4DFF" : "#BEBEBE" }]}
              disabled={!email}
              onPress={handleSendOtp}
            >
              <Text style={styles.buttonText}>Send OTP</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.infoText}>Enter the code sent to {email}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: otp ? "#5C4DFF" : "#BEBEBE" }]}
              disabled={!otp}
              onPress={handleVerifyOtp}
            >
              <Text style={styles.buttonText}>Verify OTP</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Loading Overlay */}
        {loading && (
          <Modal transparent animationType="fade">
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#5C4DFF" />
              <Text style={styles.loadingText}>Please wait...</Text>
            </View>
          </Modal>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: "#6E6E6E",
    textAlign: "center",
    marginBottom: 30,
  },
  inputWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  infoText: {
    textAlign: "center",
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#5C4DFF",
    fontWeight: "bold",
  },
});
