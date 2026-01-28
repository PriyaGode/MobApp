import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { RootStackParamList } from '../App';
import OrderProgressStepperIndicator from '../../components/superadmin/OrderProgressStepperIndicator';
import { listDeliveryPartners, type DeliveryPartner } from '../../services/deliveryPartners';
import { getOrderDetails, OrderDetails, updateOrderDeliveryPartner, updateOrderStatus } from '../../services/orderService';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;

export default function OrderDetailsScreen({ route }: Props) {
  const { order } = route.params;
  const [details, setDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [saving, setSaving] = useState(false);
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const d = await getOrderDetails(order.id);
        if (mounted) setDetails(d);
      } catch (e: any) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [order.id]);

  const d = details ?? (order as any);
  const detailRows = [
    { icon: 'user', label: 'Customer', value: d.customerName || '—' },
    { icon: 'package', label: 'Products', value: (d.productNames && d.productNames.length > 0) ? d.productNames.join(', ') : '—' },
    { icon: 'map-pin', label: 'Hub', value: d.hubName || '—' },
    { icon: 'truck', label: 'Delivery Partner', value: d.deliveryPartnerName || '—' },
    { icon: 'activity', label: 'Status', value: d.status },
    { icon: 'clock', label: 'Created', value: new Date(d.createdAt).toLocaleString() },
    { icon: 'alert-triangle', label: 'Issue', value: d.issueFlag ? 'Yes' : 'No' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}> 
          <Feather name="file-text" size={28} color="#2563EB" />
          <Text style={styles.title}>Order #{order.id}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{(details ?? order).status}</Text>
        </View>
      </View>
      <View style={styles.stepperWrap}>
        <OrderProgressStepperIndicator status={(details ?? order).status} issueFlag={(details ?? order).issueFlag} />
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <View style={styles.card}>
            {detailRows.map((row, idx) => (
              <View key={row.label} style={[styles.detailRow, idx !== detailRows.length - 1 && styles.detailDivider]}> 
                <Feather name={row.icon as any} size={18} color="#2563EB" style={styles.detailIcon} />
                <View style={styles.detailTextWrap}>
                  <Text style={styles.detailLabel}>{row.label}</Text>
                  <Text style={styles.detailValue}>{row.value}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.subCardsContainer}>
            <View style={styles.subCard}>
              <View style={styles.subCardHeader}> 
                <Feather name="info" size={16} color="#111" />
                <Text style={styles.subCardTitle}>Additional</Text>
              </View>
              <View style={styles.subCardBody}>
                <View style={styles.inlineRow}><Feather name="user" size={14} color="#6B7280" /><Text style={styles.inlineRowText}>Placed by: {d.placedByUserName || '—'}</Text></View>
                <View style={styles.inlineRow}><Feather name="credit-card" size={14} color="#6B7280" /><Text style={styles.inlineRowText}>Payment method: {d.paymentMethod || '—'}</Text></View>
                <View style={styles.inlineRow}><Feather name="hash" size={14} color="#6B7280" /><Text style={styles.inlineRowText}>Payment ID: {d.paymentId || '—'}</Text></View>
              </View>
            </View>
          </View>
        </>
      )}
      {/* Floating action button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={async () => {
          try {
            setError(null);
            setPickerOpen(true);
            const list = await listDeliveryPartners();
            setPartners(list);
          } catch (e: any) {
            setError(e.message);
          }
        }}
      >
        <Text style={styles.fabText}>Change Delivery Partner</Text>
      </TouchableOpacity>

      {/* Floating button to change status */}
      <TouchableOpacity
        style={[styles.fab, styles.fabSecondary]}
        activeOpacity={0.8}
        onPress={() => {
          setError(null);
          setStatusPickerOpen(true);
        }}
      >
        <Text style={styles.fabText}>Update Status</Text>
      </TouchableOpacity>

      {/* Modal picker */}
      <Modal transparent animationType="fade" visible={pickerOpen} onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select delivery partner</Text>
            <FlatList
              data={partners}
              keyExtractor={(p) => String(p.id)}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.partnerRow}
                  disabled={saving}
                  onPress={async () => {
                    try {
                      setSaving(true);
                      const updated = await updateOrderDeliveryPartner(order.id, item.id);
                      setDetails(updated);
                      setPickerOpen(false);
                    } catch (e: any) {
                      setError(e.message);
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  <Text style={styles.partnerName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setPickerOpen(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for status selection */}
      <Modal transparent animationType="fade" visible={statusPickerOpen} onRequestClose={() => setStatusPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select status</Text>
            <FlatList
              data={["pending","processing","in-transit","delivered","cancelled"]}
              keyExtractor={(s) => s}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.partnerRow}
                  disabled={saving}
                  onPress={async () => {
                    try {
                      setSaving(true);
                      const updated = await updateOrderStatus(order.id, item);
                      setDetails(updated);
                      setStatusPickerOpen(false);
                    } catch (e: any) {
                      setError(e.message);
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  <Text style={styles.partnerName}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setStatusPickerOpen(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
  headerRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: 8 },
  headerLeft: { flexDirection:'row', alignItems:'center', gap:8 },
  title: { fontSize: 22, fontWeight: '700', color:'#111' },
  statusBadge: { backgroundColor:'#2563EB', paddingHorizontal:12, paddingVertical:6, borderRadius:16 },
  statusBadgeText: { color:'#fff', fontSize:12, fontWeight:'600', textTransform:'capitalize' },
  stepperWrap: { marginBottom: 12 },
  error: { color: '#B91C1C', marginBottom: 8 },
  card: { backgroundColor:'#fff', borderRadius:16, padding:14, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, elevation:3, marginBottom:16 },
  detailRow: { flexDirection:'row', alignItems:'flex-start', paddingVertical:10 },
  detailDivider: { borderBottomWidth:1, borderBottomColor:'#E5E7EB' },
  detailIcon: { marginRight:12, marginTop:2 },
  detailTextWrap: { flex:1 },
  detailLabel: { fontSize:12, fontWeight:'600', color:'#374151', textTransform:'uppercase', letterSpacing:0.5 },
  detailValue: { fontSize:14, color:'#111', marginTop:2 },
  subCardsContainer: { marginBottom: 24 },
  subCard: { backgroundColor:'#fff', borderRadius:12, padding:12, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:4, elevation:2 },
  subCardHeader: { flexDirection:'row', alignItems:'center', gap:6, marginBottom:6 },
  subCardTitle: { fontSize:14, fontWeight:'700', color:'#111' },
  subCardBody: { gap:6 },
  inlineRow: { flexDirection:'row', alignItems:'center', gap:6 },
  inlineRowText: { fontSize:13, color:'#374151' },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  fabSecondary: { bottom: 76, backgroundColor: '#111827' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '70%' },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  partnerRow: { paddingVertical: 10 },
  partnerName: { fontSize: 14, color: '#111' },
  separator: { height: 1, backgroundColor: '#E5E7EB' },
  cancelBtn: { marginTop: 12, alignSelf: 'flex-end' },
  cancelText: { color: '#2563EB', fontWeight: '600' },
});
