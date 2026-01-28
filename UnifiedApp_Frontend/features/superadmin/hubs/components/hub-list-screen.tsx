import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { fetchHubs, fetchHubsGrouped, toggleHubStatus } from '../api';
import { GroupedHubs, HubFilter, HubStatus, HubSummary } from '../types';
import AddEditHubModal from './add-edit-hub-modal';
import HubCard from './hub-card';

export default function HubListScreen() {
  const [hubs, setHubs] = useState<HubSummary[]>([]);
  const [groupedHubs, setGroupedHubs] = useState<GroupedHubs>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<HubFilter>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHub, setSelectedHub] = useState<HubSummary | null>(null);

  // Load hubs on mount and when filters change
  useEffect(() => {
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      loadHubs();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [activeFilter, searchQuery]);

  const loadHubs = async () => {
    try {
      setLoading(true);
      const statusFilter = activeFilter === 'ALL' ? undefined : (activeFilter as HubStatus);
      const search = searchQuery.trim() || undefined;

      if (viewMode === 'grouped') {
        const grouped = await fetchHubsGrouped(statusFilter, search);
        setGroupedHubs(grouped);
      } else {
        const data = await fetchHubs(statusFilter, search);
        setHubs(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load hubs');
      console.error('Load hubs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHubs();
    setRefreshing(false);
  };

  const handleToggleStatus = async (hub: HubSummary) => {
    try {
      await toggleHubStatus(hub.id);
      Alert.alert('Success', `Hub ${hub.status === HubStatus.ACTIVE ? 'deactivated' : 'activated'}`);
      loadHubs();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle hub status');
      console.error('Toggle status error:', error);
    }
  };

  const handleEdit = (hub: HubSummary) => {
    setSelectedHub(hub);
    setModalVisible(true);
  };

  const handleAddNew = () => {
    setSelectedHub(null);
    setModalVisible(true);
  };

  const handleHubPress = (hub: HubSummary) => {
    // TODO: Navigate to hub details screen
    Alert.alert(
      hub.name,
      `Hub ID: ${hub.code}\nLocation: ${hub.location}\nStatus: ${hub.status}`,
      [
        { text: 'Edit', onPress: () => handleEdit(hub) },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleViewInventory = (hub: HubSummary) => {
    console.log('📦 START handleViewInventory - hub:', hub.name, 'ID:', hub.id);
    console.log('📦 Router object:', router);
    console.log('📦 Router.push type:', typeof router.push);
    
    try {
      const path = `/inventory/${hub.id}?hubName=${encodeURIComponent(hub.name)}`;
      console.log('📦 Constructed path:', path);
      
      console.log('📦 About to call router.push...');
      router.push(path);
      console.log('✅ Router.push called successfully');
    } catch (error) {
      console.error('❌ Navigation error:', error);
      Alert.alert('Navigation Error', `Failed to open inventory: ${error}`);
    }
    
    console.log('📦 END handleViewInventory');
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedHub(null);
  };

  const handleModalSuccess = () => {
    loadHubs();
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'list' ? 'grouped' : 'list'));
    loadHubs();
  };

  const renderFilterButton = (filter: HubFilter, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, activeFilter === filter && styles.filterButtonActive]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderHubItem = ({ item }: { item: HubSummary }) => (
    <HubCard
      hub={item}
      onEdit={handleEdit}
      onToggleStatus={handleToggleStatus}
      onPress={handleHubPress}
      onViewInventory={handleViewInventory}
    />
  );

  const renderGroupedSection = ({ section }: any) => (
    <View style={styles.sectionHeader}>
      <Ionicons name="location" size={20} color="#007AFF" />
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>({section.data.length})</Text>
    </View>
  );

  // Convert grouped hubs to section list format
  const groupedSections = Object.entries(groupedHubs).map(([city, hubList]) => ({
    title: city,
    data: hubList,
  }));

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading hubs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hub Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
          <Ionicons name="add" size={20} color="#1E1407" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hubs by name, code, or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters and View Toggle */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterButtons}>
          {renderFilterButton('ALL', 'All')}
          {renderFilterButton('ACTIVE', 'Active')}
          {renderFilterButton('INACTIVE', 'Inactive')}
        </View>

        <TouchableOpacity style={styles.viewToggle} onPress={toggleViewMode}>
          <Ionicons
            name={viewMode === 'list' ? 'grid' : 'list'}
            size={22}
            color="#F5C84C"
          />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {viewMode === 'grouped'
            ? `${Object.keys(groupedHubs).length} cities • ${Object.values(groupedHubs).flat().length} hubs`
            : `${hubs.length} hub${hubs.length !== 1 ? 's' : ''} found`}
        </Text>
      </View>

      {/* Hub List */}
      {viewMode === 'list' ? (
        <FlatList
          data={hubs}
          keyExtractor={(item) => item.id}
          renderItem={renderHubItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No hubs found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery || activeFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Add your first hub to get started'}
              </Text>
            </View>
          }
        />
      ) : (
        <SectionList
          sections={groupedSections}
          keyExtractor={(item) => item.id}
          renderItem={renderHubItem}
          renderSectionHeader={renderGroupedSection}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No hubs found</Text>
            </View>
          }
        />
      )}

      {/* Add/Edit Modal */}
      <AddEditHubModal
        visible={modalVisible}
        hub={selectedHub}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3ED',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#F7F3ED',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E1407',
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5C84C',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8E1D7',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E1407',
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E1D7',
  },
  filterButtonActive: {
    backgroundColor: '#F5C84C',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#70614F',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  viewToggle: {
    padding: 8,
    backgroundColor: '#FDFBF7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E1D7',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#70614F',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginLeft: 8,
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});
