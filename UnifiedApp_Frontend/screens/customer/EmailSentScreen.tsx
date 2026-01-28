import * as Linking from "expo-linking";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type EmailSentScreenProps = {
  route: { params: { email: string } };
  navigation: any;
};

export default function EmailSentScreen({ route, navigation }: EmailSentScreenProps) {
  const { email } = route.params;

  const handleResend = () => {
    navigation.navigate("ForgotPasswordScreen");
  };

  const handleOpenDeepLink = async () => {
    const token = "demo123"; // You can replace this with a real token for testing
    const url = `exp://172.16.80.95:8081/--/reset-password/${token}`;

    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert("Error", "Failed to open deep link.");
      console.error("Deep link error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check Your Email</Text>
      <Text style={styles.message}>
        We sent a password reset link to {email}. Please check your inbox or spam folder.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleResend}>
        <Text style={styles.buttonText}>Resend Link</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#28a745", marginTop: 10 }]}
        onPress={handleOpenDeepLink}
      >
        <Text style={styles.buttonText}>Test Deep Link</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  message: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  button: { backgroundColor: "#007bff", padding: 12, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
