import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SUPERADMIN_API_BASE_URL } from '../../config';

type AuditLog = {
  id: string;
  userId: string;
  actionType: string;
  timestamp: string;
  hubId?: string;
  regionSnapshot?: string;
  ipAddress?: string;
  summary?: string;
};

type AuditResponse = {
  content: AuditLog[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  todayCount: number;
};

const ACTION_TYPES = [
  'HUB_EDIT',
  'PRODUCT_UPDATE',
  'INVENTORY_TRANSFER',
  'ORDER_MODIFICATION',
  'USER_ROLE_CHANGE',
  'USER_STATUS_CHANGE',
  'LOGIN',
  'LOGOUT',
  'TICKET_ACTION',
  'CONFIG_CHANGE'
];

export default function AuditDashboardScreen() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [userId, setUserId] = useState('');
  const [actionType, setActionType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  const fetchLogs = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', reset ? '0' : String(page));
      params.append('size', String(size));
      if (userId) params.append('userId', userId.trim());
      if (actionType) params.append('actionType', actionType.trim());
      if (startDate) params.append('startDate', startDate.trim());
      if (endDate) params.append('endDate', endDate.trim());
      if (search) params.append('search', search.trim());
      const res = await fetch(`${SUPERADMIN_API_BASE_URL}/audit-logs/logs?${params.toString()}`);
      const data: AuditResponse = await res.json();
      setTodayCount(data.todayCount || 0);
      setTotalPages(data.totalPages || 0);
      setPage(data.page || 0);
      setLogs(data.content || []);
    } catch (e) {
      console.error('Failed to fetch audit logs', e);
    } finally {
      setLoading(false);
    }
  }, [page, size, userId, actionType, startDate, endDate, search]);

  useEffect(() => {
    fetchLogs(true);
  }, [actionType, userId, startDate, endDate, search]);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => prev === id ? null : id);
  };

  const applyFilters = () => {
    setFilterVisible(false);
    setPage(0);
    fetchLogs(true);
  };

  const clearFilters = () => {
    setUserId('');
    setActionType('');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setPage(0);
    setFilterVisible(false);
    fetchLogs(true);
  };

  const renderRow = ({ item }: { item: AuditLog }) => {
    const isExpanded = expanded === item.id;
    return (
      <View style={styles.rowContainer}>
        <TouchableOpacity style={styles.rowHeader} onPress={() => toggleExpand(item.id)}>
          <View style={styles.rowLeft}>  
            <Text style={styles.cellUser}>{item.userId}</Text>
            <Text style={styles.cellAction}>{item.actionType}</Text>
            <Text style={styles.cellTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
            <Text style={styles.cellHub}>{item.hubId || '-'} / {item.regionSnapshot || '-'}</Text>
            <Text style={styles.cellIp}>{item.ipAddress || '-'}</Text>
            <Text style={styles.cellSummary} numberOfLines={1}>{item.summary || '-'}</Text>
          </View>
          <MaterialIcons name={isExpanded ? 'expand-less' : 'expand-more'} size={20} color="#374151" />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.expandedArea}>
            <Text style={styles.expandedLabel}>Action Summary:</Text>
            <Text style={styles.expandedText}>{item.summary || 'No details.'}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}> 
      <View style={styles.header}> 
        <MaterialIcons name="fact-check" size={22} color="#1565C0" />
        <Text style={styles.headerTitle}>Audit Logs</Text>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterVisible(true)}>
          <MaterialIcons name="filter-list" size={20} color="#1565C0" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.summaryBar}> 
        <Text style={styles.summaryText}>{todayCount} Actions Logged Today</Text>
      </View>
      <View style={styles.tableHeader}> 
        <Text style={[styles.th, styles.flexUser]}>User ID</Text>
        <Text style={[styles.th, styles.flexAction]}>Action</Text>
        <Text style={[styles.th, styles.flexTimestamp]}>Timestamp</Text>
        <Text style={[styles.th, styles.flexHub]}>Hub / Region</Text>
        <Text style={[styles.th, styles.flexIp]}>IP</Text>
        <Text style={[styles.th, styles.flexSummary]}>Summary</Text>
        <Text style={[styles.th, { width: 24 }]}></Text>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRow}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: '#6B7280' }}>No audit log entries found.</Text>
            </View>
          }
        />
      )}
      <View style={styles.paginationBar}> 
        <TouchableOpacity
          style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
          disabled={page === 0}
          onPress={() => setPage(p => Math.max(p - 1, 0))}
        >
          <MaterialIcons name="chevron-left" size={20} color={page === 0 ? '#9CA3AF' : '#1565C0'} />
        </TouchableOpacity>
        <Text style={styles.pageInfo}>Page {page + 1} / {totalPages || 1}</Text>
        <TouchableOpacity
          style={[styles.pageBtn, (page + 1 >= totalPages) && styles.pageBtnDisabled]}
          disabled={page + 1 >= totalPages}
          onPress={() => setPage(p => p + 1)}
        >
          <MaterialIcons name="chevron-right" size={20} color={(page + 1 >= totalPages) ? '#9CA3AF' : '#1565C0'} />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal visible={filterVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}> 
          <View style={styles.modalContent}> 
            <View style={styles.modalHeader}> 
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <MaterialIcons name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.label}>User ID</Text>
              <TextInput style={styles.input} value={userId} onChangeText={setUserId} placeholder="USR-1234" />
              <Text style={styles.label}>Action Type</Text>
              <View style={styles.actionTypesContainer}>
                {ACTION_TYPES.map(a => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.actionTypeChip, actionType === a && styles.actionTypeChipActive]}
                    onPress={() => setActionType(prev => prev === a ? '' : a)}
                  >
                    <Text style={[styles.actionTypeText, actionType === a && styles.actionTypeTextActive]}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="2025-11-01" />
              <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="2025-11-25" />
              <Text style={styles.label}>Search (summary / hub / IP)</Text>
              <TextInput style={styles.input} value={search} onChangeText={setSearch} placeholder="search keyword" />
            </ScrollView>
            <View style={styles.modalActions}> 
              <TouchableOpacity style={[styles.modalBtn, styles.clearBtn]} onPress={clearFilters}> 
                <Text style={styles.modalBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.applyBtn]} onPress={applyFilters}> 
                <Text style={[styles.modalBtnText, styles.applyBtnText]}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', gap: 10 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(21,101,192,0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  filterText: { fontSize: 12, fontWeight: '600', color: '#1565C0' },
  summaryBar: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#EFF6FF', borderBottomWidth: 1, borderBottomColor: '#DBEAFE' },
  summaryText: { fontSize: 13, fontWeight: '600', color: '#1E3A8A' },
  tableHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  th: { fontSize: 11, fontWeight: '700', color: '#374151' },
  flexUser: { flex: 0.9 },
  flexAction: { flex: 0.9 },
  flexTimestamp: { flex: 1.2 },
  flexHub: { flex: 1.1 },
  flexIp: { flex: 0.8 },
  flexSummary: { flex: 1.2 },
  rowContainer: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  rowLeft: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  cellUser: { flex: 0.9, fontSize: 11, fontWeight: '600', color: '#111827' },
  cellAction: { flex: 0.9, fontSize: 11, color: '#1F2937' },
  cellTimestamp: { flex: 1.2, fontSize: 11, color: '#374151' },
  cellHub: { flex: 1.1, fontSize: 11, color: '#374151' },
  cellIp: { flex: 0.8, fontSize: 11, color: '#374151' },
  cellSummary: { flex: 1.2, fontSize: 11, color: '#4B5563' },
  expandedArea: { paddingHorizontal: 14, paddingBottom: 12 },
  expandedLabel: { fontSize: 11, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  expandedText: { fontSize: 12, lineHeight: 16, color: '#374151' },
  paginationBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  pageBtn: { padding: 6, borderRadius: 8, backgroundColor: '#F3F4F6', marginHorizontal: 8 },
  pageBtnDisabled: { opacity: 0.4 },
  pageInfo: { fontSize: 12, fontWeight: '600', color: '#111827' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10, maxHeight: '75%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, color: '#111827' },
  actionTypesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionTypeChip: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#E5E7EB', borderRadius: 16 },
  actionTypeChipActive: { backgroundColor: '#1565C0' },
  actionTypeText: { fontSize: 11, fontWeight: '600', color: '#1F2937' },
  actionTypeTextActive: { color: 'white' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14, gap: 12 },
  modalBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  clearBtn: { backgroundColor: '#F3F4F6' },
  applyBtn: { backgroundColor: '#1565C0' },
  modalBtnText: { fontSize: 12, fontWeight: '600', color: '#1F2937' },
  applyBtnText: { color: 'white' }
});
