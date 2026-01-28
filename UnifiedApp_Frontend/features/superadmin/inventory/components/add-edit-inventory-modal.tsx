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
import { createInventoryItem, updateInventoryItem } from '../api';
import { InventoryItem, InventoryItemCreateRequest, InventoryItemUpdateRequest } from '../types';

interface AddEditInventoryModalProps {
  visible: boolean;
  hubId: string;
  item?: InventoryItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEditInventoryModal({
  visible,
  hubId,
  item,
  onClose,
  onSuccess,
}: AddEditInventoryModalProps) {
  const isEdit = !!item;
  const [loading, setLoading] = useState(false);

  // Form state
  const [sku, setSku] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [unit, setUnit] = useState('units');

  useEffect(() => {
    if (item) {
      setSku(item.sku);
      setProductName(item.productName);
      setQuantity(item.quantity.toString());
      setReorderLevel(item.reorderLevel.toString());
      setDescription(item.description || '');
      setUnitPrice(item.unitPrice?.toString() || '');
      setUnit(item.unit || 'units');
    } else {
      resetForm();
    }
  }, [item]);

  const resetForm = () => {
    setSku('');
    setProductName('');
    setQuantity('0');
    setReorderLevel('10');
    setDescription('');
    setUnitPrice('');
    setUnit('units');
  };

  const validateForm = () => {
    if (!sku.trim() && !isEdit) {
      Alert.alert('Error', 'SKU is required');
      return false;
    }
    if (!productName.trim()) {
      Alert.alert('Error', 'Product name is required');
      return false;
    }
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) < 0) {
      Alert.alert('Error', 'Please enter a valid quantity (0 or greater)');
      return false;
    }
    if (!reorderLevel.trim() || isNaN(Number(reorderLevel)) || Number(reorderLevel) < 0) {
      Alert.alert('Error', 'Please enter a valid reorder level (0 or greater)');
      return false;
    }
    if (unitPrice && (isNaN(Number(unitPrice)) || Number(unitPrice) < 0)) {
      Alert.alert('Error', 'Please enter a valid unit price');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEdit && item) {
        const updateRequest: InventoryItemUpdateRequest = {
          productName: productName.trim(),
          quantity: Number(quantity),
          reorderLevel: Number(reorderLevel),
          description: description.trim() || undefined,
          unitPrice: unitPrice ? Number(unitPrice) : undefined,
          unit: unit.trim() || undefined,
        };
        await updateInventoryItem(hubId, item.id, updateRequest);
      } else {
        const createRequest: InventoryItemCreateRequest = {
          sku: sku.trim(),
          productName: productName.trim(),
          quantity: Number(quantity),
          reorderLevel: Number(reorderLevel),
          description: description.trim() || undefined,
          unitPrice: unitPrice ? Number(unitPrice) : undefined,
          unit: unit.trim() || undefined,
        };
        await createInventoryItem(hubId, createRequest);
      }

      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save inventory item');
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.title}>{isEdit ? 'Edit Item' : 'Add Item'}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Form */}
        <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
          {/* SKU */}
          {!isEdit && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                SKU <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={sku}
                onChangeText={setSku}
                placeholder="e.g. SKU-0001"
                autoCapitalize="characters"
              />
            </View>
          )}

          {/* Product Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Product Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={productName}
              onChangeText={setProductName}
              placeholder="e.g. Laptop Dell XPS 15"
            />
          </View>

          {/* Quantity & Reorder Level */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>
                Quantity <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>
                Reorder Level <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={reorderLevel}
                onChangeText={setReorderLevel}
                placeholder="10"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Unit Price & Unit */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Unit Price</Text>
              <TextInput
                style={styles.input}
                value={unitPrice}
                onChangeText={setUnitPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Unit</Text>
              <TextInput
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
                placeholder="units"
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>{isEdit ? 'Update' : 'Add Item'}</Text>
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
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
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
    height: 100,
    paddingTop: 12,
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
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
