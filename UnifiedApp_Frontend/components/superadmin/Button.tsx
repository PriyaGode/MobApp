import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  outline?: boolean; // renders outline variant
  style?: ViewStyle | ViewStyle[];
}

// Simple reusable button component (restored)
export default function Button({ title, onPress, disabled, loading, outline, style }: ButtonProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, outline && styles.outline, (disabled || loading) && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.title, outline && styles.outlineText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2563EB'
  },
  disabled: {
    backgroundColor: '#9CA3AF'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  outlineText: {
    color: '#2563EB'
  }
});
