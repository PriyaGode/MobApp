import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // Correct import
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/superadmin/Button';
import { API_BASE } from '../../services/apiBase';
import { normalize, wp } from '../../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window'); // Import from central config

// --- Mock Data for Filters (can be fetched from API in future) ---
const CATEGORY_OPTIONS = ['Fresh Mangoes', 'Pantry & Staples', 'Beverages'];
const BRAND_OPTIONS = ['Ratnagiri Farms', 'Devgad Orchards', 'Gir Organics', 'Andhra Produce', 'Local'];
// -----------------------------

// This type now correctly matches your backend Product model
type Product = {
  id: number;
  name: string;
  category: string;
  variety: string;
  origin: string;
  description: string;
  price: number;
  stock: number;
  availableKg: number;
  imageUrl: string;
  status: string;
};

const ProductListItem = ({ item, onPress, onStatusToggle, onDelete, onStockSync }: { item: Product; onPress: () => void; onStatusToggle: (id: number, currentStatus: string) => void; onDelete: (id: number) => void; onStockSync: (id: number) => void }) => (
  <View style={styles.itemContainer}>
    <View style={styles.itemRow}>
      <Image source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=100&q=80' }} style={styles.thumbnail} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name || 'Unnamed Product'}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.itemLabel}>SKU:</Text>
          <Text style={styles.itemValue}>AAM-{String(item.id).padStart(3, '0')}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.itemLabel}>Price:</Text>
          <Text style={styles.itemValue}>₹{item.price ? String(item.price.toFixed(0)) : '0'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.itemLabel}>Stock:</Text>
          <Text style={styles.itemValue}>{item.stock || 0} units</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.itemLabel}>Origin:</Text>
          <Text style={styles.itemValue} numberOfLines={1}>{item.origin || 'N/A'}</Text>
        </View>
      </View>
    </View>
    <View style={styles.divider} />
    <View style={styles.actionRow}>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>{(item.status || 'ACTIVE') === 'ACTIVE' ? 'Active' : 'Inactive'}</Text>
        <Switch
          value={(item.status || 'ACTIVE') === 'ACTIVE'}
          onValueChange={() => onStatusToggle(item.id, item.status || 'ACTIVE')}
          trackColor={{ false: '#D1D1D6', true: '#4CAF50' }}
          thumbColor="#fff"
        />
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => onStockSync(item.id)} style={styles.iconButton}>
          <MaterialIcons name="inventory" size={normalize(20)} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPress} style={styles.iconButton}>
          <MaterialIcons name="edit" size={normalize(20)} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.iconButton}>
          <MaterialIcons name="delete" size={normalize(20)} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function ProductListScreen({ navigation }: { navigation: any }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (sortBy) params.append('sortBy', sortBy);
      
      // This is the corrected fetch call using the central configuration
  const response = await fetch(`${API_BASE}/api/admin/products?${params.toString()}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network request failed: ${errorText || 'Server error'}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, categoryFilter, statusFilter, sortBy]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
      // fetchProducts is stable and won't cause re-runs, but we want to refetch when filters change.
    }, [fetchProducts]) 
  );

  const applyFiltersAndSort = () => {
    setFilterModalVisible(false);
    fetchProducts();
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setStatusFilter('');
    setSortBy('id');
  };

  const handleStatusToggle = async (productId: number, currentStatus: string) => {
    const safeCurrentStatus = currentStatus || 'ACTIVE';
    const newStatus = safeCurrentStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    
    try {
  const response = await fetch(`${API_BASE}/api/admin/products/${productId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      Alert.alert('Success', `Product ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
      fetchProducts();
    } catch (error) {
      Alert.alert('Error', 'Failed to update product status');
    }
  };

  const handleDelete = async (productId: number) => {
    Alert.alert(
      'Archive Product',
      'Are you sure you want to archive this product? It will be hidden from customers.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE}/api/admin/products/${productId}`, {
                method: 'DELETE'
              });
              
              if (!response.ok) {
                throw new Error('Failed to archive product');
              }
              
              Alert.alert('Success', 'Product archived successfully');
              fetchProducts();
            } catch (error) {
              Alert.alert('Error', 'Failed to archive product');
            }
          }
        }
      ]
    );
  };

  if (isLoading && products.length === 0) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (error) {
    return <View style={styles.centered}><Text style={styles.errorText}>Error: {error.message}</Text><Button title="Retry" onPress={fetchProducts} /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={normalize(24)} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Catalog</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search products..." 
            placeholderTextColor="#888"
            value={searchQuery} 
            onChangeText={setSearchQuery} 
            returnKeyType="search" 
          />
          <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={20} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductListItem
            item={item}
            onPress={() => navigation.navigate('ProductEdit', { product: item })}
            onStatusToggle={handleStatusToggle}
            onDelete={handleDelete}
            onStockSync={(id) => navigation.navigate('StockSync', { productId: id })}
          />
        )}
        onRefresh={fetchProducts}
        refreshing={isLoading}
        ListEmptyComponent={<Text style={styles.emptyText}>No products found.</Text>}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ProductEdit')}>
        <MaterialIcons name="add" size={28} color="#333" />
      </TouchableOpacity>

      <Modal transparent visible={isFilterModalVisible} animationType="fade" onRequestClose={() => setFilterModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setFilterModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>
            
            <Text style={styles.modalSectionTitle}>Filter by Status</Text>
            <View style={styles.tagContainer}>
              <TouchableOpacity style={[styles.tag, statusFilter === 'ACTIVE' && styles.activeTag]} onPress={() => setStatusFilter(prev => prev === 'ACTIVE' ? '' : 'ACTIVE')}><Text style={[styles.tagText, statusFilter === 'ACTIVE' && styles.activeTagText]}>Active</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.tag, statusFilter === 'DRAFT' && styles.activeTag]} onPress={() => setStatusFilter(prev => prev === 'DRAFT' ? '' : 'DRAFT')}><Text style={[styles.tagText, statusFilter === 'DRAFT' && styles.activeTagText]}>Draft</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.tag, statusFilter === 'ARCHIVED' && styles.activeTag]} onPress={() => setStatusFilter(prev => prev === 'ARCHIVED' ? '' : 'ARCHIVED')}><Text style={[styles.tagText, statusFilter === 'ARCHIVED' && styles.activeTagText]}>Archived</Text></TouchableOpacity>
            </View>
            
            <Text style={styles.modalSectionTitle}>Sort By</Text>
            <View style={styles.sortOptions}>
              <TouchableOpacity style={[styles.sortButton, sortBy === 'id' && styles.activeSort]} onPress={() => setSortBy('id')}><Text style={styles.filterText}>Recently Added</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.sortButton, sortBy === 'price' && styles.activeSort]} onPress={() => setSortBy('price')}><Text style={styles.filterText}>Price</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.sortButton, sortBy === 'stock' && styles.activeSort]} onPress={() => setSortBy('stock')}><Text style={styles.filterText}>Stock</Text></TouchableOpacity>
            </View>

            <Text style={styles.modalSectionTitle}>Filter by Category</Text>
            <View style={styles.tagContainer}>
              {CATEGORY_OPTIONS.map(cat => <TouchableOpacity key={cat} style={[styles.tag, categoryFilter === cat && styles.activeTag]} onPress={() => setCategoryFilter(prev => prev === cat ? '' : cat)}><Text style={[styles.tagText, categoryFilter === cat && styles.activeTagText]}>{cat}</Text></TouchableOpacity>)}
            </View>

            <Button title="Apply" onPress={applyFiltersAndSort} style={{width: '100%', alignSelf: 'center', marginTop: 20}} />
            <TouchableOpacity onPress={clearFilters}><Text style={styles.clearButton}>Clear All Filters</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { padding: normalize(16), backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: normalize(40) },
  headerTitle: { fontSize: normalize(18), fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center' },
  headerSpacer: { width: normalize(40) },
  searchContainer: { backgroundColor: 'white', paddingHorizontal: wp(4), paddingVertical: normalize(12) },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: normalize(8), paddingHorizontal: normalize(12), height: normalize(48) },
  searchIcon: { marginRight: normalize(8) },
  searchInput: { flex: 1, fontSize: normalize(16), color: '#333', padding: 0 },
  filterButton: { padding: normalize(4) },
  itemContainer: { backgroundColor: 'white', marginHorizontal: wp(4), marginVertical: normalize(6), borderRadius: normalize(10), elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, padding: normalize(12) },
  itemRow: { flexDirection: 'row', marginBottom: normalize(8) },
  thumbnail: { width: normalize(60), height: normalize(60), borderRadius: normalize(8), marginRight: normalize(12), backgroundColor: '#eee' },
  itemDetails: { flex: 1, justifyContent: 'space-between' },
  itemName: { fontSize: normalize(15), fontWeight: 'bold', color: '#212121', marginBottom: normalize(6) },
  infoRow: { flexDirection: 'row', marginBottom: normalize(2) },
  itemLabel: { fontSize: normalize(12), color: '#757575', width: normalize(50), fontWeight: '500' },
  itemValue: { fontSize: normalize(12), color: '#212121', flex: 1 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: normalize(8) },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', gap: normalize(8) },
  toggleLabel: { fontSize: normalize(13), color: '#212121', fontWeight: '500' },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: normalize(8) },
  iconButton: { padding: normalize(8), borderRadius: normalize(8), backgroundColor: '#F5F5F5' },
  fab: { position: 'absolute', right: wp(6), bottom: normalize(24), backgroundColor: '#FFC107', width: normalize(56), height: normalize(56), borderRadius: normalize(28), justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  emptyText: { textAlign: 'center', marginTop: normalize(50), fontSize: normalize(16), color: '#888' },
  errorText: { color: '#D32F2F', marginBottom: 10, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: normalize(10), padding: normalize(20), width: wp(90), maxHeight: '80%' },
  modalTitle: { fontSize: normalize(20), fontWeight: 'bold', marginBottom: normalize(20), textAlign: 'center' },
  modalSectionTitle: { fontSize: normalize(16), fontWeight: '600', marginTop: normalize(15), marginBottom: normalize(10) },
  sortOptions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  sortButton: { paddingVertical: normalize(8), paddingHorizontal: normalize(15), borderRadius: normalize(20), backgroundColor: '#e0e0e0' },
  activeSort: { backgroundColor: '#2196F3' },
  filterText: { color: '#333', fontWeight: '600', fontSize: normalize(14) },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  tag: { paddingVertical: normalize(6), paddingHorizontal: normalize(12), borderRadius: normalize(16), backgroundColor: '#e0e0e0', margin: normalize(4) },
  activeTag: { backgroundColor: '#2196F3' },
  tagText: { color: '#333', fontWeight: '500', fontSize: normalize(13) },
  activeTagText: { color: 'white' }, // Text color for active tags
  clearButton: { color: '#2196F3', textAlign: 'center', marginTop: normalize(15), padding: normalize(5), fontSize: normalize(14) },
});
