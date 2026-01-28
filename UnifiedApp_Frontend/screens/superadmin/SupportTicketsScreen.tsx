import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import supportTicketService, { SupportTicket } from '../../services/supportTicketService';
import websocketService from '../../services/websocketService';

const SupportTicketsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED'>('ALL');

  useEffect(() => {
    loadTickets();
    setupWebSocket();

    return () => {
      websocketService.disconnect();
    };
  }, [filter]);

  const setupWebSocket = () => {
    websocketService.connect();
    
    websocketService.on('ticket_update', (data: any) => {
      console.log('Ticket update received:', data);
      loadTickets();
    });

    websocketService.on('connection', (data: any) => {
      console.log('WebSocket connection status:', data.status);
    });
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      let data: SupportTicket[];
      
      if (filter === 'ALL') {
        data = await supportTicketService.getAllTickets();
      } else {
        data = await supportTicketService.getTicketsByStatus(filter);
      }
      
      setTickets(data);
    } catch (error) {
      console.error('Error loading tickets:', error);
      Alert.alert('Error', 'Failed to load tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '#3498db';
      case 'IN_PROGRESS':
        return '#f39c12';
      case 'CLOSED':
        return '#27ae60';
      default:
        return '#7f8c8d';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return '#e74c3c';
      case 'HIGH':
        return '#e67e22';
      case 'MEDIUM':
        return '#f39c12';
      case 'LOW':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const renderTicketItem = ({ item }: { item: SupportTicket }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => (navigation as any).navigate('TicketDetailEnhanced', { ticketId: item.id })}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketSubject} numberOfLines={1}>
          {item.subject || 'No Subject'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status || 'OPEN'}</Text>
        </View>
      </View>
      
      <Text style={styles.ticketDescription} numberOfLines={2}>
        {item.description || 'No Description'}
      </Text>
      
      {/* New Info Section */}
      <View style={styles.ticketInfoSection}>
        {item.raisedByName && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Raised By: </Text>
            <Text style={styles.infoValue}>{item.raisedByName}</Text>
          </View>
        )}
        {item.hubRegion && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hub Region: </Text>
            <Text style={styles.infoValue}>{item.hubRegion}</Text>
          </View>
        )}
        {item.userId && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID: </Text>
            <Text style={styles.infoValue}>{item.userId}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.ticketFooter}>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.priorityText}>{item.priority || 'LOW'}</Text>
        </View>
        <Text style={styles.ticketCategory}>{item.category || 'General'}</Text>
        <Text style={styles.ticketDate}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (label: string, value: typeof filter) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterButtonText, filter === value && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Support Tickets</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => (navigation as any).navigate('CreateTicket')}
        >
          <Text style={styles.createButtonText}>+ New Ticket</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('All', 'ALL')}
        {renderFilterButton('Open', 'OPEN')}
        {renderFilterButton('In Progress', 'IN_PROGRESS')}
        {renderFilterButton('Closed', 'CLOSED')}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicketItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tickets found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  createButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#3498db',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  ticketCard: {
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
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
    lineHeight: 20,
  },
  ticketInfoSection: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5a6c7d',
  },
  infoValue: {
    fontSize: 12,
    color: '#2c3e50',
    flex: 1,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  ticketCategory: {
    fontSize: 12,
    color: '#95a5a6',
    flex: 1,
    marginLeft: 8,
  },
  ticketDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
  },
});

export default SupportTicketsScreen;
