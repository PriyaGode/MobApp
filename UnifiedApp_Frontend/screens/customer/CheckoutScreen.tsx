import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

type PaymentMethod = 'card' | 'upi' | 'cod';

export default function CheckoutScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const amount = route.params?.amount || 1260;
  const orderId = route.params?.orderId;
  const orderItems = route.params?.orderItems || [];
  const summary = route.params?.summary;
  const deliveryAddress = route.params?.deliveryAddress;

  const handlePlaceOrder = () => {
    if (!orderId) {
      Alert.alert('Error', 'Order ID is missing. Please try again from the cart.');
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CHECKOUT</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Row */}
      <View style={styles.progressRow}>
        <Text style={styles.progressInactive}>Bag</Text>
        <View style={styles.progressLine} />
        <Text style={styles.progressInactive}>Address</Text>
        <View style={styles.progressLine} />
        <Text style={styles.progressActive}>Payment</Text>
        <View style={styles.progressLine} />
        <Text style={styles.progressInactive}>Review</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <MaterialIcons name="location-on" size={24} color="#181611" />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressTitle}>Home</Text>
              <Text style={styles.addressText}>{deliveryAddress || '123 Mango Lane, Bandra West, Mumbai, Maharashtra 400050'}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          {/* Saved Card (Selected) */}
          <TouchableOpacity
            style={[styles.paymentCard, selectedMethod === 'card' && styles.paymentCardSelected]}
            onPress={() => setSelectedMethod('card')}
          >
            <View style={styles.paymentIcon}>
              <MaterialIcons name="credit-card" size={24} color="#181611" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Visa ending in 4242</Text>
              <Text style={styles.paymentSubtitle}>Expires 12/25</Text>
            </View>
            <View style={[styles.radioButton, selectedMethod === 'card' && styles.radioButtonSelected]}>
              {selectedMethod === 'card' && <MaterialIcons name="check" size={14} color="#181611" />}
            </View>
          </TouchableOpacity>

          {/* UPI */}
          <TouchableOpacity
            style={[styles.paymentCard, selectedMethod === 'upi' && styles.paymentCardSelected]}
            onPress={() => setSelectedMethod('upi')}
          >
            <View style={styles.paymentIcon}>
              <MaterialIcons name="qr-code-scanner" size={24} color="#181611" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>UPI / Google Pay</Text>
              <Text style={styles.paymentSubtitle}>Pay securely via UPI apps</Text>
            </View>
            <View style={[styles.radioButton, selectedMethod === 'upi' && styles.radioButtonSelected]}>
              {selectedMethod === 'upi' && <MaterialIcons name="check" size={14} color="#181611" />}
            </View>
          </TouchableOpacity>

          {/* COD */}
          <TouchableOpacity
            style={[styles.paymentCard, selectedMethod === 'cod' && styles.paymentCardSelected]}
            onPress={() => setSelectedMethod('cod')}
          >
            <View style={styles.paymentIcon}>
              <MaterialIcons name="local-shipping" size={24} color="#181611" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Cash on Delivery</Text>
              <Text style={styles.paymentSubtitle}>Pay cash upon delivery</Text>
            </View>
            <View style={[styles.radioButton, selectedMethod === 'cod' && styles.radioButtonSelected]}>
              {selectedMethod === 'cod' && <MaterialIcons name="check" size={14} color="#181611" />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            {/* Items */}
            {orderItems.map((item, index) => (
              <View key={index}>
                <View style={styles.itemRow}>
                  <Image
                    source={{ uri: item.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQVh-jxUpD92qfZvJmsS8oM-gHAjtid3q9rMJ_Pi-fQlflF9yw6JgJhXTpIrV-JV0Il14_LyQOBXBYsO-7MK8wr4GHHJQmbRyWrCCTWRe3ZMRpvkkfKxp2qa0koUin1vr4eXug39m4CyapZKYXZsCluplLrRExZvt49sXWq14H8xzmkvQI78iiXwgWoRL2kz24rp5MWOu2L1K0wx1fG_P_cfw7WieYq9Wy2nA3JcC_eL5IFv17h9nH1iSvB7ZEKZ43xuQMxQ7DdrnO' }}
                    style={styles.itemImage}
                  />
                  <View style={styles.itemInfo}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{item.name}</Text>
                      <Text style={styles.itemPrice}>${item.lineTotal}</Text>
                    </View>
                    <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                  </View>
                </View>
                {index < orderItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}

            <View style={styles.divider} />

            {/* Cost Breakdown */}
            <View style={styles.costBreakdown}>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Subtotal</Text>
                <Text style={styles.costValue}>${summary?.subtotal || 0}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Shipping</Text>
                <Text style={styles.costValueFree}>{summary?.shipping === 0 ? 'Free' : `$${summary?.shipping || 0}`}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Taxes</Text>
                <Text style={styles.costValue}>${summary?.taxes || 0}</Text>
              </View>
              {summary?.discount > 0 && (
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Discount</Text>
                  <Text style={styles.costValueDiscount}>-${summary.discount}</Text>
                </View>
              )}
            </View>

            <View style={styles.dashedDivider} />

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>${amount}</Text>
            </View>
          </View>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <MaterialIcons name="lock" size={12} color="#8a8060" />
          <Text style={styles.securityText}>SECURE SSL ENCRYPTED TRANSACTION</Text>
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.totalSection}>
            <Text style={styles.footerLabel}>Total to Pay</Text>
            <Text style={styles.footerAmount}>${amount}</Text>
          </View>
          <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
            <Text style={styles.placeOrderText}>Place Order</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#181611" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSpacer: {
    width: 44,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
  },
  progressActive: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  progressInactive: {
    fontSize: 14,
    color: '#999',
  },
  progressLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f4c025',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e3db',
    gap: 12,
  },
  addressIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f5f3f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: {
    flex: 1,
    gap: 2,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e3db',
    marginBottom: 8,
    gap: 12,
  },
  paymentCardSelected: {
    borderWidth: 2,
    borderColor: '#f4c025',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f5f3f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e6e3db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#f4c025',
    backgroundColor: '#f4c025',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e3db',
  },
  itemRow: {
    flexDirection: 'row',
    gap: 16,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#f5f3f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    paddingRight: 16,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#f5f3f0',
    marginVertical: 16,
  },
  costBreakdown: {
    gap: 8,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  costValueFree: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
  },
  dashedDivider: {
    height: 1,
    borderTopWidth: 1,
    borderTopColor: '#e6e3db',
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    opacity: 0.6,
  },
  securityText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8a8060',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e6e3db',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  totalSection: {
    alignItems: 'flex-start',
  },
  footerLabel: {
    fontSize: 12,
    color: '#8a8060',
    fontWeight: '500',
  },
  footerAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  costValueDiscount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
  },
  placeOrderButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#f4c025',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});