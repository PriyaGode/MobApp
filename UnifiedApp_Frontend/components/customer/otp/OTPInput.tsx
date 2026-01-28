import React, { useRef } from 'react';
import { NativeSyntheticEvent, StyleSheet, Text, TextInput, TextInputKeyPressEventData, View } from 'react-native';

export type OTPInputProps = {
  length?: number;
  onChange: (code: string) => void;
  value: string;
  error?: string;
  testIDPrefix?: string;
};

export const OTPInput: React.FC<OTPInputProps> = ({ length = 4, value, onChange, error, testIDPrefix = 'otp' }) => {
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    const key = e.nativeEvent.key;
    if (key === 'Backspace') {
      if (value[index]) {
        onChange(value.substring(0, index) + value.substring(index + 1));
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
        onChange(value.substring(0, index - 1) + value.substring(index));
      }
    }
  };

  const handleChange = (text: string, index: number) => {
    const char = text.slice(-1);
    const next = value.substring(0, index) + char + value.substring(index + 1);
    onChange(next);
    if (char && index < length - 1) inputs.current[index + 1]?.focus();
  };

  return (
    <View>
      <View style={styles.container}>
        {new Array(length).fill(0).map((_, i) => (
          <TextInput
            key={i}
            ref={(r) => {
              inputs.current[i] = r;
            }}
            style={[
              styles.box, 
              error ? styles.boxError : styles.boxDefault
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={value[i] ?? ''}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            returnKeyType={i === length - 1 ? 'done' : 'next'}
            accessible
            accessibilityLabel={`OTP digit ${i + 1}`}
            testID={`${testIDPrefix}-${i}`}
          />
        ))}
      </View>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 56,
    height: 56,
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: '#fff',
  },
  boxDefault: {
    borderColor: '#ddd',
    color: '#333',
  },
  boxError: {
    borderColor: '#ff6b6b',
    color: '#333',
  },
  error: { 
    marginTop: 6, 
    fontSize: 12, 
    color: '#ff6b6b',
    textAlign: 'center',
  },
});
