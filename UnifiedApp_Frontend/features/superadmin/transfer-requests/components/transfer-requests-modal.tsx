import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { transferRequestsApi } from '../api';
import { TransferRequest, TransferStatus } from '../types';

interface TransferRequestsModalProps {
  visible: boolean;
  onClose: () => void;
}

const palette = {
  background: '#F7F3ED',
  card: '#FFFFFF',
  accent: '#F5C84C',
  accentDark: '#E2A537',
  textPrimary: '#1E1407',
  textSecondary: '#70614F',
  border: '#E8E1D7',
  statusPending: '#F59E0B',
  statusApproved: '#10B981',
  statusRejected: '#EF4444',
};

export function TransferRequestsModal({ visible, onClose }: TransferRequestsModalProps) {
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<TransferStatus | 'ALL'>('PENDING');

  useEffect(() => {
    if (visible) {
      loadRequests();
    }
  }, [visible, filter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const status = filter === 'ALL' ? undefined : filter;
      const response = await transferRequestsApi.getTransferRequests(status);
      setRequests(response.content);
    } catch (error) {
      console.error('Failed to load transfer requests:', error);
      Alert.alert('Error', 'Failed to load transfer requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: TransferRequest) => {
    Alert.alert(
      'Approve Transfer',
      `Approve transfer of ${request.quantity} ${request.itemName} from ${request.sourceHubName} to ${request.destinationHubName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => processRequest(request.id, 'APPROVED'),
        },
      ]
    );
  };

  const handleReject = async (request: TransferRequest) => {
    Alert.alert(
      'Reject Transfer',
      `Reject transfer of ${request.quantity} ${request.itemName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => processRequest(request.id, 'REJECTED'),
        },
      ]
    );
  };

  const processRequest = async (requestId: string, decision: 'APPROVED' | 'REJECTED') => {
    setProcessing(requestId);
    try {
      await transferRequestsApi.processTransferRequest(requestId, {
        decision,
        approvedBy: 'Current User', // In real app, get from auth context
        notes: decision === 'APPROVED' ? 'Approved by admin' : 'Rejected by admin',
      });
      
      Alert.alert('Success', `Transfer request ${decision.toLowerCase()} successfully`);
      loadRequests();
    } catch (error) {
      console.error('Failed to process request:', error);
      Alert.alert('Error', 'Failed to process transfer request');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: TransferStatus) => {
    switch (status) {
      case 'PENDING': return palette.statusPending;
      case 'APPROVED': return palette.statusApproved;
      case 'REJECTED': return palette.statusRejected;
      default: return palette.textSecondary;
    }
  };

  const renderRequest = ({ item }: { item: TransferRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestId}>{item.requestId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.requestDetails}>
        <Text style={styles.itemName}>{item.itemName} (SKU: {item.sku})</Text>
        <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
        <Text style={styles.hubInfo}>
          From: {item.sourceHubName} → To: {item.destinationHubName}
        </Text>
        <Text style={styles.requestedBy}>Requested by: {item.requestedBy}</Text>
      </View>

      {item.status === 'PENDING' && (
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(item)}
            disabled={processing === item.id}
          >
            {processing === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Feather name="check" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Approve</Text>
              </>
            )}
          </Pressable>
          
          <Pressable
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(item)}
            disabled={processing === item.id}
          >
            <Feather name="x" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Transfer Requests</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={palette.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.filters}>
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
              <Pressable
                key={status}
                style={[
                  styles.filterButton,
                  filter === status && styles.filterButtonActive,
                ]}
                onPress={() => setFilter(status)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === status && styles.filterButtonTextActive,
                  ]}
                >
                  {status}
                </Text>
              </Pressable>
            ))}
          </View>

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={palette.accent} />
              <Text style={styles.loadingText}>Loading requests...</Text>
            </View>
          ) : (
            <FlatList
              data={requests}
              keyExtractor={(item) => item.id}
              renderItem={renderRequest}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>No transfer requests found</Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: palette.card,
    borderRadius: 16,
    maxHeight: '90%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
  },
  filterButtonActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  filterButtonText: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: palette.textSecondary,
  },
  list: {
    padding: 16,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: palette.textSecondary,
    fontSize: 16,
  },
  requestCard: {
    backgroundColor: palette.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestId: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  requestDetails: {
    gap: 4,
    marginBottom: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: palette.textPrimary,
  },
  quantity: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  hubInfo: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  requestedBy: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: palette.statusApproved,
  },
  rejectButton: {
    backgroundColor: palette.statusRejected,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});