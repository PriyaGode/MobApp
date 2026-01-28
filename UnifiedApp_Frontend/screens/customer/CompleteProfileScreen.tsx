// CompleteProfileScreen.tsx
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LoadingContext, AuthContext } from "../../contexts/AuthContext";
import { API } from "../../config/apiConfig";

export default function CompleteProfileScreen({ route }: any) {
  const navigation: any = useNavigation();
  const { loading, setLoading } = useContext(LoadingContext);
  const { setUser, setUserToken } = useContext(AuthContext);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(route?.params?.phoneE164 || "");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleProfileUpdate = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    if (!fullName.trim()) {
      Alert.alert("Error", "Full Name is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API.UPDATE_PROFILE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone }),
      });

      const data = await response.json();

      if (data.success) {
        // ✅ Store user info in context
        const token = data.token || "dummy-token"; // fallback token
        setUser({ token, email, fullName });
        setUserToken(token);

        // ✅ Delay slightly to ensure navigator renders Main
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Main" }],
          });
        }, 50);

      } else {
        Alert.alert("Error", data.message || "Something went wrong");
      }
    } catch (err) {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            We just need a few details to finish setting up your account.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            editable={false}
          />

          <TouchableOpacity style={styles.button} onPress={handleProfileUpdate}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  innerContainer: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#555", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
