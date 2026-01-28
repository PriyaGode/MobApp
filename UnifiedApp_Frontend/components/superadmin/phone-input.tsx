import React, { useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

interface CountryCode {
  country: string;
  code: string;
  dialCode: string;
  format: string;
  maxLength: number;
}

const COUNTRY_CODES: CountryCode[] = [
  { country: 'India', code: 'IN', dialCode: '+91', format: '##### #####', maxLength: 10 },
  { country: 'United States', code: 'US', dialCode: '+1', format: '(###) ###-####', maxLength: 10 },
  { country: 'United Kingdom', code: 'GB', dialCode: '+44', format: '#### ### ####', maxLength: 10 },
  { country: 'Australia', code: 'AU', dialCode: '+61', format: '### ### ###', maxLength: 9 },
  { country: 'Canada', code: 'CA', dialCode: '+1', format: '(###) ###-####', maxLength: 10 },
  { country: 'Germany', code: 'DE', dialCode: '+49', format: '### ########', maxLength: 11 },
  { country: 'France', code: 'FR', dialCode: '+33', format: '# ## ## ## ##', maxLength: 9 },
  { country: 'Japan', code: 'JP', dialCode: '+81', format: '##-####-####', maxLength: 10 },
  { country: 'China', code: 'CN', dialCode: '+86', format: '### #### ####', maxLength: 11 },
  { country: 'Brazil', code: 'BR', dialCode: '+55', format: '(##) #####-####', maxLength: 11 },
  { country: 'Mexico', code: 'MX', dialCode: '+52', format: '## #### ####', maxLength: 10 },
  { country: 'Singapore', code: 'SG', dialCode: '+65', format: '#### ####', maxLength: 8 },
  { country: 'UAE', code: 'AE', dialCode: '+971', format: '## ### ####', maxLength: 9 },
  { country: 'Saudi Arabia', code: 'SA', dialCode: '+966', format: '## ### ####', maxLength: 9 },
];

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
  error?: boolean;
}

export function PhoneInput({ value, onChangeText, placeholder, style, error }: PhoneInputProps) {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]); // Default to India
  const [phoneNumber, setPhoneNumber] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Parse existing value when value prop changes
  React.useEffect(() => {
    if (!initialized && value) {
      // Try to extract country code and number
      const match = value.match(/^(\+\d+)\s*(.*)$/);
      if (match) {
        const dialCode = match[1];
        const number = match[2].replace(/\D/g, '');
        const country = COUNTRY_CODES.find(c => c.dialCode === dialCode);
        if (country) {
          setSelectedCountry(country);
          setPhoneNumber(number);
          setInitialized(true);
          return;
        }
      }
      // If no match, assume it's just a number
      const cleanNumber = value.replace(/\D/g, '');
      if (cleanNumber) {
        setPhoneNumber(cleanNumber);
      }
      setInitialized(true);
    }
  }, [value, initialized]);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    // Update the full phone number
    updateFullPhoneNumber(phoneNumber, country);
  };

  const handlePhoneChange = (text: string) => {
    // Remove all non-digit characters
    const digits = text.replace(/\D/g, '');
    
    // Limit to max length for the country
    const limited = digits.slice(0, selectedCountry.maxLength);
    setPhoneNumber(limited);
    
    // Update the full phone number
    updateFullPhoneNumber(limited, selectedCountry);
  };

  const updateFullPhoneNumber = (number: string, country: CountryCode) => {
    if (number) {
      onChangeText(`${country.dialCode} ${number}`);
    } else {
      onChangeText('');
    }
  };

  const formatPhoneNumber = (number: string): string => {
    if (!number) return '';
    
    let formatted = '';
    let digitIndex = 0;
    
    for (let i = 0; i < selectedCountry.format.length && digitIndex < number.length; i++) {
      if (selectedCountry.format[i] === '#') {
        formatted += number[digitIndex];
        digitIndex++;
      } else {
        formatted += selectedCountry.format[i];
      }
    }
    
    return formatted;
  };

  return (
    <View>
      <View style={[styles.container, error && styles.containerError, style]}>
        {/* Country Code Picker */}
        <Pressable
          style={styles.countryButton}
          onPress={() => setShowCountryPicker(true)}
        >
          <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
          <Text style={styles.arrow}>▼</Text>
        </Pressable>

        {/* Phone Number Input */}
        <TextInput
          style={styles.input}
          placeholder={placeholder || selectedCountry.format.replace(/#/g, '0')}
          value={formatPhoneNumber(phoneNumber)}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          placeholderTextColor="#9ca3af"
          maxLength={selectedCountry.format.length}
        />
      </View>

      {/* Country Picker Modal */}
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
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowCountryPicker(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.countryList}>
              {COUNTRY_CODES.map((country) => (
                <Pressable
                  key={country.code}
                  style={[
                    styles.countryOption,
                    selectedCountry.code === country.code && styles.countryOptionActive,
                  ]}
                  onPress={() => handleCountrySelect(country)}
                >
                  <View style={styles.countryInfo}>
                    <Text style={styles.countryName}>{country.country}</Text>
                    <Text style={styles.countryDialCode}>{country.dialCode}</Text>
                  </View>
                  {selectedCountry.code === country.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Extract dial code and number
  const match = phone.match(/^(\+\d+)\s*(.*)$/);
  if (!match) {
    return { isValid: false, error: 'Invalid phone format' };
  }

  const dialCode = match[1];
  const number = match[2].replace(/\D/g, '');
  
  // Find the country
  const country = COUNTRY_CODES.find(c => c.dialCode === dialCode);
  if (!country) {
    return { isValid: false, error: 'Invalid country code' };
  }

  // Check length
  if (number.length < country.maxLength) {
    return { isValid: false, error: `Phone number must be ${country.maxLength} digits for ${country.country}` };
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
    overflow: 'hidden',
  },
  containerError: {
    borderColor: '#ef4444',
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
    height: '100%',
    justifyContent: 'center',
  },
  dialCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 4,
  },
  arrow: {
    fontSize: 10,
    color: '#687076',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#374151',
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
    borderBottomColor: '#eceef0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#11181C',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#687076',
  },
  countryList: {
    paddingHorizontal: 20,
  },
  countryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  countryOptionActive: {
    backgroundColor: '#eff6ff',
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#11181C',
    marginBottom: 4,
  },
  countryDialCode: {
    fontSize: 14,
    color: '#687076',
  },
  checkmark: {
    fontSize: 18,
    color: '#0a7ea4',
    fontWeight: 'bold',
  },
});
