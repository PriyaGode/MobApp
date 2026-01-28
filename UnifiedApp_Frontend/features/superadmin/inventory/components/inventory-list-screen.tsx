import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from '../../../../components/toast';
import { deleteInventoryItem, getInventoryByHub, markOutOfStock } from '../api';
import { InventoryItem, InventoryStatus } from '../types';
import AddEditInventoryModal from './add-edit-inventory-modal';
import TransferStockModal from './transfer-stock-modal';
import { TransferRequestsModal, transferRequestsApi } from '../../transfer-requests';

interface InventoryListScreenProps {
  hubId: string;
  hubName: string;
}

export default function InventoryListScreen({ hubId, hubName }: InventoryListScreenProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | null>(null);
  
  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTransferRequestsModal, setShowTransferRequestsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [pendingTransferCount, setPendingTransferCount] = useState(0);
  
  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  useEffect(() => {
    loadInventory();
    loadPendingTransferCount();
  }, [hubId]);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, statusFilter]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await getInventoryByHub(hubId);
      setItems(data);
    } catch (error) {
      showToastMessage('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingTransferCount = async () => {
    try {
      const response = await transferRequestsApi.getPendingCount();
      setPendingTransferCount(response.count);
    } catch (error) {
      console.error('Failed to load pending transfer count:', error);
      setPendingTransferCount(0); // Set to 0 on error
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInventory();
    setRefreshing(false);
  };

  const filterItems = () => {
    let filtered = [...items];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.sku.toLowerCase().includes(query) ||
          item.productName.toLowerCase().includes(query)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredItems(filtered);
  };

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setShowAddEditModal(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowAddEditModal(true);
  };

  const handleTransferItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowTransferModal(true);
  };

  const handleMarkOutOfStock = (item: InventoryItem) => {
    Alert.alert(
      'Mark Out of Stock',
      `Are you sure you want to mark "${item.productName}" as out of stock?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              await markOutOfStock(hubId, item.id);
              showToastMessage('Item marked as out of stock', 'success');
              loadInventory();
            } catch (error) {
              showToastMessage('Failed to mark item as out of stock', 'error');
            }
          },
        },
      ]
    );
  };

  const handleDeleteItem = (item: InventoryItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.productName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInventoryItem(hubId, item.id);
              showToastMessage('Item deleted successfully', 'success');
              loadInventory();
            } catch (error) {
              showToastMessage('Failed to delete item', 'error');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: InventoryStatus) => {
    switch (status) {
      case InventoryStatus.OUT_OF_STOCK:
        return '#dc2626'; // Red
      case InventoryStatus.REORDER_NEEDED:
        return '#dc2626'; // Red
      case InventoryStatus.LOW_STOCK:
        return '#eab308'; // Yellow
      case InventoryStatus.IN_STOCK:
        return '#16a34a'; // Green
      default:
        return '#6b7280'; // Gray
    }
  };

  const getStatusLabel = (status: InventoryStatus) => {
    switch (status) {
      case InventoryStatus.OUT_OF_STOCK:
        return 'Out of Stock';
      case InventoryStatus.REORDER_NEEDED:
        return 'Reorder Needed';
      case InventoryStatus.LOW_STOCK:
        return 'Low Stock';
      case InventoryStatus.IN_STOCK:
        return 'In Stock';
      default:
        return status;
    }
  };

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => {
    const statusColor = getStatusColor(item.status);
    const isLowOrOut =
      item.status === InventoryStatus.OUT_OF_STOCK ||
      item.status === InventoryStatus.REORDER_NEEDED;

    return (
      <View style={[styles.itemCard, { borderLeftColor: statusColor }]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemHeaderLeft}>
            <Text style={styles.sku}>{item.sku}</Text>
            <Text style={styles.productName}>{item.productName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.quantityRow}>
            <View style={styles.quantityBox}>
              <Text style={styles.quantityLabel}>Quantity</Text>
              <Text style={[styles.quantityValue, isLowOrOut && { color: statusColor }]}>
                {item.quantity} {item.unit || 'units'}
              </Text>
            </View>
            <View style={styles.quantityBox}>
              <Text style={styles.quantityLabel}>Reorder Level</Text>
              <Text style={styles.quantityValue}>{item.reorderLevel}</Text>
            </View>
            {item.unitPrice && (
              <View style={styles.quantityBox}>
                <Text style={styles.quantityLabel}>Price</Text>
                <Text style={styles.quantityValue}>${item.unitPrice.toFixed(2)}</Text>
              </View>
            )}
          </View>

          {item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleEditItem(item)}>
            <Ionicons name="pencil" size={18} color="#007AFF" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleTransferItem(item)}
            disabled={item.quantity === 0}
          >
            <Ionicons
              name="swap-horizontal"
              size={18}
              color={item.quantity === 0 ? '#ccc' : '#10b981'}
            />
            <Text
              style={[
                styles.actionButtonText,
                item.quantity === 0 && { color: '#ccc' },
              ]}
            >
              Transfer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleMarkOutOfStock(item)}
            disabled={item.quantity === 0}
          >
            <Ionicons name="close-circle" size={18} color={item.quantity === 0 ? '#ccc' : '#ef4444'} />
            <Text style={[styles.actionButtonText, item.quantity === 0 && { color: '#ccc' }]}>
              Out of Stock
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteItem(item)}>
            <Ionicons name="trash" size={18} color="#dc2626" />
            <Text style={[styles.actionButtonText, { color: '#dc2626' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFilterChip = (label: string, value: InventoryStatus | null) => (
    <TouchableOpacity
      style={[styles.filterChip, statusFilter === value && styles.filterChipActive]}
      onPress={() => setStatusFilter(statusFilter === value ? null : value)}
    >
      <Text
        style={[
          styles.filterChipText,
          statusFilter === value && styles.filterChipTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{hubName} Inventory</Text>
          <Text style={styles.subtitle}>{filteredItems.length} items</Text>
        </View>
        <TouchableOpacity 
          style={styles.bellButton}
          onPress={() => setShowTransferRequestsModal(true)}
        >
          <Ionicons name="notifications" size={24} color="#007AFF" />
          {pendingTransferCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingTransferCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by SKU or product name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        {renderFilterChip('All', null)}
        {renderFilterChip('In Stock', InventoryStatus.IN_STOCK)}
        {renderFilterChip('Low Stock', InventoryStatus.LOW_STOCK)}
        {renderFilterChip('Reorder', InventoryStatus.REORDER_NEEDED)}
        {renderFilterChip('Out', InventoryStatus.OUT_OF_STOCK)}
      </View>

      {/* Inventory List */}
      <FlatList
        data={filteredItems}
        renderItem={renderInventoryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No inventory items found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || statusFilter
                ? 'Try adjusting your filters'
                : 'Add your first item to get started'}
            </Text>
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddItem}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Modals */}
      <AddEditInventoryModal
        visible={showAddEditModal}
        hubId={hubId}
        item={selectedItem}
        onClose={() => {
          setShowAddEditModal(false);
          setSelectedItem(null);
        }}
        onSuccess={() => {
          setShowAddEditModal(false);
          setSelectedItem(null);
          loadInventory();
          showToastMessage(
            selectedItem ? 'Item updated successfully' : 'Item added successfully',
            'success'
          );
        }}
      />

      <TransferStockModal
        visible={showTransferModal}
        item={selectedItem}
        sourceHubId={hubId}
        onClose={() => {
          setShowTransferModal(false);
          setSelectedItem(null);
        }}
        onSuccess={() => {
          setShowTransferModal(false);
          setSelectedItem(null);
          loadInventory();
          showToastMessage('Stock transferred successfully', 'success');
        }}
      />

      <TransferRequestsModal
        visible={showTransferRequestsModal}
        onClose={() => {
          setShowTransferRequestsModal(false);
          loadPendingTransferCount();
        }}
      />

      {/* Toast */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  bellButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemHeaderLeft: {
    flex: 1,
  },
  sku: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  itemDetails: {
    marginBottom: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quantityBox: {
    flex: 1,
  },
  quantityLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
