import React, { useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  minLength: number;
  maxLength: number;
}

const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', minLength: 10, maxLength: 10 },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', minLength: 10, maxLength: 10 },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', minLength: 10, maxLength: 11 },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', minLength: 10, maxLength: 10 },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', minLength: 9, maxLength: 9 },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', minLength: 10, maxLength: 12 },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', minLength: 9, maxLength: 9 },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', minLength: 10, maxLength: 11 },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', minLength: 11, maxLength: 11 },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', minLength: 10, maxLength: 11 },
];

interface SimplePhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
  error?: boolean;
}

export function SimplePhoneInput({ value, onChangeText, placeholder, style, error }: SimplePhoneInputProps) {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Default to India

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    // Clear the current number when changing country
    onChangeText('');
  };

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    const limited = digits.slice(0, selectedCountry.maxLength);
    onChangeText(limited ? `${selectedCountry.dialCode} ${limited}` : '');
  };

  const getDisplayNumber = () => {
    if (!value) return '';
    return value.replace(selectedCountry.dialCode + ' ', '');
  };

  return (
    <>
      <View style={[styles.container, error && styles.containerError, style]}>
        <Pressable 
          style={styles.countrySelector} 
          onPress={() => setShowCountryPicker(true)}
        >
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
          <Text style={styles.arrow}>▼</Text>
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder={placeholder || "Enter phone number"}
          value={getDisplayNumber()}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          placeholderTextColor="#9ca3af"
          maxLength={selectedCountry.maxLength}
        />
      </View>

      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <Pressable onPress={() => setShowCountryPicker(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.countryList}>
              {COUNTRIES.map((country) => (
                <Pressable
                  key={country.code}
                  style={[
                    styles.countryItem,
                    selectedCountry.code === country.code && styles.countryItemSelected
                  ]}
                  onPress={() => handleCountrySelect(country)}
                >
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <Text style={styles.countryName}>{country.name}</Text>
                  <Text style={styles.countryDialCode}>{country.dialCode}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Extract dial code and number
  const parts = phone.trim().split(' ');
  if (parts.length < 2) {
    return { isValid: false, error: 'Invalid phone number format' };
  }

  const dialCode = parts[0];
  const number = parts.slice(1).join('').replace(/\D/g, '');
  
  // Find the country for this dial code
  const country = COUNTRIES.find(c => c.dialCode === dialCode);
  if (!country) {
    return { isValid: false, error: 'Invalid country code' };
  }

  // Validate number length for the specific country
  if (number.length < country.minLength) {
    return { isValid: false, error: `Phone number must be at least ${country.minLength} digits for ${country.name}` };
  }

  if (number.length > country.maxLength) {
    return { isValid: false, error: `Phone number must be at most ${country.maxLength} digits for ${country.name}` };
  }

  // Additional validation for specific countries
  if (country.code === 'IN' && !number.match(/^[6-9]\d{9}$/)) {
    return { isValid: false, error: 'Invalid Indian mobile number format' };
  }

  if (country.code === 'US' && !number.match(/^[2-9]\d{2}[2-9]\d{6}$/)) {
    return { isValid: false, error: 'Invalid US phone number format' };
  }

  return { isValid: true };
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  containerError: {
    borderColor: '#ef4444',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  flag: {
    fontSize: 20,
    marginRight: 4,
  },
  dialCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 4,
  },
  arrow: {
    fontSize: 10,
    color: '#9ca3af',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingHorizontal: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  closeButton: {
    fontSize: 20,
    color: '#9ca3af',
    padding: 4,
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  countryItemSelected: {
    backgroundColor: '#eff6ff',
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  countryDialCode: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
});

// Export country data for use in other components
export { COUNTRIES, type Country };
