import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { API } from "../../config/apiConfig";

interface VerifyEmailProps {
  route: { params: { email: string } };
  navigation: any;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ route, navigation }) => {
  const { email } = route.params || {};
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({ text: "", type: "" });
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [verified, setVerified] = useState(false);

  // Check email verification status on mount
  useEffect(() => {
    const checkEmailVerified = async () => {
      setLoading(true);
      try {
        console.log("Checking email:", email);
        const response = await fetch(`${API.CHECK_EMAIL}?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        console.log("Check Verified Response:", data);
        if (data.emailVerified) {
          setVerified(true);
          setApiMessage({ text: "Email already verified!", type: "success" });
        }
      } catch (err) {
        console.error("Check Verified Error:", err);
      } finally {
        setLoading(false);
      }
    };
    checkEmailVerified();
  }, [email]);

  // Resend timer countdown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Verify OTP
  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setApiMessage({ text: "Please enter the verification code.", type: "error" });
      return;
    }

    setLoading(true);
    setApiMessage({ text: "", type: "" });

    try {
      console.log("Verifying email:", email, "OTP:", verificationCode);
      const response = await fetch(API.VERIFY_EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: verificationCode }),
      });

      const data = await response.json();
      console.log("Verify Response:", data);

      if (response.ok) {
        setApiMessage({ text: data.message || "Email verified successfully!", type: "success" });
        setVerified(true);
      } else {
        setApiMessage({ text: data.message || "Invalid or expired code.", type: "error" });
      }
    } catch (err) {
      console.error("Verify Error:", err);
      setApiMessage({ text: "Network error. Please try again later.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendEmail = async () => {
    if (!canResend) return;

    setLoading(true);
    setCanResend(false);
    setResendTimer(60);
    setApiMessage({ text: "", type: "" });

    try {
      console.log("Resending OTP to email:", email);
      const response = await fetch(API.RESEND_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log("Resend Response:", data);

      if (response.ok) {
        setApiMessage({ text: data.message || "Verification email resent successfully!", type: "success" });
      } else {
        setApiMessage({ text: data.message || "Failed to resend email.", type: "error" });
      }
    } catch (err) {
      console.error("Resend Error:", err);
      setApiMessage({ text: "Network error. Please try again later.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : !verified ? (
        <>
          <Text style={styles.subText}>
            A verification code has been sent to <Text style={styles.emailText}>{email}</Text>.
          </Text>

          <TextInput
            placeholder="Enter verification code"
            value={verificationCode}
            onChangeText={setVerificationCode}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="numeric"
          />

          {apiMessage.text && (
            <Text
              style={[
                styles.apiMessage,
                apiMessage.type === "success" ? styles.successText : styles.errorText,
              ]}
            >
              {apiMessage.text}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Email</Text>}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn’t receive the email?</Text>
            <TouchableOpacity onPress={handleResendEmail} disabled={!canResend || loading}>
              <Text style={[styles.resendLink, (!canResend || loading) && styles.disabledText]}>
                {canResend ? "Resend Email" : `Resend in ${resendTimer}s`}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {apiMessage.text && <Text style={[styles.apiMessage, styles.successText]}>{apiMessage.text}</Text>}

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default VerifyEmail;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 25, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 10, textAlign: "center", color: "#111" },
  subText: { fontSize: 14, color: "#444", textAlign: "center", marginBottom: 30 },
  emailText: { color: "#007bff", fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 15 },
  apiMessage: { textAlign: "center", marginBottom: 10, fontSize: 14, fontWeight: "500" },
  successText: { color: "#2e7d32" },
  errorText: { color: "#d32f2f" },
  button: { backgroundColor: "#007bff", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 20 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  disabledButton: { opacity: 0.7 },
  resendContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  resendText: { color: "#444", fontSize: 14 },
  resendLink: { color: "#007bff", fontWeight: "600", marginLeft: 5 },
  disabledText: { color: "#999" },
});
