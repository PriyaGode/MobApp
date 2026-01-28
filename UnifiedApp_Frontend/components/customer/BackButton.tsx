import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

type Props = {
  onPress?: () => void; // optional custom action
};

export default function BackButton({ onPress }: Props) {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress(); // use custom handler if provided
    } else {
      navigation.goBack(); // default goBack
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.backButton}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} // easier to tap
    >
      <Text style={styles.backText}>← Back</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  backText: {
    color: "#2196F3",
    fontSize: 18,
    fontWeight: "bold",
  },
});
