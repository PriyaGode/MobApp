import { useContext, useState, useEffect } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { setToken } from "../../components/auth/tokenStore";
import { AuthContext, LoadingContext } from "../../contexts/AuthContext";
import { API } from "../../config/apiConfig";
import { SUPERADMIN_API_BASE_URL } from "../../config";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function Login({ navigation }: Props) {
  const { setUser } = useContext(AuthContext);
  const { setLoading } = useContext(LoadingContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [coolOffTimer, setCoolOffTimer] = useState(0);
  const [loading, setLocalLoading] = useState(false); // Local loading for button

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (coolOffTimer > 0) {
      timer = setInterval(() => setCoolOffTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [coolOffTimer]);

  const handleLogin = async () => {
    if (coolOffTimer > 0) {
      Alert.alert("Too many attempts", `Please wait ${coolOffTimer}s before trying again.`);
      return;
    }

    setLocalLoading(true);
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      // Try customer API first
      let response = await fetch(API.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      let data = await response.json();

      // If customer login fails, try superadmin API
      if (response.status !== 200) {
        console.log('Customer login failed, trying superadmin API...');
        const superadminLoginUrl = `${SUPERADMIN_API_BASE_URL}/auth/login`;
        response = await fetch(superadminLoginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          signal: controller.signal,
        });
        data = await response.json();
        console.log('Superadmin API response:', data);
      }

      clearTimeout(timeoutId);
      setLocalLoading(false);
      setLoading(false);

      if (response.status === 200) {
        console.log('Login successful! User data:', data);
        console.log('User role:', data.role);
        
        // Check if this is a customer with email verification
        if (data.emailVerified === false) {
          navigation.navigate("VerifyEmail", { email });
          return;
        }

        // For both customer and admin logins
        const token = data.token || 'temp-token'; // Superadmin might not return token
        await setToken(token, data.email, data.fullName, data.userId, data.role);
        setUser({ 
          token: token, 
          email: data.email, 
          fullName: data.fullName,
          userId: data.userId,
          role: data.role
        });
        console.log('User context set with role:', data.role);
        Alert.alert("Success", `Welcome ${data.fullName}!`);
      } else {
        handleLoginError(data);
      }
    } catch (err) {
      setLocalLoading(false);
      setLoading(false);
      Alert.alert("Error", "Network request failed. Please check your connection and try again.");
    }
  };

  const handleLoginError = (data: any) => {
    let message = data.message || "Login failed";
    switch (data.errorCode) {
      case "invalid-credentials":
        message = "Incorrect email or password.";
        break;
      case "user-not-found":
        message = "No account found with this email.";
        break;
      case "disabled-user":
        message = "This account has been disabled.";
        break;
    }

    Alert.alert("Error", message);

    setFailedAttempts(prev => {
      const attempts = prev + 1;
      if (attempts >= 5) {
        setCoolOffTimer(60);
        return 0;
      }
      return attempts;
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo Placeholder */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>A</Text>
          </View>
        </View>

        <Text style={styles.title}>Join AAMRAJ</Text>
        <Text style={styles.subtitle}>Sign up to start ordering the freshest mangoes.</Text>

        {/* Email and Password Inputs */}
        <TextInput
          placeholder="Enter your email"
          style={styles.input}
          value={email}
          autoCapitalize="none"
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Enter your password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading || coolOffTimer > 0}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>
              {coolOffTimer > 0 ? `Wait ${coolOffTimer}s` : "Login"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPasswordScreen")}
          style={styles.forgotPassword}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        {/* Social Buttons */}
        <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
          <Text style={[styles.socialButtonText, { color: "#fff" }]}>Continue with Apple</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#fff",
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#FFB800",
    borderRadius: 40, // Circular logo
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#333", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 25, textAlign: "center" },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25, // rounded inputs
    marginBottom: 20,
    backgroundColor: "#fafafa",
  },
  forgotPassword: { marginTop: 10 },
  forgotText: { color: "#FFB800", textDecorationLine: "underline" },
  orText: { marginVertical: 20, fontSize: 14, color: "#999" },
  loginButton: {
    width: "100%",
    paddingVertical: 18,
    backgroundColor: "#FFB800",
    borderRadius: 30, // fully rounded
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  socialButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 30, // fully rounded
    alignItems: "center",
    marginBottom: 10,
  },
  googleButton: { backgroundColor: "#F5F5F5" },
  appleButton: { backgroundColor: "#000" },
  socialButtonText: { fontSize: 16, fontWeight: "500", color: "#333" },
});
