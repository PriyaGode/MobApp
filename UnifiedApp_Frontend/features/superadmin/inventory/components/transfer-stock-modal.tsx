import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { fetchHubs } from '../../hubs/api';
import { HubSummary } from '../../hubs/types';
import { transferStock } from '../api';
import { InventoryItem, StockTransferRequest } from '../types';

interface TransferStockModalProps {
  visible: boolean;
  item: InventoryItem | null;
  sourceHubId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransferStockModal({
  visible,
  item,
  sourceHubId,
  onClose,
  onSuccess,
}: TransferStockModalProps) {
  const [loading, setLoading] = useState(false);
  const [hubs, setHubs] = useState<HubSummary[]>([]);
  const [selectedHubId, setSelectedHubId] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      loadHubs();
      setQuantity('');
      setNotes('');
      setSelectedHubId('');
    }
  }, [visible]);

  const loadHubs = async () => {
    try {
      const data = await fetchHubs();
      // Filter out the source hub
      const availableHubs = data.filter((h: HubSummary) => h.id !== sourceHubId);
      setHubs(availableHubs);
    } catch (error) {
      Alert.alert('Error', 'Failed to load hubs');
    }
  };

  const validateForm = () => {
    if (!selectedHubId) {
      Alert.alert('Error', 'Please select a destination hub');
      return false;
    }
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) < 1) {
      Alert.alert('Error', 'Please enter a valid quantity (at least 1)');
      return false;
    }
    if (item && Number(quantity) > item.quantity) {
      Alert.alert('Error', `Cannot transfer more than available quantity (${item.quantity})`);
      return false;
    }
    return true;
  };

  const handleTransfer = async () => {
    if (!item || !validateForm()) return;

    try {
      setLoading(true);

      const request: StockTransferRequest = {
        sourceHubId,
        destinationHubId: selectedHubId,
        sku: item.sku,
        quantity: Number(quantity),
        notes: notes.trim() || undefined,
      };

      await transferStock(sourceHubId, request);
      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to transfer stock');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Transfer Stock</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
          {/* Item Info */}
          <View style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Ionicons name="cube-outline" size={24} color="#007AFF" />
              <View style={styles.itemInfo}>
                <Text style={styles.sku}>{item.sku}</Text>
                <Text style={styles.productName}>{item.productName}</Text>
              </View>
            </View>
            <View style={styles.availableRow}>
              <Text style={styles.availableLabel}>Available:</Text>
              <Text style={styles.availableValue}>
                {item.quantity} {item.unit || 'units'}
              </Text>
            </View>
          </View>

          {/* Destination Hub */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Destination Hub <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.helper}>Select where to transfer this item</Text>

            {hubs.length === 0 ? (
              <View style={styles.noHubsContainer}>
                <Text style={styles.noHubsText}>No other hubs available</Text>
              </View>
            ) : (
              <View style={styles.hubList}>
                {hubs.map(hub => (
                  <TouchableOpacity
                    key={hub.id}
                    style={[
                      styles.hubItem,
                      selectedHubId === hub.id && styles.hubItemSelected,
                    ]}
                    onPress={() => setSelectedHubId(hub.id)}
                  >
                    <View style={styles.hubItemContent}>
                      <Text
                        style={[
                          styles.hubName,
                          selectedHubId === hub.id && styles.hubNameSelected,
                        ]}
                      >
                        {hub.name}
                      </Text>
                      <Text style={styles.hubLocation}>{hub.location}</Text>
                    </View>
                    {selectedHubId === hub.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Quantity */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Quantity to Transfer <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder={`Max: ${item.quantity}`}
              keyboardType="numeric"
            />
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about this transfer..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Transfer Summary */}
          {quantity && selectedHubId && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Transfer Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>From:</Text>
                <Text style={styles.summaryValue}>{item.hubName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>To:</Text>
                <Text style={styles.summaryValue}>
                  {hubs.find(h => h.id === selectedHubId)?.name}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Item:</Text>
                <Text style={styles.summaryValue}>{item.productName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Quantity:</Text>
                <Text style={[styles.summaryValue, styles.summaryHighlight]}>
                  {quantity} {item.unit || 'units'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Remaining:</Text>
                <Text style={styles.summaryValue}>
                  {item.quantity - Number(quantity)} {item.unit || 'units'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.transferButton, loading && styles.transferButtonDisabled]}
            onPress={handleTransfer}
            disabled={loading || hubs.length === 0}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="swap-horizontal" size={20} color="#fff" />
                <Text style={styles.transferButtonText}>Transfer</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 36,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  sku: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  availableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  availableLabel: {
    fontSize: 14,
    color: '#666',
  },
  availableValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  required: {
    color: '#dc2626',
  },
  helper: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  hubList: {
    gap: 8,
  },
  hubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  hubItemSelected: {
    backgroundColor: '#e6f2ff',
    borderColor: '#007AFF',
  },
  hubItemContent: {
    flex: 1,
  },
  hubName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  hubNameSelected: {
    color: '#007AFF',
  },
  hubLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  noHubsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noHubsText: {
    fontSize: 14,
    color: '#999',
  },
  summaryCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryHighlight: {
    color: '#007AFF',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  transferButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  transferButtonDisabled: {
    opacity: 0.6,
  },
  transferButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
