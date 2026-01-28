import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { API } from '../../config/apiConfig';

interface OrderStatus {
  id: string;
  title: string;
  time: string;
  completed: boolean;
  active: boolean;
  icon: string;
}

const OrderTrackingScreen = ({ navigation, route }: any) => {
  const { order } = route.params;
  const [orderDetails, setOrderDetails] = useState(order);
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

  const getStepFromStatus = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper.includes('CONFIRM')) return 1;
    if (statusUpper.includes('TRANSIT')) return 2;
    if (statusUpper.includes('DELIVERY') || statusUpper.includes('SHIP')) return 3;
    if (statusUpper.includes('DELIVER')) return 4;
    return 1;
  };

  const getProgressFromStatus = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper.includes('CONFIRM')) return 25;
    if (statusUpper.includes('TRANSIT')) return 50;
    if (statusUpper.includes('DELIVERY') || statusUpper.includes('SHIP')) return 75;
    if (statusUpper.includes('DELIVER')) return 100;
    return 25;
  };

  const getStatusMessage = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper.includes('DELIVERY')) return 'Your order is on the way!';
    if (statusUpper.includes('TRANSIT')) return 'Your order is in transit!';
    if (statusUpper.includes('DELIVER')) return 'Your order has been delivered!';
    return 'Order confirmed! We\'re processing your order.';
  };

  const orderData = {
    orderId: orderDetails.orderId,
    product: orderDetails.items?.[0]?.productName || 'Order Items',
    eta: '15-20 mins',
    currentStatus: orderDetails.status,
    currentStep: getStepFromStatus(orderDetails.status),
    totalSteps: 4,
    progress: getProgressFromStatus(orderDetails.status),
    driver: {
      name: 'Ravi Kumar',
      phone: '+91 98765 43210'
    },
    statusMessage: getStatusMessage(orderDetails.status)
  };

  const getOrderSteps = (status: string): OrderStatus[] => {
    const statusUpper = status.toUpperCase();
    const currentStep = getStepFromStatus(status);
    
    return [
      { 
        id: '1', 
        title: 'Order Confirmed', 
        time: statusUpper.includes('CONFIRM') || currentStep >= 1 ? 'Confirmed' : 'Pending', 
        completed: currentStep >= 1, 
        active: currentStep === 1, 
        icon: 'check' 
      },
      { 
        id: '2', 
        title: 'In Transit', 
        time: statusUpper.includes('TRANSIT') || currentStep >= 2 ? 'In Transit' : 'Pending', 
        completed: currentStep >= 2, 
        active: currentStep === 2, 
        icon: 'local-shipping' 
      },
      { 
        id: '3', 
        title: 'Out for Delivery', 
        time: statusUpper.includes('DELIVERY') || statusUpper.includes('SHIP') || currentStep >= 3 ? 'Out for Delivery' : 'Pending', 
        completed: currentStep >= 3, 
        active: currentStep === 3, 
        icon: 'local-shipping' 
      },
      { 
        id: '4', 
        title: 'Delivered', 
        time: statusUpper.includes('DELIVER') || currentStep >= 4 ? 'Delivered' : 'Pending', 
        completed: currentStep >= 4, 
        active: currentStep === 4, 
        icon: 'home' 
      },
    ];
  };

  const orderSteps = getOrderSteps(orderDetails.status);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f5" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={20} color="#181611" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f2b90d" />
            <Text style={styles.loadingText}>Loading order details...</Text>
          </View>
        )}
        {/* Map Section */}
        <View style={styles.mapSection}>
          <View style={styles.mapContainer}>
            <View style={styles.mapBackground} />
            <View style={styles.mapMarker}>
              <Animated.View style={styles.markerPing} />
              <View style={styles.markerDot} />
            </View>
            
            {/* ETA Card */}
            <View style={styles.etaCard}>
              <View>
                <Text style={styles.etaLabel}>ESTIMATED ARRIVAL</Text>
                <Text style={styles.etaTime}>{orderData.eta}</Text>
              </View>
              <View style={styles.deliveryIcon}>
                <MaterialIcons name="local-shipping" size={20} color="#221e10" />
              </View>
            </View>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>{orderData.statusMessage}</Text>
          <Text style={styles.orderInfo}>Order #{orderData.orderId} • {orderData.product}</Text>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>{orderData.currentStatus}</Text>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>Step {orderData.currentStep}/{orderData.totalSteps}</Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${orderData.progress}%` }]} />
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          {orderSteps.map((step, index) => (
            <View key={step.id} style={styles.timelineRow}>
              <View style={styles.timelineIconColumn}>
                <View style={[
                  styles.timelineIcon,
                  step.completed && styles.completedIcon,
                  step.active && styles.activeIcon,
                  !step.completed && !step.active && styles.pendingIcon
                ]}>
                  {step.active && <Animated.View style={styles.activePing} />}
                  <MaterialIcons 
                    name={step.icon as any} 
                    size={16} 
                    color={step.completed ? "#221e10" : step.active ? "#f2b90d" : "#9ca3af"} 
                  />
                </View>
                {index < orderSteps.length - 1 && (
                  <View style={[
                    styles.timelineLine,
                    step.completed && styles.completedLine,
                    !step.completed && styles.inactiveLine
                  ]} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[
                  styles.timelineTitle,
                  !step.completed && !step.active && styles.pendingText
                ]}>
                  {step.title}
                </Text>
                <Text style={[
                  styles.timelineTime,
                  !step.completed && !step.active && styles.pendingTimeText
                ]}>
                  {step.time}
                </Text>
              </View>
            </View>
          ))}
        </View>



        {/* Driver Card */}
        <View style={styles.driverSection}>
          <View style={styles.driverCard}>
            <View style={styles.driverInfo}>
              <View style={styles.driverAvatar} />
              <View>
                <Text style={styles.driverLabel}>Delivery Partner</Text>
                <Text style={styles.driverName}>{orderData.driver.name}</Text>
              </View>
            </View>
            <View style={styles.driverActions}>
              <TouchableOpacity style={styles.chatButton}>
                <MaterialIcons name="chat" size={18} color="#181611" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.callButton}>
                <MaterialIcons name="call" size={18} color="#221e10" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="home" size={20} color="#9ca3af" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="local-mall" size={20} color="#f2b90d" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="favorite" size={20} color="#9ca3af" />
          <Text style={styles.navLabel}>Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="person" size={20} color="#9ca3af" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f5',
    maxWidth: 448,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f5',
    paddingHorizontal: 16,
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181611',
    textAlign: 'center',
    flex: 1,
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  mapSection: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  mapContainer: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  mapBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#d1d5db',
  },
  mapMarker: {
    position: 'absolute',
    top: '33%',
    left: '33%',
    transform: [{ translateX: -8 }, { translateY: -8 }],
  },
  markerPing: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#f2b90d',
    borderRadius: 8,
    opacity: 0.75,
  },
  markerDot: {
    width: 16,
    height: 16,
    backgroundColor: '#f2b90d',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 10,
  },
  etaCard: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  etaLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8a8060',
    letterSpacing: 1,
  },
  etaTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181611',
  },
  deliveryIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#f2b90d',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 2,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#181611',
    textAlign: 'center',
    lineHeight: 22,
  },
  orderInfo: {
    fontSize: 12,
    color: '#8a8060',
    marginTop: 2,
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f2b90d',
  },
  stepBadge: {
    backgroundColor: 'rgba(242, 185, 13, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f2b90d',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    width: '75%',
    backgroundColor: '#f2b90d',
    borderRadius: 4,
  },
  timeline: {
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timelineIconColumn: {
    alignItems: 'center',
    marginRight: 10,
    width: 24,
  },
  timelineIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },
  completedIcon: {
    backgroundColor: '#f2b90d',
  },
  activeIcon: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#f2b90d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pendingIcon: {
    backgroundColor: '#e5e7eb',
  },
  activePing: {
    position: 'absolute',
    inset: 0,
    borderRadius: 16,
    backgroundColor: 'rgba(242, 185, 13, 0.2)',
  },
  timelineLine: {
    width: 2,
    height: 12,
    marginTop: 2,
  },
  completedLine: {
    backgroundColor: '#f2b90d',
  },
  inactiveLine: {
    backgroundColor: '#e5e7eb',
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#181611',
    lineHeight: 16,
  },
  timelineTime: {
    fontSize: 10,
    color: '#8a8060',
    marginTop: 1,
  },
  pendingText: {
    color: '#9ca3af',
    fontWeight: '500',
  },
  pendingTimeText: {
    color: '#d1d5db',
  },
  driverSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  driverCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  driverLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8a8060',
  },
  driverName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#181611',
  },
  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chatButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f8f5',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f2b90d',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomNav: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
    paddingBottom: 16,
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
  },
  navLabel: {
    fontSize: 8,
    fontWeight: '500',
    color: '#9ca3af',
  },
  activeNavLabel: {
    color: '#f2b90d',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#8a8060',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#181611',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#f2b90d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#221e10',
    fontWeight: 'bold',
  },

});

export default OrderTrackingScreen;