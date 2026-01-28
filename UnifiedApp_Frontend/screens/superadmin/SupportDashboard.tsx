import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddNoteModal from '../../components/superadmin/AddNoteModal';
import AssignTicketModal from '../../components/superadmin/AssignTicketModal';
import AttachmentUploadModal from '../../components/superadmin/AttachmentUploadModal';
import supportTicketService, {
    DashboardStats,
    SupportTicket,
    TicketFilters
} from '../../services/supportTicketService';
// Temporarily disabled WebSocket due to transformer error - using polling instead
// import websocketService from '../../services/websocketService';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = -100;

// Helper function to format "Created By" display
const formatCreatedBy = (ticket: SupportTicket): string => {
  const name = ticket.raisedByName || ticket.userId;
  const role = ticket.raisedByRole;
  const location = ticket.raisedByLocation;

  if (!role) {
    return name;
  }

  // Format role display
  let roleDisplay = '';
  switch (role) {
    case 'CUSTOMER':
      roleDisplay = 'Customer';
      break;
    case 'HUB_AGENT':
      roleDisplay = 'Hub Agent';
      break;
    case 'DELIVERY_AGENT':
      roleDisplay = 'Delivery Agent';
      break;
    case 'SUPER_ADMIN':
      roleDisplay = 'Super Admin';
      break;
    default:
      roleDisplay = role;
  }

  // Add location if available (for Hub Agents)
  if (location && role === 'HUB_AGENT') {
    return `${name} (${roleDisplay} - ${location})`;
  } else if (location) {
    return `${name} (${roleDisplay} - ${location})`;
  } else {
    return `${name} (${roleDisplay})`;
  }
};

interface SwipeableTicketProps {
  ticket: SupportTicket;
  onAssign: (ticket: SupportTicket) => void;
  onClose: (ticket: SupportTicket) => void;
  onAddNote: (ticket: SupportTicket) => void;
  onAttachment: (ticket: SupportTicket) => void;
  onPress: (ticket: SupportTicket) => void;
}

const SwipeableTicket: React.FC<SwipeableTicketProps> = ({
  ticket,
  onAssign,
  onClose,
  onAddNote,
  onAttachment,
  onPress,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const panStartX = useRef(0);

  const handlePanStart = (evt: any) => {
    panStartX.current = evt.nativeEvent.pageX;
  };

  const handlePanMove = (evt: any) => {
    const currentX = evt.nativeEvent.pageX;
    const diffX = currentX - panStartX.current;
    
    if (diffX < 0) {
      translateX.setValue(Math.max(diffX, -200));
    }
  };

  const handlePanEnd = () => {
    const currentTranslateX = (translateX as any)._value;
    
    if (currentTranslateX < SWIPE_THRESHOLD) {
      Animated.spring(translateX, {
        toValue: -180,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const resetSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return '#dc2626';
      case 'HIGH':
        return '#dc2626';
      case 'MEDIUM':
        return '#f97316';
      case 'LOW':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return '🟥';
      case 'HIGH':
        return '🟥';
      case 'MEDIUM':
        return '🟧';
      case 'LOW':
        return '🟩';
      default:
        return '⚪';
    }
  };

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
          onPress={() => {
            resetSwipe();
            onAssign(ticket);
          }}
        >
          <Ionicons name="person-add" size={24} color="#fff" />
          <Text style={styles.actionText}>Assign</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#22c55e' }]}
          onPress={() => {
            resetSwipe();
            onClose(ticket);
          }}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.actionText}>Close</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
          onPress={() => {
            resetSwipe();
            onAddNote(ticket);
          }}
        >
          <Ionicons name="create" size={24} color="#fff" />
          <Text style={styles.actionText}>Note</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.ticketCard,
          { transform: [{ translateX }] },
        ]}
        onTouchStart={handlePanStart}
        onTouchMove={handlePanMove}
        onTouchEnd={handlePanEnd}
      >
        <TouchableOpacity onPress={() => onPress(ticket)} activeOpacity={0.7}>
          <View style={styles.ticketHeader}>
            <View style={styles.ticketHeaderLeft}>
              <Text style={styles.ticketId}>#{ticket.id}</Text>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(ticket.priority || 'LOW') + '20' },
                ]}
              >
                <Text style={styles.priorityEmoji}>{getPriorityEmoji(ticket.priority || 'LOW')}</Text>
                <Text style={[styles.priorityText, { color: getPriorityColor(ticket.priority || 'LOW') }]}>
                  {ticket.priority || 'LOW'}
                </Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status || 'OPEN') }]}>
              <Text style={styles.statusText}>{(ticket.status || 'OPEN').replace('_', ' ')}</Text>
            </View>
          </View>

          <Text style={styles.ticketSubject} numberOfLines={1}>
            {ticket.subject || 'No Subject'}
          </Text>

          <View style={styles.ticketDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={14} color="#6b7280" />
              <Text style={styles.detailText}>
                {formatCreatedBy(ticket)}
              </Text>
            </View>

            {ticket.assignedTo && (
              <View style={styles.detailRow}>
                <Ionicons name="person-circle-outline" size={14} color="#6b7280" />
                <Text style={styles.detailText}>Assigned to: {ticket.assignedTo}</Text>
              </View>
            )}

            {ticket.hubRegion && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={14} color="#6b7280" />
                <Text style={styles.detailText}>{ticket.hubRegion}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={14} color="#6b7280" />
              <Text style={styles.detailText}>
                {new Date(ticket.createdAt || '').toLocaleDateString()}
              </Text>
            </View>

            {(ticket.notes || ticket.attachments) && (
              <View style={styles.detailRow}>
                <Ionicons name="attach-outline" size={14} color="#3b82f6" />
                <Text style={[styles.detailText, { color: '#3b82f6' }]}>Has attachments</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN':
      return '#3b82f6';
    case 'IN_PROGRESS':
      return '#f59e0b';
    case 'CLOSED':
      return '#22c55e';
    default:
      return '#6b7280';
  }
};

const SupportDashboard: React.FC = () => {
  const navigation = useNavigation();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ open: 0, inProgress: 0, closed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const [filters, setFilters] = useState<TicketFilters>({
    sort: 'newest',
  });

  const wsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadData();
    // setupWebSocket(); // Disabled due to transformer error - using polling below

    // Polling interval for updates (every 30 seconds)
    wsIntervalRef.current = setInterval(() => {
      loadData();
    }, 30000);

    return () => {
      if (wsIntervalRef.current) {
        clearInterval(wsIntervalRef.current);
      }
      // websocketService.disconnect(); // Disabled
    };
  }, [filters]);

  /* Temporarily disabled WebSocket functionality
  const setupWebSocket = () => {
    websocketService.connect();

    websocketService.on('ticket_update', (data: any) => {
      console.log('Ticket update received:', data);
      loadData();
    });

    wsIntervalRef.current = setInterval(() => {
      loadData();
    }, 2 * 60 * 1000);
  };
  */

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, statsData] = await Promise.all([
        supportTicketService.getFilteredTickets(filters),
        supportTicketService.getDashboardStats(),
      ]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAssign = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowAssignModal(true);
  };

  const handleClose = async (ticket: SupportTicket) => {
    Alert.alert(
      'Close Ticket',
      `Are you sure you want to close ticket #${ticket.id}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          onPress: async () => {
            try {
              await supportTicketService.updateTicketStatus(ticket.id!, 'CLOSED');
              Alert.alert('Success', 'Ticket closed successfully');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to close ticket');
            }
          },
        },
      ]
    );
  };

  const handleAddNote = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowNoteModal(true);
  };

  const handleAttachment = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowAttachmentModal(true);
  };

  const handleTicketPress = (ticket: SupportTicket) => {
    (navigation as any).navigate('TicketDetailEnhanced', { ticketId: ticket.id });
  };

  const handleAssignSuccess = () => {
    setShowAssignModal(false);
    setSelectedTicket(null);
    loadData();
  };

  const handleNoteSuccess = () => {
    setShowNoteModal(false);
    setSelectedTicket(null);
    loadData();
  };

  const handleAttachmentSuccess = () => {
    setShowAttachmentModal(false);
    setSelectedTicket(null);
    loadData();
  };

  const clearFilters = () => {
    setFilters({ sort: 'newest' });
  };

  const renderStatCard = (
    label: string, 
    count: number, 
    color: string, 
    onPress: () => void,
    statusFilter?: string
  ) => {
    // Check if this card is currently active
    const isActive = statusFilter === undefined 
      ? !filters.status  // "Total" card is active when no status filter
      : filters.status === statusFilter;  // Other cards match their status filter
    
    return (
      <TouchableOpacity 
        style={[
          styles.statCard,
          isActive && styles.statCardActive
        ]} 
        onPress={onPress}
      >
        <View style={[
          styles.statIconContainer,
          isActive && { backgroundColor: color + '20' }
        ]}>
          <View style={[
            styles.statIndicator,
            isActive && { backgroundColor: color }
          ]} />
        </View>
        <Text style={[
          styles.statCount, 
          { color },
          isActive && styles.statCountActive
        ]}>
          {count}
        </Text>
        <Text style={[
          styles.statLabel,
          isActive && styles.statLabelActive
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && tickets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Support Dashboard</Text>
        <TouchableOpacity
          style={styles.newTicketButton}
          onPress={() => (navigation as any).navigate('CreateTicket')}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.newTicketText}>New Ticket</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        {renderStatCard('Open', stats.open, '#3b82f6', () =>
          setFilters({ ...filters, status: 'OPEN' }), 'OPEN'
        )}
        {renderStatCard('In Progress', stats.inProgress, '#f59e0b', () =>
          setFilters({ ...filters, status: 'IN_PROGRESS' }), 'IN_PROGRESS'
        )}
        {renderStatCard('Closed', stats.closed, '#22c55e', () =>
          setFilters({ ...filters, status: 'CLOSED' }), 'CLOSED'
        )}
        {renderStatCard('Total', stats.total, '#6b7280', () => clearFilters())}
      </View>

      <View style={styles.filtersBar}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color="#3b82f6" />
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>

        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              filters.sort === 'newest' && styles.sortButtonActive,
            ]}
            onPress={() => setFilters({ ...filters, sort: 'newest' })}
          >
            <Text
              style={[
                styles.sortButtonText,
                filters.sort === 'newest' && styles.sortButtonTextActive,
              ]}
            >
              Newest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortButton,
              filters.sort === 'priority' && styles.sortButtonActive,
            ]}
            onPress={() => setFilters({ ...filters, sort: 'priority' })}
          >
            <Text
              style={[
                styles.sortButtonText,
                filters.sort === 'priority' && styles.sortButtonTextActive,
              ]}
            >
              Priority
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortButton,
              filters.sort === 'oldest' && styles.sortButtonActive,
            ]}
            onPress={() => setFilters({ ...filters, sort: 'oldest' })}
          >
            <Text
              style={[
                styles.sortButtonText,
                filters.sort === 'oldest' && styles.sortButtonTextActive,
              ]}
            >
              Oldest
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showFilters && (
        <View style={styles.filterOptions}>
          <Text style={styles.filterTitle}>Status</Text>
          <View style={styles.filterRow}>
            {['OPEN', 'IN_PROGRESS', 'CLOSED'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  filters.status === status && styles.filterChipActive,
                ]}
                onPress={() =>
                  setFilters({
                    ...filters,
                    status: filters.status === status ? undefined : status,
                  })
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters.status === status && styles.filterChipTextActive,
                  ]}
                >
                  {status.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterTitle}>Priority</Text>
          <View style={styles.filterRow}>
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.filterChip,
                  filters.priority === priority && styles.filterChipActive,
                ]}
                onPress={() =>
                  setFilters({
                    ...filters,
                    priority: filters.priority === priority ? undefined : priority,
                  })
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters.priority === priority && styles.filterChipTextActive,
                  ]}
                >
                  {priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={tickets}
        keyExtractor={(item) => (item.id ? item.id.toString() : `ticket-${Math.random()}`)}
        renderItem={({ item }) => (
          <SwipeableTicket
            ticket={item}
            onAssign={handleAssign}
            onClose={handleClose}
            onAddNote={handleAddNote}
            onAttachment={handleAttachment}
            onPress={handleTicketPress}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="ticket-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No tickets found</Text>
            <Text style={styles.emptySubtext}>
              {filters.status || filters.priority
                ? 'Try adjusting your filters'
                : 'Create a new ticket to get started'}
            </Text>
          </View>
        }
      />

      <AssignTicketModal
        visible={showAssignModal}
        ticket={selectedTicket}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedTicket(null);
        }}
        onSuccess={handleAssignSuccess}
      />

      <AddNoteModal
        visible={showNoteModal}
        ticket={selectedTicket}
        onClose={() => {
          setShowNoteModal(false);
          setSelectedTicket(null);
        }}
        onSuccess={handleNoteSuccess}
      />

      <AttachmentUploadModal
        visible={showAttachmentModal}
        ticket={selectedTicket}
        onClose={() => {
          setShowAttachmentModal(false);
          setSelectedTicket(null);
        }}
        onSuccess={handleAttachmentSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  newTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newTicketText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statCardActive: {
    backgroundColor: '#fff',
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  statIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  statCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statCountActive: {
    fontSize: 26,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  statLabelActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  filtersBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  sortButtons: {
    flexDirection: 'row',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  sortButtonActive: {
    backgroundColor: '#3b82f6',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  sortButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  filterOptions: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 12,
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  clearFiltersButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 16,
  },
  swipeContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    position: 'relative',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 8,
  },
  actionButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  ticketHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  ticketDetails: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 64,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalButtonCancel: {
    backgroundColor: '#f3f4f6',
  },
  modalButtonSubmit: {
    backgroundColor: '#3b82f6',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});

export default SupportDashboard;
