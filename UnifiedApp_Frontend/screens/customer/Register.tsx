import React, { useContext, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { AuthContext, LoadingContext } from "../../contexts/AuthContext";
import { createSignupPayload } from "../../utils/deviceInfo";
import { secureStorage } from "../../utils/secureStorage";
import {
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validatePassword,
  validateTerms,
} from "../../utils/validation";
import { API } from "../../config/apiConfig";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

interface FormErrors {
  fullName?: string | null;
  email?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
  terms?: string | null;
}

export default function Register({ navigation }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiMessage, setApiMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({ text: "", type: "" });
  const [isRegistered, setIsRegistered] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const { setUser } = useContext(AuthContext);
  const { loading, setLoading } = useContext(LoadingContext);

  const validateField = (field: keyof FormErrors, value: string) => {
    let error: string | null = null;
    switch (field) {
      case "fullName":
        error = validateFullName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(password, value);
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateTermsField = (accepted: boolean) => {
    const error = validateTerms(accepted);
    setErrors((prev) => ({ ...prev, terms: error }));
  };

  const handleRegister = async () => {
    const fullNameError = validateFullName(fullName);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
    const termsError = validateTerms(acceptedTerms);

    setErrors({
      fullName: fullNameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      terms: termsError,
    });

    if (fullNameError || emailError || passwordError || confirmPasswordError || termsError) {
      setApiMessage({
        text: "Please fix the highlighted errors before continuing.",
        type: "error",
      });
      return;
    }

    const signupPayload = createSignupPayload({
      fullName,
      email,
      password,
      referralCode: referralCode || undefined,
    });

    setLoading(true);
    setApiMessage({ text: "", type: "" });

    try {
      const response = await fetch(API.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupPayload),
      });

      const data = await response.json();
      console.log("Register Response:", data);

      if (response.status === 201) {
        setApiMessage({ text: data.message, type: "success" });
        await secureStorage.setUserData({
          fullName,
          email,
          verified: false,
          pendingToken: null,
        });
        setIsRegistered(true);
        setIsVerified(false);
      } else if (response.status === 409 && data.emailVerified === false) {
        setApiMessage({ text: data.message, type: "error" });
        setIsRegistered(true);
        setIsVerified(false);
      } else if (response.status === 409 && data.emailVerified === true) {
        setApiMessage({
          text: "Email already verified. Please login.",
          type: "success",
        });
        setIsRegistered(true);
        setIsVerified(true);
      } else {
        setApiMessage({
          text: data.message || "Something went wrong. Please try again.",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Register Error:", err);
      setApiMessage({
        text: "Network error. Please try again later.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {/* Full Name */}
      {!isRegistered && (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="Enter your full name"
            style={[styles.input, errors.fullName && styles.inputError]}
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              validateField("fullName", text);
            }}
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
        </View>
      )}

      {/* Email */}
      {!isRegistered && (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholder="Enter your email"
            style={[styles.input, errors.email && styles.inputError]}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(text) => {
              setEmail(text);
              validateField("email", text);
            }}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>
      )}

      {/* Password */}
      {!isRegistered && (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Enter password"
              style={[styles.passwordInput, errors.password && styles.inputError]}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                validateField("password", text);
                if (confirmPassword) validateField("confirmPassword", confirmPassword);
              }}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword((s) => !s)}
            >
              <Text style={styles.eyeText}>{showPassword ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>
      )}

      {/* Confirm Password */}
      {!isRegistered && (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Re-enter password"
              style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                validateField("confirmPassword", text);
              }}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword((s) => !s)}
            >
              <Text style={styles.eyeText}>{showConfirmPassword ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>
      )}

      {/* Referral Code */}
      {!isRegistered && (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Referral Code (Optional)</Text>
          <TextInput
            placeholder="Enter referral code"
            style={styles.input}
            value={referralCode}
            onChangeText={setReferralCode}
          />
        </View>
      )}

      {/* Terms */}
      {!isRegistered && (
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
            onPress={() => {
              const newVal = !acceptedTerms;
              setAcceptedTerms(newVal);
              validateTermsField(newVal);
            }}
          >
            {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <Text style={styles.checkboxText}>
            I accept the <Text style={styles.link}>Terms & Conditions</Text> and{" "}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>
      )}

      {!isRegistered && errors.terms && (
        <Text style={styles.errorText}>{errors.terms}</Text>
      )}

      {/* API Message */}
      {apiMessage.text ? (
        <Text
          style={[
            styles.apiMessage,
            apiMessage.type === "success" ? styles.successText : styles.errorText,
          ]}
        >
          {apiMessage.text}
        </Text>
      ) : null}

      {/* Buttons */}
      {!isRegistered && (
        <TouchableOpacity
          style={[styles.registerButton, loading && styles.disabledButton]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Register</Text>
          )}
        </TouchableOpacity>
      )}

      {isRegistered && !isVerified && (
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate("VerifyEmail", { email })}
        >
          <Text style={styles.registerButtonText}>Verify Email</Text>
        </TouchableOpacity>
      )}

{/* Already have an account? Login */}
<View style={styles.loginRedirectContainer}>
  <Text style={styles.loginText}>Already have an account? </Text>
  <Text
    style={styles.loginLink}
    onPress={() => navigation.navigate("Login")}
  >
    Login
  </Text>
</View>


    </ScrollView>
  );
}
// ... rest of imports and component code remain unchanged
const styles = StyleSheet.create({
  container: {
      flexGrow: 1,
      justifyContent: "flex-end", // push content towards bottom
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 60, // top spacing
      paddingBottom: 40, // bottom spacing
      backgroundColor: "#FFFFFF",
    },

    title: {
      fontSize: 26,
      fontWeight: "800",
      color: "#333",
      marginBottom: 30,
    },
  fieldContainer: {
    width: "100%",
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginLeft: 4,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },

  inputError: {
    borderColor: "#FF3B30",
    borderWidth: 1.5,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },

  eyeButton: {
    position: "absolute",
    right: 14,
    padding: 4,
  },

  eyeText: {
    color: "#FFB300", // NEW THEME COLOR
    fontSize: 14,
    fontWeight: "600",
  },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    marginVertical: 15,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 5,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  checkboxChecked: {
    backgroundColor: "#F4C20F", // NEW CHECK COLOR
    borderColor: "#F4C20F",
  },

  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

  checkboxText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },

  link: {
    color: "#F4C20F", // NEW LINK COLOR
    fontWeight: "600",
  },

  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  apiMessage: {
    textAlign: "center",
    marginBottom: 15,
    fontSize: 14,
    fontWeight: "600",
  },

  successText: {
    color: "#2E7D32",
  },

  registerButton: {
    backgroundColor: "#F4C20F", // NEW PRIMARY BUTTON COLOR
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  registerButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.6,
  },



  loginRedirectContainer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
  },

  loginText: {
    fontSize: 14,
    color: "#777",
  },

  loginLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#00A86B",  // green theme
  },

});
