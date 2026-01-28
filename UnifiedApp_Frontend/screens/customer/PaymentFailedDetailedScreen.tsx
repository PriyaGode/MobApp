import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentFailedDetailed'>;

export default function PaymentFailedDetailedScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const amount = route.params?.amount || 0;
  const reason = route.params?.reason || 'Payment could not be processed';
  const errorCode = route.params?.errorCode || 'ERR_UNKNOWN';

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

  const getErrorDetails = (code: string) => {
    const errorMap: Record<string, { title: string; description: string; solution: string }> = {
      ERR_INSUFFICIENT_FUNDS: {
        title: 'Insufficient Funds',
        description: 'Your account does not have enough balance to complete this transaction.',
        solution: 'Please ensure sufficient funds are available or try another payment method.',
      },
      ERR_CARD_DECLINED: {
        title: 'Card Declined',
        description: 'Your bank has declined the transaction. This could be due to security reasons or daily limits.',
        solution: 'Contact your bank to enable online transactions or increase your daily limit.',
      },
      ERR_INVALID_CARD: {
        title: 'Invalid Card Details',
        description: 'The card information entered is incorrect or the card has expired.',
        solution: 'Please check your card number, expiry date, and CVV, then try again.',
      },
      ERR_NETWORK_TIMEOUT: {
        title: 'Network Timeout',
        description: 'The transaction timed out due to poor network connectivity.',
        solution: 'Please check your internet connection and try again.',
      },
      ERR_BANK_SERVER: {
        title: 'Bank Server Issue',
        description: 'Your bank\'s server is currently unavailable or experiencing high traffic.',
        solution: 'Please wait a few minutes and try again, or use another payment method.',
      },
      ERR_CARD_BLOCKED: {
        title: 'Card Blocked',
        description: 'Your card has been temporarily blocked by your bank for security reasons.',
        solution: 'Contact your bank immediately to unblock your card.',
      },
      ERR_TRANSACTION_LIMIT: {
        title: 'Transaction Limit Exceeded',
        description: 'This transaction exceeds your card\'s transaction limit.',
        solution: 'Contact your bank to increase your transaction limit or split the payment.',
      },
      ERR_3DS_FAILED: {
        title: '3D Secure Authentication Failed',
        description: 'The 3D Secure authentication was not completed successfully.',
        solution: 'Please ensure you complete the authentication on your bank\'s page.',
      },
    };

    return errorMap[code] || {
      title: 'Payment Failed',
      description: reason,
      solution: 'Please try again or contact support for assistance.',
    };
  };

  const errorDetails = getErrorDetails(errorCode);
  const transactionRef = `TXN${Date.now().toString().slice(-10)}`;

  const handleRetryDifferent = () => {
    navigation.navigate('PaymentMethod', { amount });
  };

  const handleContactSupport = () => {
    // In real app, would open support chat/email with error details
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
            <Feather name="alert-triangle" size={48} color="#fff" />
          </View>
        </Animated.View>

        {/* Error Message */}
        <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>{errorDetails.title}</Text>
          <Text style={styles.subtitle}>{errorDetails.description}</Text>
        </Animated.View>

        {/* Transaction Details Card */}
        <Animated.View style={[styles.detailsCard, { opacity: fadeAnim }]}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>{transactionRef}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Error Code</Text>
            <Text style={styles.detailValueError}>{errorCode}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>${amount.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Timestamp</Text>
            <Text style={styles.detailValue}>
              {new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Failed</Text>
            </View>
          </View>
        </Animated.View>

        {/* Solution Card */}
        <Animated.View style={[styles.solutionCard, { opacity: fadeAnim }]}>
          <View style={styles.solutionHeader}>
            <Feather name="info" size={24} color="#2196F3" />
            <Text style={styles.solutionTitle}>How to Fix This</Text>
          </View>
          <Text style={styles.solutionText}>{errorDetails.solution}</Text>
        </Animated.View>

        {/* Troubleshooting Steps */}
        <Animated.View style={[styles.stepsCard, { opacity: fadeAnim }]}>
          <Text style={styles.stepsTitle}>Troubleshooting Steps</Text>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Verify your card details are correct</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Check your account balance</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Ensure online transactions are enabled</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>Try a different payment method</Text>
          </View>
        </Animated.View>

        {/* Support Card */}
        <Animated.View style={[styles.supportCard, { opacity: fadeAnim }]}>
          <Feather name="headphones" size={32} color="#FF9800" />
          <Text style={styles.supportTitle}>Still Having Issues?</Text>
          <Text style={styles.supportText}>
            Our support team can help you resolve this issue. Share the transaction ID and error code above.
          </Text>
          <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
            <Feather name="message-circle" size={18} color="#FF9800" />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetryDifferent}>
          <Feather name="credit-card" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Try Different Method</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('Main', { screen: 'Home' })}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
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
    paddingHorizontal: 20,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  detailValueError: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F44336',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  statusBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F44336',
  },
  solutionCard: {
    width: '100%',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  solutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  solutionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
  },
  solutionText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  stepsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  stepText: {
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
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  supportButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF9800',
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
  homeButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
  },
});
