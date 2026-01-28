import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
  outline?: boolean;
  disabled?: boolean;
};

export default function Button({ title, onPress, outline, disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, outline && styles.outline, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, outline && styles.textOutline, disabled && styles.textDisabled]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    width: "80%",
    marginVertical: 10,
    alignItems: "center"
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2196F3"
  },
  text: { color: "white", fontWeight: "bold" },
  textOutline: { color: "#2196F3" },
  disabled: { opacity: 0.6 },
  textDisabled: { color: "#E0E0E0" }
});
