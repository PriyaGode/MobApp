import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Button from "./customer/Button";

interface Props {
  onRetry: () => void;
}

export default function OfflineScreen({ onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Feather name="wifi-off" size={64} color="#888" />
      <Text style={styles.title}>You are Offline</Text>
      <Text style={styles.message}>
        No internet connection found. Check your connection or try again.
      </Text>
      <Button title="Try Again" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
});