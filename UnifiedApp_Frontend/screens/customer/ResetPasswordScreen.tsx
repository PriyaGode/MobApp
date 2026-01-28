import * as Linking from "expo-linking";
import React, { useContext, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import Button from "../../components/customer/Button";
import { API } from "../../config/apiConfig";
import { LoadingContext } from "../../contexts/AuthContext";

interface Props {
  route: any;
  navigation: any;
}

const ResetPasswordScreen: React.FC<Props> = ({ route, navigation }) => {
  const { setLoading } = useContext(LoadingContext);
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(
    Array.isArray(route?.params?.token) 
      ? route.params.token[0] 
      : route?.params?.token || null
  );

  // Handle deep links if app is already open
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      const parsed = Linking.parse(url);
      if (parsed.path?.startsWith("reset-password")) {
        const tokenParam = parsed.queryParams?.token || parsed.path.split("/")[1];
        setToken(Array.isArray(tokenParam) ? tokenParam[0] : tokenParam || null);
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleReset = async () => {
    if (!password) return Alert.alert("Error", "Enter new password");
    if (!token) return Alert.alert("Error", "Invalid or missing token");

    setLoading(true);
    try {
      const res = await fetch(API.RESET_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.status === 200) {
        Alert.alert("Success", "Password reset successfully");
        navigation.navigate("Login");
      } else {
        Alert.alert("Error", data.message || "Invalid token");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      Alert.alert("Error", "Network error. Try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Reset Password" onPress={handleReset} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
});

export default ResetPasswordScreen;
