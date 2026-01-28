import { MaterialIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import AdminTabSwitcher from '../../components/superadmin/AdminTabSwitcher';
import Button from '../../components/superadmin/Button';
import { API_BASE_URL } from '../../config.ts';
import { normalize, wp } from '../../utils/responsive';

type HubStockInfo = {
  hubId: string;
  hubName: string;
  hubLocation: string;
  quantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
};

type StockSyncData = {
  productId: number;
  productName: string;
  totalStock: number;
  hubStocks: HubStockInfo[];
  lowStockWarnings: string[];
  syncedAt: string;
};

export default function StockSyncScreen({ navigation }: { navigation: any }) {
  const route = useRoute();
  const { productId } = route.params as { productId: number };

  const [stockData, setStockData] = useState<StockSyncData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncStock = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/stock-sync`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to sync stock');
      }

      const data = await response.json();
      setStockData(data);
      
      if (data.lowStockWarnings && data.lowStockWarnings.length > 0) {
        Alert.alert(
          'Low Stock Warning',
          data.lowStockWarnings.join('\n'),
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Success', 'Stock synchronized successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sync stock. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncStock();
  }, []);

  const renderHubStock = ({ item }: { item: HubStockInfo }) => (
    <View style={[styles.hubCard, item.isLowStock && styles.lowStockCard]}>
      <View style={styles.hubHeader}>
        <View style={styles.hubInfo}>
          <Text style={styles.hubName}>{item.hubName}</Text>
          <Text style={styles.hubLocation}>{item.hubLocation}</Text>
        </View>
        {item.isLowStock && (
          <View style={styles.warningBadge}>
            <MaterialIcons name="warning" size={16} color="#fff" />
            <Text style={styles.warningText}>LOW</Text>
          </View>
        )}
      </View>
      <View style={styles.stockInfo}>
        <View style={styles.stockItem}>
          <Text style={styles.stockLabel}>Current Stock</Text>
          <Text style={[styles.stockValue, item.isLowStock && styles.lowStockValue]}>
            {item.quantity} units
          </Text>
        </View>
        <View style={styles.stockItem}>
          <Text style={styles.stockLabel}>Threshold</Text>
          <Text style={styles.stockValue}>{item.lowStockThreshold} units</Text>
        </View>
      </View>
    </View>
  );

  if (isLoading && !stockData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading stock data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stock Synchronization</Text>
      </View>

      {stockData && (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.productName}>{stockData.productName}</Text>
            <View style={styles.totalStockContainer}>
              <Text style={styles.totalStockLabel}>Total Stock Across All Hubs</Text>
              <Text style={styles.totalStockValue}>{stockData.totalStock} units</Text>
            </View>
            <Text style={styles.syncTime}>
              Last synced: {new Date(stockData.syncedAt).toLocaleString()}
            </Text>
          </View>

          {stockData.lowStockWarnings.length > 0 && (
            <View style={styles.warningContainer}>
              <View style={styles.warningHeader}>
                <MaterialIcons name="warning" size={20} color="#FFA000" />
                <Text style={styles.warningTitle}>Low Stock Alerts</Text>
              </View>
              {stockData.lowStockWarnings.map((warning, index) => (
                <Text key={index} style={styles.warningMessage}>• {warning}</Text>
              ))}
            </View>
          )}

          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Hub Inventory</Text>
            <TouchableOpacity onPress={syncStock} disabled={isSyncing}>
              <MaterialIcons name="refresh" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={stockData.hubStocks}
            keyExtractor={(item) => item.hubId}
            renderItem={renderHubStock}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isSyncing} onRefresh={syncStock} />
            }
          />
        </>
      )}

      <View style={styles.footer}>
        <Button
          title={isSyncing ? "Syncing..." : "Sync Now"}
          onPress={syncStock}
          disabled={isSyncing}
          style={styles.syncButton}
        />
      </View>
      <AdminTabSwitcher />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: normalize(10), color: '#757575', fontSize: normalize(14) },
  header: {
    padding: normalize(16),
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: { marginRight: normalize(15), padding: normalize(8) },
  headerTitle: { fontSize: normalize(18), fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center', marginRight: normalize(40) },
  summaryCard: {
    backgroundColor: 'white',
    margin: wp(4),
    padding: normalize(20),
    borderRadius: normalize(12),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  productName: { fontSize: normalize(18), fontWeight: 'bold', color: '#212121', marginBottom: normalize(15) },
  totalStockContainer: { alignItems: 'center', paddingVertical: normalize(15) },
  totalStockLabel: { fontSize: normalize(14), color: '#757575', marginBottom: normalize(5) },
  totalStockValue: { fontSize: normalize(32), fontWeight: 'bold', color: '#4CAF50' },
  syncTime: { fontSize: normalize(12), color: '#BDBDBD', textAlign: 'center', marginTop: normalize(10) },
  warningContainer: {
    backgroundColor: '#FFF3E0',
    margin: wp(4),
    marginTop: 0,
    padding: normalize(16),
    borderRadius: normalize(12),
    borderLeftWidth: 4,
    borderLeftColor: '#FFA000'
  },
  warningHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: normalize(10) },
  warningTitle: { fontSize: normalize(16), fontWeight: 'bold', color: '#FFA000', marginLeft: normalize(8) },
  warningMessage: { fontSize: normalize(14), color: '#757575', marginVertical: normalize(2) },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: normalize(12)
  },
  listTitle: { fontSize: normalize(16), fontWeight: 'bold', color: '#212121' },
  listContent: { paddingHorizontal: wp(4), paddingBottom: normalize(100) },
  hubCard: {
    backgroundColor: 'white',
    padding: normalize(16),
    borderRadius: normalize(12),
    marginBottom: normalize(12),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  lowStockCard: { borderLeftWidth: 4, borderLeftColor: '#D32F2F' },
  hubHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: normalize(12) },
  hubInfo: { flex: 1 },
  hubName: { fontSize: normalize(16), fontWeight: 'bold', color: '#212121' },
  hubLocation: { fontSize: normalize(14), color: '#757575', marginTop: normalize(4) },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA000',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(12),
    gap: normalize(4)
  },
  warningText: { color: 'white', fontSize: normalize(10), fontWeight: 'bold' },
  stockInfo: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: normalize(8) },
  stockItem: { alignItems: 'center' },
  stockLabel: { fontSize: normalize(12), color: '#757575', marginBottom: normalize(4) },
  stockValue: { fontSize: normalize(16), fontWeight: 'bold', color: '#212121' },
  lowStockValue: { color: '#D32F2F' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: normalize(16),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  syncButton: { width: '100%', backgroundColor: '#FFC107' }
});
