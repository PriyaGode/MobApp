import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function DeliveryTrackingScreen({ navigation, route }: any) {
  const { orderId = '#12345' } = route?.params || {};
  const [showDelayAlert, setShowDelayAlert] = useState(false);

  return (
    <View style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        {/* Simplified map representation */}
        <View style={styles.mapGrid}>
          {/* Grid lines */}
          {[...Array(10)].map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLine, { top: (i * height) / 10 }]} />
          ))}
          {[...Array(10)].map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLineV, { left: (i * width) / 10 }]} />
          ))}
        </View>
        
        {/* Delivery marker */}
        <View style={styles.deliveryMarker}>
          <View style={styles.markerOuter}>
            <View style={styles.markerInner} />
          </View>
        </View>

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        {/* Title Badge */}
        <View style={styles.titleBadge}>
          <Text style={styles.titleText}>Track Your Delivery</Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        
        <Text style={styles.statusMessage}>Your mangoes are on the way!</Text>
        <Text style={styles.arrivalText}>Arriving in 15 mins</Text>
        <Text style={styles.distanceText}>2.5 km away</Text>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>

        <Text style={styles.orderIdText}>Order #{orderId}</Text>

        {/* Driver Info */}
        <View style={styles.driverContainer}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarText}>👨</Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>Your driver, Alex</Text>
            <Text style={styles.driverPhone}>+1 *** *** 1234</Text>
          </View>
          
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="message-square" size={24} color="#4CAF50" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButtonCall}>
            <Feather name="phone" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Delay Alert Modal */}
      {showDelayAlert && (
        <View style={styles.modalOverlay}>
          <View style={styles.delayAlert}>
            <View style={styles.alertHeader}>
              <Feather name="alert-triangle" size={24} color="#FFA500" />
              <Text style={styles.alertTitle}>Delay Alert</Text>
              <TouchableOpacity onPress={() => setShowDelayAlert(false)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.alertIcon}>
              <Text style={styles.alertIconText}>🌧️</Text>
            </View>

            <Text style={styles.alertMainTitle}>Your Mango Order is Delayed</Text>
            <Text style={styles.alertMessage}>
              Due to unexpected heavy rains, our delivery fleet is facing a slight delay.
            </Text>

            <View style={styles.delayDetails}>
              <View style={styles.delayRow}>
                <Text style={styles.delayLabel}>Reason for Delay:</Text>
                <Text style={styles.delayValue}>Heavy Rain</Text>
              </View>
              <View style={styles.delayRow}>
                <Text style={styles.delayLabel}>Original Delivery:</Text>
                <Text style={styles.delayValue}>June 15, 2024</Text>
              </View>
              <View style={[styles.delayRow, styles.highlightRow]}>
                <Text style={styles.delayLabel}>New Estimated Delivery:</Text>
                <Text style={styles.delayValueHighlight}>June 17, 2024</Text>
              </View>
            </View>

            <Text style={styles.reassurance}>
              We're working hard to get your fresh mangoes to you as soon as possible!
            </Text>

            <TouchableOpacity style={styles.acknowledgeButton} onPress={() => setShowDelayAlert(false)}>
              <Text style={styles.acknowledgeButtonText}>Acknowledge</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelOrderButton}>
              <Text style={styles.cancelOrderButtonText}>Cancel Order</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactSupportButton}>
              <Text style={styles.contactSupportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Floating button to show delay alert (for demo) */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => setShowDelayAlert(true)}
      >
        <Feather name="alert-circle" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapGrid: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E0E0D0',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#E0E0D0',
  },
  deliveryMarker: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
  },
  markerOuter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  markerInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleBadge: {
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bottomSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  statusMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  arrivalText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    width: '70%',
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  orderIdText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    fontSize: 28,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  driverPhone: {
    fontSize: 14,
    color: '#999',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonCall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  delayAlert: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '90%',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    fontSize: 16,
    color: '#666',
  },
  alertIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  alertIconText: {
    fontSize: 40,
  },
  alertMainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  delayDetails: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  delayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  highlightRow: {
    backgroundColor: '#FFF9E6',
    marginHorizontal: -16,
    marginBottom: -16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  delayLabel: {
    fontSize: 14,
    color: '#999',
  },
  delayValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  delayValueHighlight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  reassurance: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  acknowledgeButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  acknowledgeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cancelOrderButton: {
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  cancelOrderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4444',
  },
  contactSupportButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  contactSupportButtonText: {
    fontSize: 16,
    color: '#666',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 240,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
