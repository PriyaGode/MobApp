// File: ResetPassword.tsx

import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { LoadingContext } from "../../contexts/AuthContext";
import { API } from "../../config/apiConfig";

type Props = { route: any; navigation: any };

export default function ResetPassword({ route, navigation }: Props) {
  const { loading, setLoading } = useContext(LoadingContext);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const email = route.params?.email;
  const token = route.params?.token;

  // Redirect if accessed without params
  useEffect(() => {
    if (!email || !token) {
      Alert.alert(
        "Error",
        "Invalid access. Please use the Forgot Password flow.",
        [{ text: "OK", onPress: () => navigation.navigate("ForgotPasswordScreen") }]
      );
    }
  }, []);

  // Validation checks
  const validations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&]/.test(password),
    match: password && confirm && password === confirm,
  };

  const passwordValid =
    validations.length &&
    validations.uppercase &&
    validations.number &&
    validations.special;

  const allValid = passwordValid && validations.match;


const handleResetPassword = async () => {
  if (!allValid) return;
console.log("Sending password reset:", { email, newPassword: password });
console.log("api :::: ",API.update_password);
  setLoading(true);
  try {
    const response = await fetch(API.UPDATE_PASSWORD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword: password }),
    });

    const data = await response.json();
    setLoading(false);

    if (response.status === 200 && data.success) {
      Alert.alert("Success", "Password reset successfully!", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } else {
      Alert.alert("Error", data.message || "Failed to reset password");
    }
  } catch (err) {
    setLoading(false);
    console.error(err);
    Alert.alert("Error", "Network request failed");
  }
};





  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Icon */}
        <View style={styles.iconContainer}>
          <Icon name="lock-closed-outline" size={60} color="#5C4DFF" />
        </View>

        <Text style={styles.title}>Set a New Password</Text>
        <Text style={styles.subText}>
          Your new password must be different from previous ones.
        </Text>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="New Password"
            secureTextEntry={!showPass}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Icon
              name={showPass ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#7B7B7B"
            />
          </TouchableOpacity>
        </View>

        {/* Validation List - show only after typing and if not all valid */}
        {password.length > 0 && !passwordValid && (
          <View style={styles.validationContainer}>
            <ValidationItem label="8+ characters" valid={validations.length} />
            <ValidationItem label="1 uppercase" valid={validations.uppercase} />
            <ValidationItem label="1 number" valid={validations.number} />
            <ValidationItem label="1 special char" valid={validations.special} />
          </View>
        )}

        {/* Confirm Password */}
        <View style={[styles.inputContainer, { marginTop: 10 }]}>
          <TextInput
            placeholder="Confirm New Password"
            secureTextEntry={!showConfirm}
            style={styles.input}
            value={confirm}
            onChangeText={setConfirm}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Icon
              name={showConfirm ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#7B7B7B"
            />
          </TouchableOpacity>
        </View>

        {/* Match error - show only after typing confirm */}
        {confirm.length > 0 && !validations.match && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}

        {/* Reset Button */}
        <TouchableOpacity
          disabled={!allValid}
          onPress={handleResetPassword}
          style={[
            styles.button,
            { backgroundColor: allValid ? "#5C4DFF" : "#BEBEBE" },
          ]}
        >
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>

        {/* Loading Overlay */}
        <Modal transparent visible={loading}>
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#5C4DFF" />
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Validation Item Component
const ValidationItem = ({ label, valid }: { label: string; valid: boolean }) => (
  <View style={styles.validationItem}>
    <Icon
      name={valid ? "checkmark-circle" : "close-circle"}
      size={18}
      color={valid ? "green" : "red"}
    />
    <Text style={[styles.validationText, { color: valid ? "green" : "red" }]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: "#FFFFFF",
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 10,
  },
  subText: {
    fontSize: 14,
    color: "#6E6E6E",
    marginVertical: 10,
  },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  validationContainer: {
    marginTop: 15,
  },
  validationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },
  validationText: {
    marginLeft: 6,
    fontSize: 14,
  },
  errorText: {
    color: "red",
    marginTop: 6,
    marginLeft: 5,
  },
  button: {
    marginTop: 25,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});
