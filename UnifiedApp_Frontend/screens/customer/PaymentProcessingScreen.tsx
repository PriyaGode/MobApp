import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import type { RootStackParamList } from '../../App';
import { getToken } from '../../components/auth/tokenStore';
import { API } from '../../config/apiConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentProcessing'>;

export default function PaymentProcessingScreen({ navigation, route }: Props) {
  const amount = route.params?.amount || 0;
  const method = route.params?.method || 'card';
  const orderId = route.params?.orderId;
  const orderItems = route.params?.orderItems;
  const summary = route.params?.summary;
  const deliveryAddress = route.params?.deliveryAddress;
  const [progress, setProgress] = useState(0);
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const progressValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress bar animation
    Animated.timing(progressValue, {
      toValue: 100,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // Simulate payment processing
    const processPayment = async () => {
      try {
        const token = await getToken();
        
        // Map frontend payment method to backend enum
        let paymentMethodEnum = 'CREDIT_CARD';
        if (method === 'apple') paymentMethodEnum = 'WALLET';
        if (method === 'google') paymentMethodEnum = 'UPI';
        
        const paymentRequest = {
          orderId: orderId || `ORD${Date.now().toString().slice(-8)}`,
          paymentMethod: paymentMethodEnum,
          amount: amount,
          // Mock card details (in real app, these would come from CardDetails screen)
          cardNumber: '4111111111111111',
          cardHolderName: 'Test User',
          expiryDate: '12/25',
          cvv: '123',
        };

        const response = await fetch(API.PROCESS_PAYMENT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentRequest),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Payment processing failed');
        }

        // Update order status to confirmed after successful payment
        try {
          await fetch(API.UPDATE_ORDER_STATUS(data.orderId || orderId), {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'confirmed' }),
          });
        } catch (statusError) {
          console.log('Failed to update order status:', statusError);
          // Don't fail the payment flow if status update fails
        }

        // Payment successful
        navigation.replace('PaymentSuccess', { 
          orderId: data.orderId,
          amount,
          paymentMethod: method,
          orderItems,
          summary,
          deliveryAddress,
        });
      } catch (error: any) {
        navigation.replace('PaymentFailed', { 
          amount, 
          reason: error.message || 'Transaction declined' 
        });
      }
    };

    const timer = setTimeout(() => {
      processPayment();
    }, 3500);

    return () => clearTimeout(timer);
  }, [amount, method, orderId]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ rotate: spin }, { scale: scaleValue }],
            },
          ]}
        >
          <Feather name="credit-card" size={48} color="#FF9800" />
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>Processing Payment</Text>
        <Text style={styles.subtitle}>Please wait while we process your payment</Text>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[styles.progressBar, { width: progressWidth }]}
          />
        </View>

        {/* Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Transaction Amount</Text>
          <Text style={styles.amountValue}>${amount.toFixed(2)}</Text>
        </View>

        {/* Processing Steps */}
        <View style={styles.stepsContainer}>
          <View style={styles.stepRow}>
            <Feather name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.stepText}>Verifying payment details</Text>
          </View>
          <View style={styles.stepRow}>
            <Feather name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.stepText}>Connecting to payment gateway</Text>
          </View>
          <View style={styles.stepRow}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Feather name="loader" size={20} color="#FF9800" />
            </Animated.View>
            <Text style={styles.stepText}>Processing transaction...</Text>
          </View>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Feather name="shield" size={16} color="#666" />
          <Text style={styles.securityText}>
            Your transaction is secure and encrypted
          </Text>
        </View>
      </View>

      {/* Footer Note */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Please do not close this screen or press back button
        </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 4,
    borderColor: '#FFE5B4',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 32,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 3,
  },
  amountContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E5E5',
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
  stepsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepText: {
    fontSize: 15,
    color: '#2C2C2C',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  securityText: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF9E6',
    borderTopWidth: 1,
    borderTopColor: '#FFE5B4',
  },
  footerText: {
    fontSize: 14,
    color: '#FF9800',
    textAlign: 'center',
    fontWeight: '500',
  },
});
