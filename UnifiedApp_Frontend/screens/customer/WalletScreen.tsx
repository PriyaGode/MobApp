import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Wallet'>;

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet';
  name: string;
  details: string;
  isDefault?: boolean;
  logo?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    name: 'Visa ending in 4242',
    details: 'Expires 12/25',
    isDefault: true,
    logo: 'visa',
  },
  {
    id: '2',
    type: 'card',
    name: 'Mastercard ending in 8899',
    details: 'Expires 09/24',
    logo: 'mastercard',
  },
  {
    id: '3',
    type: 'wallet',
    name: 'Apple Pay',
    details: 'Connected',
    logo: 'apple',
  },
  {
    id: '4',
    type: 'wallet',
    name: 'PayPal',
    details: 'mangolover@email.com',
    logo: 'paypal',
  },
];

export default function WalletScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const handleAddPaymentMethod = () => {
    console.log('Add new payment method');
  };

  const handlePaymentMethodOptions = (methodId: string) => {
    console.log('Payment method options:', methodId);
  };

  const renderPaymentMethodLogo = (logo: string) => {
    switch (logo) {
      case 'visa':
        return (
          <View style={styles.cardLogo}>
            <Text style={styles.visaText}>VISA</Text>
          </View>
        );
      case 'mastercard':
        return (
          <View style={styles.cardLogo}>
            <View style={styles.mastercardCircles}>
              <View style={[styles.mastercardCircle, { backgroundColor: '#EB001B' }]} />
              <View style={[styles.mastercardCircle, { backgroundColor: '#F79E1B', marginLeft: -8 }]} />
            </View>
          </View>
        );
      case 'apple':
        return (
          <View style={[styles.cardLogo, { backgroundColor: '#000' }]}>
            <MaterialIcons name="rocket-launch" size={16} color="#fff" />
            <Text style={styles.applePayText}>Pay</Text>
          </View>
        );
      case 'paypal':
        return (
          <View style={styles.cardLogo}>
            <Text style={styles.paypalText}>
              Pay<Text style={{ color: '#009cde' }}>Pal</Text>
            </Text>
          </View>
        );
      default:
        return <View style={styles.cardLogo} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#181611" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Default Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Method</Text>
          
          {paymentMethods
            .filter(method => method.isDefault)
            .map((method) => (
              <TouchableOpacity key={method.id} style={styles.defaultMethodCard}>
                <View style={styles.methodContent}>
                  {renderPaymentMethodLogo(method.logo!)}
                  <View style={styles.methodDetails}>
                    <View style={styles.methodNameRow}>
                      <Text style={styles.methodName}>{method.name}</Text>
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    </View>
                    <Text style={styles.methodSubtext}>{method.details}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.moreButton}
                  onPress={() => handlePaymentMethodOptions(method.id)}
                >
                  <MaterialIcons name="more-vert" size={20} color="#8a8060" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          }
        </View>

        {/* Saved Methods Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Cards & Wallets</Text>
          
          <View style={styles.methodsList}>
            {paymentMethods
              .filter(method => !method.isDefault)
              .map((method) => (
                <TouchableOpacity key={method.id} style={styles.methodCard}>
                  <View style={styles.methodContent}>
                    {renderPaymentMethodLogo(method.logo!)}
                    <View style={styles.methodDetails}>
                      <Text style={styles.methodName}>{method.name}</Text>
                      <Text style={styles.methodSubtext}>{method.details}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.moreButton}
                    onPress={() => handlePaymentMethodOptions(method.id)}
                  >
                    <MaterialIcons name="more-vert" size={20} color="#8a8060" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            }
          </View>
        </View>

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <MaterialIcons name="lock" size={18} color="#8a8060" />
          <Text style={styles.securityText}>Secure Payment Processing</Text>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Payment Method Button */}
      <View style={styles.bottomButton}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPaymentMethod}>
          <MaterialIcons name="add-circle" size={24} color="#181611" />
          <Text style={styles.addButtonText}>Add New Payment Method</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#f8f8f5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181611',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181611',
    marginBottom: 12,
    marginLeft: 4,
  },
  defaultMethodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#f4c025',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  methodsList: {
    gap: 12,
  },
  methodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardLogo: {
    width: 64,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexDirection: 'row',
  },
  visaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1f71',
  },
  mastercardCircles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mastercardCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  applePayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 2,
  },
  paypalText: {
    fontSize: 14,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#003087',
  },
  methodDetails: {
    flex: 1,
  },
  methodNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181611',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#f4c025',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#181611',
    textTransform: 'uppercase',
  },
  methodSubtext: {
    fontSize: 14,
    color: '#8a8060',
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 120,
    opacity: 0.5,
  },
  securityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#181611',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
  },
  addButton: {
    backgroundColor: '#FFC300',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
});