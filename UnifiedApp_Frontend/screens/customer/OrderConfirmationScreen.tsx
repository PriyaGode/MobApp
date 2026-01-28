import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ImageBackground,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../App';
import { getToken } from '../../components/auth/tokenStore';
import { API } from '../../config/apiConfig';
import { colors } from '../themeTokens';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderConfirmation'>;

export default function OrderConfirmationScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const orderId = route.params?.orderId || 'ORD12345678';
  const amount = route.params?.amount || 0;
  const paymentMethod = route.params?.paymentMethod || 'card';
  const orderItems = route.params?.orderItems?.map(i => ({ name: i.name, quantity: i.quantity, price: i.lineTotal })) || [
    { name: 'Alphonso Mango', quantity: 2, price: 24.99 },
    { name: 'Mango Pickle', quantity: 1, price: 8.00 },
  ];
  const summary = route.params?.summary;
  const [deliveryAddress, setDeliveryAddress] = useState<string | undefined>(route.params?.deliveryAddress);
  const [loading, setLoading] = useState(false);

  // Fetch order details if delivery address is not provided
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (deliveryAddress || !orderId) return;

      try {
        setLoading(true);
        const token = await getToken();
        const response = await fetch(API.GET_ORDER(orderId), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.deliveryAddress) {
            setDeliveryAddress(data.deliveryAddress);
          }
        }
      } catch (error) {
        // Silently fail - delivery address might not be available
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, deliveryAddress]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Confirmation</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Success Icon and Message */}
        <View style={styles.successSection}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="check-circle" size={64} color="#f4ca25" />
          </View>
          <View style={styles.messageContainer}>
            <Text style={styles.successTitle}>Order Confirmed</Text>
            <Text style={styles.successMessage}>
              Your order #{orderId} has been successfully placed. You will receive a confirmation email shortly.
            </Text>
          </View>
        </View>

        {/* Order Card */}
        <View style={styles.orderCard}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1553279768-865429fa0078?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }}
            style={styles.cardBackground}
            imageStyle={styles.cardImage}
          >
            <View style={styles.cardOverlay} />
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="inventory-2" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.cardLabel}>CONFIRMED ORDER</Text>
              </View>
              <Text style={styles.cardOrderId}>Order #{orderId}</Text>
              <Text style={styles.cardItems}>
                {orderItems.map(item => `${item.quantity} ${item.name}`).join(', ')}
              </Text>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.spacer} />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          >
            <Text style={styles.primaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Main', { screen: 'Orders' })}
          >
            <Text style={styles.secondaryButtonText}>View Order History</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 8,
  },
  headerSpacer: {
    width: 48,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  successSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    width: '100%',
  },
  iconContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(244, 202, 37, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  messageContainer: {
    alignItems: 'center',
    maxWidth: 480,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  orderCard: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cardBackground: {
    borderRadius: 12,
    overflow: 'hidden',
    paddingTop: 132,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardImage: {
    borderRadius: 12,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
  },
  cardContent: {
    padding: 20,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
  },
  cardOrderId: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardItems: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  actionButtons: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 32,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#f4ca25',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#181711',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
