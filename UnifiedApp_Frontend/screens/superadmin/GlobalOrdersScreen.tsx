import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../App';
import { AuthContext } from '../../contexts/AuthContext';
import { ADMIN_EMAIL } from '../../services/apiBase';
import { listOrders, OrderSummary } from '../../services/orderService';

type Props = NativeStackScreenProps<RootStackParamList, 'GlobalOrders'>;

const STATUS_COLORS: Record<string, string> = {
  processing: '#FF9800',
  pending: '#FF9800',
  'in-transit': '#3B82F6',
  in_transit: '#3B82F6',
  delivered: '#4CAF50',
  cancelled: '#F44336'
};

export default function GlobalOrdersScreen({ navigation }: Props) {
  const { authedEmail } = useContext(AuthContext) as any;
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [issuesOnly, setIssuesOnly] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const isFocused = useIsFocused();

  // Redirect guard: only allow specific admin email
  useEffect(() => {
    if (authedEmail && authedEmail.toLowerCase() !== ADMIN_EMAIL) {
      // Non-admin: redirect out of admin area
      navigation.replace('SupportMain');
    }
  }, [authedEmail, navigation]);

  const initializedRef = useRef<boolean>(false);
  // Debounce + abort control setup
  // Use ReturnType<typeof setTimeout> for cross-platform RN/TS compatibility
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastParamsRef = useRef<string>('');

  const fetchOrders = useCallback(async (reset = false) => {
    // Prevent overlapping requests
    if (loading) return;
    // Abort any in-flight request (stale)
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const nextPage = reset ? 0 : page;
      if (!initializedRef.current) initializedRef.current = true;
      const paramsKey = JSON.stringify({ nextPage, search: search.trim(), statusFilter, issuesOnly });
      // Avoid refetch if params identical and not a pagination append
      if (!reset && paramsKey === lastParamsRef.current) {
        setLoading(false);
        return;
      }
      lastParamsRef.current = paramsKey;
      const resp = await listOrders({ page: nextPage, size: 20, search: search.trim() || undefined, status: statusFilter, issue: issuesOnly || undefined, signal: controller.signal } as any);
      setTotalPages(resp.totalPages);
      if (reset) {
        setOrders(resp.content);
        setPage(0);
      } else {
        setOrders(prev => [...prev, ...resp.content]);
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        // Silently ignore aborted requests
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, issuesOnly, loading]);

  // Only fetch when screen is focused to avoid background queries when switching tabs
  // Debounced fetch when filters/search change and screen focused
  useEffect(() => {
    if (!isFocused) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchOrders(true);
    }, 400); // 400ms debounce
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [isFocused, search, statusFilter, issuesOnly, fetchOrders]);

  // Refresh when returning to this screen (e.g., after changing delivery partner in details)
  useFocusEffect(
    useCallback(() => {
      // Only fetch if not initialized (prevents duplicate initial query on mount)
      if (!initializedRef.current) {
        fetchOrders(true);
      }
      return () => {};
    }, [fetchOrders])
  );

  const loadMore = () => {
    if (loading) return;
    if (page + 1 >= totalPages) return;
    setPage(p => p + 1);
  };

  useEffect(() => {
    if (page > 0) {
      fetchOrders();
    }
  }, [page, fetchOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(true);
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: OrderSummary }) => {
    const color = STATUS_COLORS[item.status?.toLowerCase()] || '#607D8B';
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderDetails', { order: item })}>
        <View style={styles.cardHeader}> 
          <Text style={styles.orderId}>#{item.id}</Text>
          {item.issueFlag && (
            <Feather name="alert-triangle" size={18} color="#F44336" />
          )}
        </View>
        <Text style={styles.customer}>{item.customerName || '—'}</Text>
  {/* Product removed from global summary per new requirement */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Hub:</Text>
          <Text style={styles.metaValue}>{item.hubName || '—'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Delivery:</Text>
          <Text style={styles.metaValue}>{item.deliveryPartnerName || '—'}</Text>
        </View>
        <View style={styles.statusRow}> 
          <View style={[styles.statusPill, { backgroundColor: color }]}> 
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const StatusFilters = () => (
    <View style={styles.filterRow}>
      {['processing','pending','in-transit','delivered','cancelled'].map(stat => {
        const active = statusFilter === stat;
        return (
          <TouchableOpacity key={stat} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => setStatusFilter(active ? undefined : stat)}>
            <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{stat}</Text>
          </TouchableOpacity>
        );
      })}
      {/* Issues-only toggle */}
      <TouchableOpacity style={[styles.filterChip, issuesOnly && styles.filterChipActive]} onPress={() => setIssuesOnly(v => !v)}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
          <Feather name="alert-circle" size={14} color={issuesOnly ? '#fff' : '#374151'} />
          <Text style={[styles.filterChipText, issuesOnly && styles.filterChipTextActive]}>issues</Text>
        </View>
      </TouchableOpacity>
      {statusFilter && (
        <TouchableOpacity style={styles.clearChip} onPress={() => setStatusFilter(undefined)}>
          <Feather name="x" size={16} color="#555" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.searchBar}> 
        <Feather name="search" size={18} color="#666" />
        <TextInput
          placeholder="Search order ID"
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>
  {showFilters && <StatusFilters />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        renderItem={renderItem}
        contentContainerStyle={orders.length === 0 ? styles.emptyListContainer : undefined}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No orders found</Text> : null}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowFilters(v => !v)}>
        <Feather name="sliders" size={22} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal:16, paddingHorizontal:12, borderRadius:10, height:44, gap:8, borderWidth:1, borderColor:'#E5E7EB' },
  searchInput: { flex:1, fontSize:14, color:'#111' },
  filterRow: { flexDirection:'row', flexWrap:'wrap', marginHorizontal:16, marginTop:12, gap:8 },
  filterChip: { paddingHorizontal:12, paddingVertical:8, backgroundColor:'#fff', borderRadius:16, borderWidth:1, borderColor:'#D1D5DB' },
  filterChipActive: { backgroundColor:'#111', borderColor:'#111' },
  filterChipText: { fontSize:12, color:'#374151', fontWeight:'500' },
  filterChipTextActive: { color:'#fff' },
  clearChip: { width:32, height:32, borderRadius:16, backgroundColor:'#E5E7EB', alignItems:'center', justifyContent:'center' },
  card: { backgroundColor:'#fff', marginHorizontal:16, marginTop:12, padding:14, borderRadius:12, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:4, elevation:2 },
  cardHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  orderId: { fontSize:14, fontWeight:'600', color:'#111' },
  customer: { marginTop:4, fontSize:13, color:'#333' },
  metaRow: { flexDirection:'row', marginTop:4 },
  metaLabel: { fontSize:11, color:'#6B7280', width:70 },
  metaValue: { fontSize:11, color:'#111', flex:1 },
  statusRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop:8 },
  statusPill: { paddingHorizontal:10, paddingVertical:4, borderRadius:12 },
  statusText: { fontSize:11, color:'#fff', fontWeight:'600', textTransform:'capitalize' },
  dateText: { fontSize:10, color:'#374151' },
  emptyListContainer: { flexGrow:1, justifyContent:'center', alignItems:'center' },
  emptyText: { fontSize:14, color:'#6B7280' },
  errorText: { marginHorizontal:16, marginTop:8, color:'#DC2626', fontSize:12 },
  fab: { position:'absolute', bottom:24, right:24, width:52, height:52, borderRadius:26, backgroundColor:'#2563EB', alignItems:'center', justifyContent:'center', shadowColor:'#000', shadowOpacity:0.2, shadowRadius:4, elevation:4 },
});
