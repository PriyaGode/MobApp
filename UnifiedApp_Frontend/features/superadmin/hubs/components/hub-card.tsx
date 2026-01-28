import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getInventoryByHub } from '../../inventory/api';
import { HubStatus, HubSummary } from '../types';

interface HubCardProps {
  hub: HubSummary;
  onEdit: (hub: HubSummary) => void;
  onToggleStatus: (hub: HubSummary) => void;
  onPress: (hub: HubSummary) => void;
  onViewInventory: (hub: HubSummary) => void;
}

export default function HubCard({
  hub,
  onEdit,
  onToggleStatus,
  onPress,
  onViewInventory,
}: HubCardProps) {
  const isActive = hub.status === HubStatus.ACTIVE;
  const [inventoryCount, setInventoryCount] = useState<number | null>(null);
  const [loadingInventory, setLoadingInventory] = useState(false);

  useEffect(() => {
    loadInventoryCount();
  }, [hub.id]);

  const loadInventoryCount = async () => {
    try {
      setLoadingInventory(true);
      const items = await getInventoryByHub(hub.id);
      setInventoryCount(items.length);
    } catch (error) {
      // Silently fail - just don't show inventory count
      console.log(`Could not load inventory count for hub ${hub.name}:`, error);
      setInventoryCount(0);
    } finally {
      setLoadingInventory(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, !isActive && styles.cardInactive]}
      onPress={() => onPress(hub)}
      activeOpacity={0.7}
    >
      {/* Header with Hub Name and Status Badge */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.hubName}>{hub.name}</Text>
          <View style={styles.headerBadges}>
            <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeInactive]}>
              <Text style={[styles.badgeText, isActive ? styles.badgeTextActive : styles.badgeTextInactive]}>
                {hub.status}
              </Text>
            </View>
            {loadingInventory ? (
              <ActivityIndicator size="small" color="#007AFF" style={styles.inventoryBadge} />
            ) : inventoryCount !== null ? (
              <View style={styles.inventoryBadge}>
                <Ionicons name="cube-outline" size={14} color="#007AFF" />
                <Text style={styles.inventoryCount}>{inventoryCount}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Hub Code */}
      <View style={styles.row}>
        <Ionicons name="pricetag-outline" size={16} color="#666" />
        <Text style={styles.label}>Hub ID: </Text>
        <Text style={styles.value}>{hub.code}</Text>
      </View>

      {/* Location */}
      <View style={styles.row}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.value}>{hub.location}</Text>
      </View>

      {/* City/Region */}
      {hub.city && (
        <View style={styles.row}>
          <Ionicons name="business-outline" size={16} color="#666" />
          <Text style={styles.value}>
            {hub.city}{hub.region ? `, ${hub.region}` : ''}
          </Text>
        </View>
      )}

      {/* Contact Info */}
      {(hub.contactName || hub.contactPhone || hub.contactEmail) && (
        <View style={styles.contactSection}>
          {hub.contactName && (
            <View style={styles.row}>
              <Ionicons name="person-outline" size={16} color="#666" />
              <Text style={styles.value}>{hub.contactName}</Text>
            </View>
          )}
          {hub.contactPhone && (
            <View style={styles.row}>
              <Ionicons name="call-outline" size={16} color="#666" />
              <Text style={styles.value}>{hub.contactPhone}</Text>
            </View>
          )}
          {hub.contactEmail && (
            <View style={styles.row}>
              <Ionicons name="mail-outline" size={16} color="#666" />
              <Text style={styles.value}>{hub.contactEmail}</Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.statusToggle}>
          <Text style={styles.toggleLabel}>Active</Text>
          <Switch
            value={isActive}
            onValueChange={() => onToggleStatus(hub)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isActive ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              console.log('🔵 HubCard: Inventory button clicked for hub:', hub.name);
              onViewInventory(hub);
              console.log('🔵 onViewInventory called');
            }}
          >
            <Ionicons name="cube-outline" size={20} color="#10b981" />
            <Text style={[styles.actionButtonText, { color: '#10b981' }]}>Inventory</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onEdit(hub);
            }}
          >
            <Ionicons name="create-outline" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardInactive: {
    opacity: 0.7,
    backgroundColor: '#f9f9f9',
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hubName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inventoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e6f2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inventoryCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  badgeActive: {
    backgroundColor: '#e8f5e9',
  },
  badgeInactive: {
    backgroundColor: '#ffebee',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextActive: {
    color: '#2e7d32',
  },
  badgeTextInactive: {
    color: '#c62828',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  value: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  contactSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
});
