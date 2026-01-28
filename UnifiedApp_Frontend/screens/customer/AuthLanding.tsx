import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useContext } from "react";
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from "@expo/vector-icons";
import type { RootStackParamList } from "../../App";
import { AuthContext, LoadingContext } from "../../contexts/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "AuthLanding">;

const backgroundImage =
  "https://image.pollinations.ai/prompt/flux%20render%20of%20mango%20grove%20sunrise%20still%20life";

export default function AuthLanding({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { setLoading } = useContext(LoadingContext);
  const { setUserToken, setUser } = useContext(AuthContext);

  const handleGuest = () => {
    setLoading(true);
    setTimeout(() => {
      setUserToken("guest");
      setUser({
        token: "guest",
        email: "guest@local",
        fullName: "Guest User",
      });
      setLoading(false);
    }, 500);
  };

  return (
    <ImageBackground
      source={{ uri: backgroundImage }}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <View style={[styles.container, { paddingTop: insets.top || 20 }]}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate("Onboarding")}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Title Section */}
        <View style={styles.branding}>
          <Text style={styles.kicker}>Fresh harvest · High pixel detail</Text>
          <Text style={styles.title}>Welcome to AAMRAJ</Text>
          <Text style={styles.subtitle}>
            Discover orchard-picked mangoes, premium pantry goods, and artisan beverages—all in one app.
          </Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.buttonWrapper}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonText}>Sign in with Email</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.buttonWrapper}
            onPress={() => navigation.navigate("PhoneEntry")}
          >
            <Text style={styles.buttonText}>Sign in with Phone Number</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.buttonWrapper, styles.outlineButton]}
            onPress={handleGuest}
          >
            <Text style={[styles.buttonText, { color: "#FFB800" }]}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Links */}
        <View style={styles.bottomLinks}>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>Already have an account? Log in</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.link}>Create new account with email verification</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  backgroundImage: { transform: [{ scale: 1.05 }] },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  branding: {
    gap: 10,
  },
  kicker: {
    color: "#F5F5F5",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontSize: 12,
  },
  title: { fontSize: 32, fontWeight: "800", color: "#FFFFFF" },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: "#F0F0F0",
  },
  actions: {
    alignItems: "center",
    gap: 12,
  },
  buttonWrapper: {
    width: "100%",
    backgroundColor: "#FFB800",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  outlineButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#FFB800",
  },
  bottomLinks: { marginTop: 16 },
  link: { color: "#BBDEFB", marginVertical: 5, textAlign: "center" },
});
