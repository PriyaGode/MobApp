import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../themeTokens";
import { API_BASE } from "../../services/apiBase";
import { API } from "../../config/apiConfig";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  unit?: string;
}

interface DeliveryAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

interface PaymentMethod {
  type: string;
  cardNumber?: string;
  bankName?: string;
}

interface Order {
  id: number;
  orderId: string;
  totalAmount: number;
  status: string;
  orderDate: string;
  deliveryAddress: DeliveryAddress | string;
  paymentMethod?: PaymentMethod;
  items: OrderItem[];
  itemTotal?: number;
  deliveryCharges?: number;
  taxes?: number;
}

export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params as { order: Order };

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState<Order>(order);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(API.GET_ORDER(order.orderId));
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status: string) => {
    const statusUpper = status.toUpperCase().trim();


    // Check for CONFIRMED
    if (statusUpper === "CONFIRMED" || statusUpper.includes("CONFIRM")) {
      return { progress: 33, steps: [true, false, false, false] };
    }

    // Check for IN TRANSIT
    if (statusUpper === "IN-TRANSIT" || statusUpper === "IN_TRANSIT" || statusUpper === "IN TRANSIT" || statusUpper.includes("TRANSIT")) {
      return { progress: 66, steps: [true, true, false, false] };
    }

    // Check for SHIPPED or OUT FOR DELIVERY
    if (statusUpper === "SHIPPED" || statusUpper.includes("SHIP") || statusUpper === "OUT_FOR_DELIVERY" || statusUpper === "OUT FOR DELIVERY" || statusUpper.includes("OUT FOR")) {

      return { progress: 100, steps: [true, true, true, false] };
    }

    // Check for DELIVERED
    if (statusUpper === "DELIVERED" || statusUpper.includes("DELIVER")) {
      return { progress: 100, steps: [true, true, true, true] };
    }

    // Check for CANCELLED
    if (statusUpper === "CANCELLED" || statusUpper.includes("CANCEL")) {
      return { progress: 0, steps: [false, false, false, false] };
    }


    return { progress: 33, steps: [true, false, false, false] };
  };

  const { progress, steps } = getStatusInfo(orderDetails.status);

  const handleCancelOrder = async () => {
    try {
      // API call to cancel order
      const response = await fetch(API.UPDATE_ORDER_STATUS(orderDetails.orderId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      });

      if (response.ok) {
        setOrderDetails(prev => ({ ...prev, status: 'CANCELLED' }));
        Alert.alert("Order Cancelled", "Your order has been cancelled successfully.");
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to cancel order. Please try again.");
    }
    setShowCancelModal(false);
  };

  const renderDeliveryAddress = () => {
    if (typeof orderDetails.deliveryAddress === 'string') {
      return (
        <Text style={styles.addressText}>
          {orderDetails.deliveryAddress}
        </Text>
      );
    }

    const addr = orderDetails.deliveryAddress as DeliveryAddress;
    return (
      <View>
        <Text style={styles.addressName}>{addr.name || 'Home'}</Text>
        <Text style={styles.addressText}>
          {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''},{"\n"}
          {addr.city}, {addr.state},{"\n"}
          {addr.pincode}
        </Text>
        <Text style={styles.phoneText}>{addr.phone}</Text>
      </View>
    );
  };

  const renderPaymentMethod = () => {
    const payment = orderDetails.paymentMethod;
    if (!payment) {
      return (
        <View style={styles.paymentRow}>
          <View style={styles.paymentIcon}>
            <MaterialIcons name="credit-card" size={20} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.paymentTitle}>Credit Card</Text>
            <Text style={styles.paymentSubtitle}>**** **** **** 4582</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.paymentRow}>
        <View style={styles.paymentIcon}>
          <MaterialIcons name="credit-card" size={20} color="#3B82F6" />
        </View>
        <View>
          <Text style={styles.paymentTitle}>
            {payment.bankName || 'Credit Card'}
          </Text>
          <Text style={styles.paymentSubtitle}>
            {payment.cardNumber || '**** **** **** 4582'}
          </Text>
        </View>
      </View>
    );
  };

  const calculateTotals = () => {
    const itemTotal = orderDetails.itemTotal || orderDetails.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryCharges = (orderDetails as any).deliveryFee || orderDetails.deliveryCharges || 0;
    const taxes = (orderDetails as any).tax || orderDetails.taxes || Math.round(itemTotal * 0.05); // 5% tax
    const discountAmount = (orderDetails as any).discountAmount || 0;
    const grandTotal = orderDetails.totalAmount; // Use total from database

    return { itemTotal, deliveryCharges, taxes, discountAmount, grandTotal };
  };

  const { itemTotal, deliveryCharges, taxes, discountAmount, grandTotal } = calculateTotals();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity 
          style={styles.helpButton}
          onPress={() => (navigation as any).navigate('HelpSupport', {
            orderId: orderDetails.orderId,
            orderItems: orderDetails.items.map(item => item.productName).join(', ')
          })}
        >
          <MaterialIcons name="support-agent" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Info & Progress Card */}
        <View style={styles.card}>
          <View style={styles.orderInfoRow}>
            <View>
              <Text style={styles.orderInfoLabel}>Order ID</Text>
              <Text style={styles.orderInfoValue}>#{orderDetails.orderId}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.orderInfoLabel}>Placed On</Text>
              <Text style={styles.orderInfoValue}>{formatDate(orderDetails.orderDate)}</Text>
            </View>
          </View>

          {/* Progress Tracker */}
          <View style={styles.progressContainer}>
            <View style={styles.progressSteps}>
              <View style={styles.progressStep}>
                <View style={[styles.progressCircle, steps[0] ? styles.progressCircleCompleted : styles.progressCircleInactive]}>
                  <MaterialIcons name="check" size={16} color="white" />
                </View>
                <Text style={[styles.progressLabel, steps[0] ? styles.progressLabelActive : styles.progressLabelInactive]}>Confirmed</Text>
              </View>

              <View style={styles.progressStep}>
                <View style={[styles.progressCircle, (steps[1] || orderDetails.status.toUpperCase() === 'IN-TRANSIT' || orderDetails.status.toUpperCase() === 'IN_TRANSIT' || orderDetails.status.toUpperCase() === 'IN TRANSIT') ? styles.progressCircleCompleted : styles.progressCircleInactive]}>
                  <MaterialIcons name="local-shipping" size={16} color={(steps[1] || orderDetails.status.toUpperCase() === 'IN-TRANSIT' || orderDetails.status.toUpperCase() === 'IN_TRANSIT' || orderDetails.status.toUpperCase() === 'IN TRANSIT') ? "white" : "#9CA3AF"} />
                </View>
                <Text style={[styles.progressLabel, (steps[1] || orderDetails.status.toUpperCase() === 'IN-TRANSIT' || orderDetails.status.toUpperCase() === 'IN_TRANSIT' || orderDetails.status.toUpperCase() === 'IN TRANSIT') ? styles.progressLabelActive : styles.progressLabelInactive]}>In Transit</Text>
              </View>

              <View style={styles.progressStep}>
                <View style={[styles.progressCircle, steps[2] ? styles.progressCircleCompleted : styles.progressCircleInactive]}>
                  <MaterialIcons name="local-shipping" size={16} color={steps[2] ? "white" : "#9CA3AF"} />
                </View>
                <Text style={[styles.progressLabel, steps[2] ? styles.progressLabelActive : styles.progressLabelInactive]}>Out for Delivery</Text>
              </View>

              <View style={styles.progressStep}>
                <View style={[styles.progressCircle, (steps[3] || orderDetails.status.toUpperCase() === 'DELIVERED') ? styles.progressCircleCompleted : styles.progressCircleInactive]}>
                  <MaterialIcons name="home" size={16} color={(steps[3] || orderDetails.status.toUpperCase() === 'DELIVERED') ? "white" : "#9CA3AF"} />
                </View>
                <Text style={[styles.progressLabel, (steps[3] || orderDetails.status.toUpperCase() === 'DELIVERED') ? styles.progressLabelActive : styles.progressLabelInactive]}>Delivered</Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>

            {/* Half-highlighted connecting lines */}
            <View style={styles.connectingLines}>
              {/* Line 1-2 */}
              <View style={[styles.connectingLine, { left: '8%', width: '25%' }]}>
                {steps[1] ? (
                  <View style={[styles.lineSegment, { backgroundColor: colors.primary }]} />
                ) : steps[0] ? (
                  <View style={styles.lineHalf}>
                    <View style={[styles.lineHalfLeft, { backgroundColor: colors.primary }]} />
                    <View style={[styles.lineHalfRight, { backgroundColor: '#E5E7EB' }]} />
                  </View>
                ) : (
                  <View style={[styles.lineSegment, { backgroundColor: '#E5E7EB' }]} />
                )}
              </View>
              {/* Line 2-3 */}
              <View style={[styles.connectingLine, { left: '41.5%', width: '25%' }]}>
                {steps[2] ? (
                  <View style={[styles.lineSegment, { backgroundColor: colors.primary }]} />
                ) : steps[1] ? (
                  <View style={styles.lineHalf}>
                    <View style={[styles.lineHalfLeft, { backgroundColor: colors.primary }]} />
                    <View style={[styles.lineHalfRight, { backgroundColor: '#E5E7EB' }]} />
                  </View>
                ) : (
                  <View style={[styles.lineSegment, { backgroundColor: '#E5E7EB' }]} />
                )}
              </View>

            </View>
          </View>

          {/* Cancelled Message */}
          {orderDetails.status.toUpperCase().includes('CANCEL') && (
            <View style={styles.cancelledMessage}>
              <MaterialIcons name="cancel" size={20} color="#DC2626" />
              <Text style={styles.cancelledMessageText}>
                This order has been cancelled. If you have any questions, please contact customer support.
              </Text>
            </View>
          )}

          {/* Delivered Message */}
          {orderDetails.status.toUpperCase().includes('DELIVER') && (
            <View style={styles.deliveredMessage}>
              <MaterialIcons name="check-circle" size={20} color="#10B981" />
              <Text style={styles.deliveredMessageText}>
                Your order has been delivered successfully! Thank you for shopping with us.
              </Text>
            </View>
          )}

          {/* Shipped Message */}
          {orderDetails.status.toUpperCase().includes('SHIP') && !orderDetails.status.toUpperCase().includes('DELIVER') && (
            <View style={styles.shippedMessage}>
              <MaterialIcons name="local-shipping" size={20} color="#10B981" />
              <Text style={styles.shippedMessageText}>
                Your order has been shipped! Use the Track Order button below to monitor your delivery.
              </Text>
            </View>
          )}

          {/* Delivery Message for non-shipped orders */}
          {!orderDetails.status.toUpperCase().includes('SHIP') && !orderDetails.status.toUpperCase().includes('DELIVER') && !orderDetails.status.toUpperCase().includes('CANCEL') && (
            <View style={styles.deliveryMessage}>
              <MaterialIcons name="local-shipping" size={20} color={colors.textSecondary} />
              <Text style={styles.deliveryMessageText}>
                A delivery person will be assigned and details will appear here once your order is ready for shipment.
              </Text>
            </View>
          )}
        </View>

        {/* Items Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items Ordered ({orderDetails.items.length})</Text>
          <View style={styles.itemsList}>
            {orderDetails.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Image
                  source={{ uri: `${API_BASE}/images/products/${item.productId}/product-${item.productId}-main.jpg` }}
                  style={styles.itemImage}
                  defaultSource={require('../../assets/ImageNotFound.jpg')}
                />
                <View style={styles.itemInfo}>
                  <View style={styles.itemHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.productName}</Text>
                      <Text style={styles.itemUnit}>{item.unit || '1 Dozen Box'}</Text>
                    </View>
                    <Text style={styles.itemPrice}>${item.totalPrice.toFixed(2)}</Text>
                  </View>
                  <View style={styles.itemFooter}>
                    <View style={styles.quantityBadge}>
                      <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Details</Text>
          <View style={styles.deliverySection}>
            <View style={styles.deliveryIcon}>
              <MaterialIcons name="location-on" size={20} color={colors.primary} />
            </View>
            {renderDeliveryAddress()}
          </View>

          <View style={styles.divider} />

          <Text style={styles.cardTitle}>Payment Method</Text>
          {renderPaymentMethod()}
        </View>

        {/* Payment Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          <View style={styles.summaryList}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Item Total</Text>
              <Text style={styles.summaryValue}>${itemTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Charges</Text>
              <Text style={[styles.summaryValue, deliveryCharges === 0 && styles.freeText]}>
                {deliveryCharges === 0 ? 'Free' : `$${deliveryCharges.toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxes & Charges</Text>
              <Text style={styles.summaryValue}>${taxes.toFixed(2)}</Text>
            </View>
            {discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount Applied</Text>
                <Text style={[styles.summaryValue, styles.discountText]}>-${discountAmount.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Show Track Order button only for shipped orders, not delivered */}
          {orderDetails.status.toUpperCase().includes('SHIP') && !orderDetails.status.toUpperCase().includes('DELIVER') && (
            <TouchableOpacity
              style={styles.trackButton}
              onPress={() => (navigation as any).navigate('OrderTracking', { order: orderDetails })}
            >
              <MaterialIcons name="local-shipping" size={20} color="#FFFFFF" />
              <Text style={styles.trackButtonText}>Track Order</Text>
            </TouchableOpacity>
          )}

          {/* Show Invoice and Help buttons for all orders except cancelled */}
          {!orderDetails.status.toUpperCase().includes('CANCEL') && (
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => (navigation as any).navigate('Invoice', {
                  invoiceData: {
                    invoiceNumber: orderDetails.orderId,
                    date: new Date(orderDetails.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    totalAmount: grandTotal,
                    customerName: typeof orderDetails.deliveryAddress === 'string' ? 'Customer' : orderDetails.deliveryAddress.name || 'Customer',
                    customerAddress: typeof orderDetails.deliveryAddress === 'string' ? orderDetails.deliveryAddress : `${orderDetails.deliveryAddress.city}, ${orderDetails.deliveryAddress.state}`,
                    items: orderDetails.items.map(item => ({
                      name: item.productName,
                      quantity: `${item.quantity} ${item.unit || 'Dozen'}`,
                      amount: item.totalPrice
                    })),
                    subtotal: itemTotal,
                    deliveryCharges: deliveryCharges,
                    tax: taxes,
                    discount: 50,
                    transactionId: `TXN_${Math.floor(Math.random() * 100000000)}`,
                    orderReference: `#OD${orderDetails.id}`,
                    paymentMethod: orderDetails.paymentMethod?.bankName || 'HDFC Credit Card'
                  }
                })}
              >
                <MaterialIcons name="receipt-long" size={18} color={colors.textPrimary} />
                <Text style={styles.secondaryButtonText}>Invoice</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => (navigation as any).navigate('HelpSupport', {
                  orderId: orderDetails.orderId,
                  orderItems: orderDetails.items.map(item => item.productName).join(', ')
                })}
              >
                <MaterialIcons name="help-outline" size={18} color={colors.textPrimary} />
                <Text style={styles.secondaryButtonText}>Need Help?</Text>
              </TouchableOpacity>
            </View>
          )}

          {orderDetails.status.toUpperCase() !== 'DELIVERED' && orderDetails.status.toUpperCase() !== 'CANCELLED' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCancelModal(true)}
            >
              <MaterialIcons name="cancel" size={18} color="#DC2626" />
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <MaterialIcons name="warning" size={32} color="#DC2626" />
            </View>
            <Text style={styles.modalTitle}>Cancel Order?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to cancel order #{orderDetails.orderId}? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalSecondaryButtonText}>No, Keep it</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={handleCancelOrder}
              >
                <Text style={styles.modalPrimaryButtonText}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  helpButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  orderInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  orderInfoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  progressContainer: {
    position: "relative",
    paddingHorizontal: 8,
  },
  progressTrack: {
    position: "absolute",
    top: 16,
    left: 24,
    right: 24,
    height: 2,
    backgroundColor: "#E5E7EB",
    zIndex: 1,
  },
  progressBar: {
    height: 2,
    backgroundColor: colors.primary,
  },
  progressSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },
  progressStep: {
    alignItems: "center",
    gap: 8,
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  progressCircleCompleted: {
    backgroundColor: colors.primary,
  },
  progressCircleActive: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  progressCircleInactive: {
    backgroundColor: "#E5E7EB",
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 60,
  },
  progressLabelActive: {
    color: colors.primary,
  },
  progressLabelCurrent: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  progressLabelInactive: {
    color: colors.textSecondary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  itemsList: {
    gap: 16,
  },
  itemRow: {
    flexDirection: "row",
    gap: 16,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  itemUnit: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  itemFooter: {
    marginTop: 8,
  },
  quantityBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  quantityText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  deliverySection: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  deliveryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  addressName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  phoneText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  paymentSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryList: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  freeText: {
    color: "#10B981",
  },
  discountText: {
    color: "#10B981",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  actionButtons: {
    gap: 12,
    paddingBottom: 24,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  trackButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 16,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.background,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalSecondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  modalSecondaryButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  modalPrimaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    alignItems: "center",
    shadowColor: "#DC2626",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modalPrimaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  connectingLines: {
    position: "absolute",
    top: 16,
    left: 0,
    right: 0,
    height: 2,
    zIndex: 0,
  },
  connectingLine: {
    position: "absolute",
    height: 2,
  },
  lineSegment: {
    flex: 1,
    height: 2,
  },
  lineHalf: {
    flex: 1,
    flexDirection: "row",
    height: 2,
  },
  lineHalfLeft: {
    flex: 1,
    height: 2,
  },
  lineHalfRight: {
    flex: 1,
    height: 2,
  },
  deliveryMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deliveryMessageText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cancelledMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  cancelledMessageText: {
    flex: 1,
    fontSize: 14,
    color: "#DC2626",
    lineHeight: 20,
    fontWeight: "500",
  },
  shippedMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: "#F0FDF4",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  shippedMessageText: {
    flex: 1,
    fontSize: 14,
    color: "#10B981",
    lineHeight: 20,
    fontWeight: "500",
  },
  deliveredMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: "#F0FDF4",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  deliveredMessageText: {
    flex: 1,
    fontSize: 14,
    color: "#10B981",
    lineHeight: 20,
    fontWeight: "500",
  },
});