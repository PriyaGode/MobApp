import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentFailed'>;

export default function PaymentFailedScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const amount = route.params?.amount || 0;
  const reason = route.params?.reason || 'Payment could not be processed';

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRetry = () => {
    navigation.navigate('PaymentMethod', { amount });
  };

  const handleBackToCart = () => {
    navigation.navigate('Main', { screen: 'Cart' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Error Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.errorCircle}>
            <Feather name="x" size={48} color="#fff" />
          </View>
        </Animated.View>

        {/* Error Message */}
        <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Payment Failed</Text>
          <Text style={styles.subtitle}>{reason}</Text>
        </Animated.View>

        {/* Amount Card */}
        <Animated.View style={[styles.amountCard, { opacity: fadeAnim }]}>
          <Text style={styles.amountLabel}>Transaction Amount</Text>
          <Text style={styles.amountValue}>${amount.toFixed(2)}</Text>
          <Text style={styles.amountStatus}>Not Charged</Text>
        </Animated.View>

        {/* Reasons */}
        <Animated.View style={[styles.reasonsCard, { opacity: fadeAnim }]}>
          <Text style={styles.reasonsTitle}>Common Reasons for Payment Failure</Text>
          <View style={styles.reasonItem}>
            <Feather name="alert-circle" size={16} color="#666" />
            <Text style={styles.reasonText}>Insufficient funds in account</Text>
          </View>
          <View style={styles.reasonItem}>
            <Feather name="alert-circle" size={16} color="#666" />
            <Text style={styles.reasonText}>Incorrect card details</Text>
          </View>
          <View style={styles.reasonItem}>
            <Feather name="alert-circle" size={16} color="#666" />
            <Text style={styles.reasonText}>Bank server issues</Text>
          </View>
          <View style={styles.reasonItem}>
            <Feather name="alert-circle" size={16} color="#666" />
            <Text style={styles.reasonText}>Card expired or blocked</Text>
          </View>
          <View style={styles.reasonItem}>
            <Feather name="alert-circle" size={16} color="#666" />
            <Text style={styles.reasonText}>Network connection issues</Text>
          </View>
        </Animated.View>

        {/* Support Section */}
        <Animated.View style={[styles.supportCard, { opacity: fadeAnim }]}>
          <Feather name="headphones" size={32} color="#FF9800" />
          <Text style={styles.supportTitle}>Need Help?</Text>
          <Text style={styles.supportText}>
            Our customer support team is available 24/7 to assist you with any payment issues.
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Feather name="phone" size={16} color="#666" />
              <Text style={styles.contactText}>1800-123-4567</Text>
            </View>
            <View style={styles.contactItem}>
              <Feather name="mail" size={16} color="#666" />
              <Text style={styles.contactText}>support@aamraj.com</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Feather name="refresh-cw" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Retry Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartButton} onPress={handleBackToCart}>
          <Text style={styles.cartButtonText}>Back to Cart</Text>
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
  },
  contentContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  errorCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F44336',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  amountCard: {
    width: '100%',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F44336',
    marginBottom: 4,
  },
  amountStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  reasonsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  reasonsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 16,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  supportCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginTop: 12,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#FF9800',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cartButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
  },
});
