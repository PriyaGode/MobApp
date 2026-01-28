import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import { API_BASE } from '../../services/apiBase';
import { AuthContext } from '../../contexts/AuthContext';
import { useContext } from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'SupportTickets'>;

const filterOptions = ['All Tickets', 'Open', 'Resolved'];

interface Ticket {
  ticketNumber: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

interface TicketDisplay {
  id: string;
  title: string;
  description: string;
  status: string;
  statusColor: string;
  statusBg: string;
  date: string;
  isHighlighted: boolean;
}

export default function SupportTicketsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const [selectedFilter, setSelectedFilter] = useState('All Tickets');
  const [tickets, setTickets] = useState<TicketDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusDisplay = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPEN':
        return { status: 'Open', statusColor: '#2563EB', statusBg: '#DBEAFE' };
      case 'RESOLVED':
        return { status: 'Resolved', statusColor: '#059669', statusBg: '#D1FAE5' };
      case 'IN_PROGRESS':
        return { status: 'Awaiting Reply', statusColor: '#F59E0B', statusBg: '#FEF3C7' };
      default:
        return { status: 'Open', statusColor: '#2563EB', statusBg: '#DBEAFE' };
    }
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const userId = (user?.userId || user?.id)?.toString() || 'customer123';
        console.log('Fetching tickets for user ID:', userId);
        
        const response = await fetch(`${API_BASE}/api/customer/complaints`, {
          method: 'GET',
          headers: {
            'X-User-Id': userId,
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data: Ticket[] = await response.json();
          const transformedTickets: TicketDisplay[] = data.map((ticket, index) => {
            const statusDisplay = getStatusDisplay(ticket.status);
            return {
              id: ticket.ticketNumber,
              title: ticket.subject,
              description: ticket.message,
              ...statusDisplay,
              date: formatDate(ticket.createdAt),
              isHighlighted: index === 0 && ticket.status.toUpperCase() !== 'RESOLVED',
            };
          });
          setTickets(transformedTickets);
        } else {
          throw new Error('Failed to fetch tickets');
        }
      } catch (error: any) {
        console.error('Fetch tickets error:', error);
        setError('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    if (selectedFilter === 'All Tickets') return true;
    return ticket.status === selectedFilter || 
           (selectedFilter === 'Open' && ticket.status !== 'Resolved');
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>My Tickets</Text>
        
        <TouchableOpacity style={styles.headerButton}>
          <Feather name="search" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.filterButtonTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={styles.loadingText}>Loading your tickets...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.emptyContainer}>
            <Feather name="alert-circle" size={48} color="#6B7280" />
            <Text style={styles.emptyTitle}>Unable to load tickets</Text>
            <Text style={styles.emptySubtitle}>Please check your connection and try again</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && filteredTickets.length === 0 && (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color="#6B7280" />
            <Text style={styles.emptyTitle}>No support tickets</Text>
            <Text style={styles.emptySubtitle}>You haven't created any support tickets yet</Text>
          </View>
        )}

        {/* Tickets List */}
        {!loading && !error && filteredTickets.length > 0 && (
          <View style={styles.ticketsList}>
          {filteredTickets.map((ticket) => (
            <TouchableOpacity
              key={ticket.id}
              style={[
                styles.ticketCard,
                ticket.isHighlighted && styles.ticketCardHighlighted
              ]}
              activeOpacity={0.7}
            >
              {ticket.isHighlighted && <View style={styles.highlightBar} />}
              
              <View style={[styles.ticketHeader, ticket.isHighlighted && { paddingLeft: 8 }]}>
                <Text style={styles.ticketId}>{ticket.id}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: ticket.statusBg }
                ]}>
                  {ticket.status === 'Awaiting Reply' && (
                    <View style={styles.pulsingDot} />
                  )}
                  {ticket.status === 'Resolved' && (
                    <Feather name="check" size={10} color={ticket.statusColor} />
                  )}
                  <Text style={[
                    styles.statusText,
                    { color: ticket.statusColor }
                  ]}>
                    {ticket.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={[
                styles.ticketTitle,
                ticket.isHighlighted && { paddingLeft: 8 }
              ]}>
                {ticket.title}
              </Text>
              
              <Text style={[
                styles.ticketDescription,
                ticket.isHighlighted && { paddingLeft: 8 }
              ]}>
                {ticket.description}
              </Text>

              <View style={[
                styles.ticketFooter,
                ticket.isHighlighted && { paddingLeft: 8 }
              ]}>
                <View style={styles.dateContainer}>
                  <Feather name="calendar" size={14} color="#6B7280" />
                  <Text style={styles.dateText}>{ticket.date}</Text>
                </View>
                
                {ticket.isHighlighted ? (
                  <View style={styles.viewDetailsContainer}>
                    <Text style={styles.viewDetailsText}>VIEW DETAILS</Text>
                    <Feather name="chevron-right" size={14} color="#F59E0B" />
                  </View>
                ) : (
                  <Feather name="chevron-right" size={20} color="#D1D5DB" />
                )}
              </View>
            </TouchableOpacity>
          ))}
          </View>
        )}

        {/* Bottom Text */}
        {!loading && !error && filteredTickets.length > 0 && (
          <View style={styles.bottomText}>
            <Text style={styles.bottomTextContent}>Showing recent tickets</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterContainer: {
    marginVertical: 24,
  },
  filterContent: {
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ticketsList: {
    gap: 16,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  ticketCardHighlighted: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFBF5',
  },
  highlightBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#F59E0B',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketId: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
    paddingTop: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  bottomText: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  bottomTextContent: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});