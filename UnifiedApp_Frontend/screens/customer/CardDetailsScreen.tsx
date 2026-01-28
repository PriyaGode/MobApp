import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'CardDetails'>;

export default function CardDetailsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  const amount = route.params?.amount || 0;

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    setCardNumber(formatCardNumber(text));
  };

  const handleExpiryChange = (text: string) => {
    setExpiryDate(formatExpiry(text));
  };

  const handlePay = () => {
    // Validate inputs
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      Alert.alert('Invalid Card', 'Please enter a valid card number');
      return;
    }
    if (!cardHolder.trim()) {
      Alert.alert('Missing Information', 'Please enter card holder name');
      return;
    }
    if (!expiryDate || expiryDate.length < 5) {
      Alert.alert('Invalid Expiry', 'Please enter valid expiry date');
      return;
    }
    if (!cvv || cvv.length < 3) {
      Alert.alert('Invalid CVV', 'Please enter valid CVV');
      return;
    }

    navigation.navigate('PaymentProcessing', { 
      amount, 
      method: 'card',
      orderId: route.params?.orderId || 'unknown',
      orderItems: route.params?.orderItems,
      summary: route.params?.summary,
      deliveryAddress: route.params?.deliveryAddress,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={[styles.content, { paddingTop: insets.top || 0, paddingBottom: insets.bottom + 80 }]}>
        {/* Amount Display */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Paying</Text>
          <Text style={styles.amountValue}>${amount.toFixed(2)}</Text>
        </View>

        {/* Card Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Card Number</Text>
          <View style={styles.inputContainer}>
            <Feather name="credit-card" size={20} color="#999" />
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              keyboardType="number-pad"
              maxLength={19}
            />
          </View>
        </View>

        {/* Card Holder */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Card Holder Name</Text>
          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color="#999" />
            <TextInput
              style={styles.input}
              value={cardHolder}
              onChangeText={setCardHolder}
              placeholder="JOHN DOE"
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Expiry and CVV */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>Expiry Date</Text>
            <View style={styles.inputContainer}>
              <Feather name="calendar" size={20} color="#999" />
              <TextInput
                style={styles.input}
                value={expiryDate}
                onChangeText={handleExpiryChange}
                placeholder="MM/YY"
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>CVV</Text>
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#999" />
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Save Card Checkbox */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setSaveCard(!saveCard)}
        >
          <View style={[styles.checkbox, saveCard && styles.checkboxChecked]}>
            {saveCard && <Feather name="check" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>Save this card for future payments</Text>
        </TouchableOpacity>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Feather name="shield" size={16} color="#4CAF50" />
          <Text style={styles.securityText}>
            Your card details are secure and encrypted with 256-bit SSL
          </Text>
        </View>

        {/* Accepted Cards */}
        <View style={styles.acceptedCards}>
          <Text style={styles.acceptedCardsText}>We accept:</Text>
          <View style={styles.cardLogos}>
            <View style={styles.cardLogo}>
              <Text style={styles.cardLogoText}>VISA</Text>
            </View>
            <View style={styles.cardLogo}>
              <Text style={styles.cardLogoText}>MC</Text>
            </View>
            <View style={styles.cardLogo}>
              <Text style={styles.cardLogoText}>AMEX</Text>
            </View>
            <View style={styles.cardLogo}>
              <Text style={styles.cardLogoText}>RUPAY</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Pay Button */}
      <View style={[styles.footer, { paddingBottom: (insets.bottom || 0) + 12 }]}>
        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payButtonText}>Pay ${amount.toFixed(2)}</Text>
          <Feather name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  content: {
    flex: 1,
    padding: 16,
  },
  amountCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFD54F',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF9800',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#2C2C2C',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: '#666',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#2E7D32',
  },
  acceptedCards: {
    marginBottom: 20,
  },
  acceptedCardsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardLogos: {
    flexDirection: 'row',
    gap: 12,
  },
  cardLogo: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cardLogoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  payButton: {
    flexDirection: 'row',
    backgroundColor: '#f4c025',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
