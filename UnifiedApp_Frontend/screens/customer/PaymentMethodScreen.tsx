import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentMethod'>;

// Limit payment methods strictly to user's requested options
type PaymentMethod = 'card' | 'apple' | 'google';

const paymentMethods = [
  {
    id: 'card' as PaymentMethod,
    title: 'Debit / Credit Card',
    icon: 'credit-card',
    subtitle: 'Visa, Mastercard, Amex, Rupay',
  },
  {
    id: 'apple' as PaymentMethod,
    title: 'Apple Pay',
    icon: 'smartphone',
    subtitle: 'Pay quickly with Apple Pay',
  },
  {
    id: 'google' as PaymentMethod,
    title: 'Google Pay',
    icon: 'smartphone',
    subtitle: 'Pay quickly with Google Pay',
  },
];

export default function PaymentMethodScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [showSavedCards, setShowSavedCards] = useState(true);
  const amount = route.params?.amount || 0;
  const orderId = route.params?.orderId;
  const orderItems = route.params?.orderItems || [];
  const summary = route.params?.summary;
  const deliveryAddress = route.params?.deliveryAddress;

  // Mock saved cards (in real app, fetch from secure storage/backend)
  const savedCards = [
    { last4: '4242', type: 'Visa', expiry: '12/25' },
    { last4: '5555', type: 'Mastercard', expiry: '08/26' },
  ];

  const handleContinue = () => {
    if (!orderId) {
      Alert.alert(
        'Error',
        'Order ID is missing. Please try again from the cart.',
        [
          { text: 'Go Back', onPress: () => navigation.goBack() }
        ]
      );
      return;
    }
    
    const payload = { amount, method: selectedMethod, orderId, orderItems, summary, deliveryAddress };
    if (selectedMethod === 'card') {
      navigation.navigate('CardDetails', { amount, orderId, orderItems, summary, deliveryAddress });
    } else {
      navigation.navigate('PaymentProcessing', payload);
    }
  };

  return (
    <View style={styles.container}>


      <ScrollView style={styles.content}>
        {/* Amount Summary */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>${amount.toFixed(2)}</Text>
          {summary && (
            <Text style={styles.amountBreakdown}>
              Subtotal ${summary.subtotal.toFixed(2)} · Ship ${summary.shipping.toFixed(2)} · Tax ${summary.taxes.toFixed(2)}
              {summary.discount > 0 && ` · Discount -$${summary.discount.toFixed(2)}`}
            </Text>
          )}
        </View>

          {/* Saved Cards Section */}
          {savedCards.length > 0 && (
            <View style={styles.savedCardsSection}>
              <TouchableOpacity 
                style={styles.savedCardsHeader}
                onPress={() => setShowSavedCards(!showSavedCards)}
              >
                <Text style={styles.sectionTitle}>Saved Cards</Text>
                <Feather 
                  name={showSavedCards ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
              {showSavedCards && savedCards.map((card, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.savedCardItem}
                  onPress={() => {
                    if (orderId) {
                      setSelectedMethod('card');
                      navigation.navigate('PaymentProcessing', { amount, method: 'card', orderId, orderItems, summary });
                    }
                  }}
                >
                  <View style={styles.cardIconBadge}>
                    <Feather name="credit-card" size={18} color="#FF9800" />
                  </View>
                  <View style={styles.savedCardInfo}>
                    <Text style={styles.savedCardType}>{card.type} •••• {card.last4}</Text>
                    <Text style={styles.savedCardExpiry}>Expires {card.expiry}</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          )}

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.methodCardSelected,
            ]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <View style={styles.methodIconContainer}>
              <Feather
                name={method.icon as any}
                size={24}
                color={selectedMethod === method.id ? '#FF9800' : '#666'}
              />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>{method.title}</Text>
              <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
            </View>
            <View
              style={[
                styles.radioButton,
                selectedMethod === method.id && styles.radioButtonSelected,
              ]}
            >
              {selectedMethod === method.id && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Feather name="shield" size={16} color="#4CAF50" />
          <Text style={styles.securityText}>
            Your payment information is secure and encrypted
          </Text>
        </View>
        
          {/* Security Badges */}
          <View style={styles.securityBadges}>
            <View style={styles.badge}>
              <Feather name="lock" size={14} color="#4CAF50" />
              <Text style={styles.badgeText}>256-bit SSL</Text>
            </View>
            <View style={styles.badge}>
              <Feather name="check-circle" size={14} color="#4CAF50" />
              <Text style={styles.badgeText}>PCI Compliant</Text>
            </View>
            <View style={styles.badge}>
              <Feather name="shield" size={14} color="#4CAF50" />
              <Text style={styles.badgeText}>Verified</Text>
            </View>
          </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2C',
  },
    securityBadges: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      marginTop: 16,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#E5E5E5',
      gap: 4,
    },
    badgeText: {
      fontSize: 11,
      color: '#4CAF50',
      fontWeight: '600',
    },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  amountCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFD54F',
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF9800',
  },
  amountBreakdown: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 16,
  },
    savedCardsSection: {
      marginBottom: 20,
    },
    savedCardsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    savedCardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#E5E5E5',
    },
    cardIconBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFF9E6',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    savedCardInfo: {
      flex: 1,
    },
    savedCardType: {
      fontSize: 15,
      fontWeight: '600',
      color: '#2C2C2C',
      marginBottom: 2,
    },
    savedCardExpiry: {
      fontSize: 13,
      color: '#666',
    },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  methodCardSelected: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF9E6',
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#FF9800',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF9800',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginTop: 24,
    gap: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#2E7D32',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#FF9800',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
