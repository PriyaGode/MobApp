import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SUPERADMIN_API_BASE_URL, UNIFIED_API_BASE_URL } from '../../config';
import WebSocketService from '../../services/websocketService';
import { normalize, wp } from '../../utils/responsive';

type OrdersSummary = {
  totalOrders: number;
  percentageChange: number;
  comparisonPeriod: string;
  range: string;
};

type RevenueSummary = {
  totalRevenue: number;
  percentageChange: number;
  comparisonPeriod: string;
  range: string;
};

type HubStats = {
  hubId: string;
  hubName: string;
  location: string;
  orderCount: number;
  revenue: number;
  rating: number;
};

type ActiveUsers = {
  totalActiveUsers: number;
  activeCustomers: number;
  activeDeliveryPartners: number;
  timeRange: string;
};

type RangeType = 'daily' | 'weekly' | 'monthly';
type UserRangeType = '24h' | '7d' | '30d';
type CurrencyType = 'USD' | 'INR';

type OrdersGraph = {
  labels: string[];
  data: number[];
};

type RevenueGraph = {
  labels: string[];
  data: number[];
  averageRevenue: number;
  cumulativeRevenue: number;
};

type SystemAlert = {
  id: number;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  type: string;
  acknowledged: boolean;
  createdAt: string;
};

const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  percentageChange 
}: { 
  title: string; 
  value: string | number; 
  subtitle: string; 
  icon: string; 
  percentageChange?: number;
}) => (
  <View style={styles.kpiCard}>
    <View style={styles.kpiHeader}>
      <Text style={styles.kpiTitle}>{title}</Text>
      <MaterialIcons name={icon as any} size={24} color="#FFC107" />
    </View>
    <Text style={styles.kpiValue}>{value}</Text>
    <View style={styles.kpiFooter}>
      <Text style={styles.kpiSubtitle}>{subtitle}</Text>
      {percentageChange !== undefined && (
        <View style={styles.changeContainer}>
          <MaterialIcons 
            name={percentageChange >= 0 ? "arrow-upward" : "arrow-downward"} 
            size={14} 
            color={percentageChange >= 0 ? "#4CAF50" : "#f44336"} 
          />
          <Text style={[
            styles.changeText,
            { color: percentageChange >= 0 ? "#4CAF50" : "#f44336" }
          ]}>
            {Math.abs(percentageChange).toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  </View>
);

export default function SuperAdminDashboardScreen({ navigation }: { navigation: any }) {
  const [ordersSummary, setOrdersSummary] = useState<OrdersSummary | null>(null);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [hubPerformance, setHubPerformance] = useState<HubStats[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUsers | null>(null);
  const [ordersGraph, setOrdersGraph] = useState<OrdersGraph | null>(null);
  const [revenueGraph, setRevenueGraph] = useState<RevenueGraph | null>(null);
  const [selectedRange, setSelectedRange] = useState<RangeType>('daily');
  const [userRange, setUserRange] = useState<UserRangeType>('24h');
  const [currency, setCurrency] = useState<CurrencyType>('USD');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  // Use ReturnType<typeof setInterval> for RN compatibility instead of NodeJS.Timeout
  const refreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertsInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch(`${SUPERADMIN_API_BASE_URL}/alerts/unacknowledged`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, []);

  const connectAlertWebSocket = useCallback(() => {
    // WebSocket endpoint is at /ws/alerts (not under /api/admin)
    const wsUrl = UNIFIED_API_BASE_URL.replace('http', 'ws') + '/ws/alerts';
    WebSocketService.connect(wsUrl);

    WebSocketService.on('new_alert', (data: any) => {
      console.log('New alert received:', data);
      setAlerts(prev => [data.alert, ...prev]);
    });

    WebSocketService.on('alert_acknowledged', (data: any) => {
      console.log('Alert acknowledged:', data);
      setAlerts(prev => prev.filter(alert => alert.id !== data.alertId));
    });

    WebSocketService.on('connection', (data: any) => {
      console.log('Alert WebSocket connection status:', data.status);
    });
  }, []);

  const fetchDashboardData = useCallback(async (range: RangeType, usrRange: UserRangeType) => {
    try {
      const [ordersRes, revenueRes, hubsRes, usersRes, ordersGraphRes, revenueGraphRes] = await Promise.all([
        fetch(`${SUPERADMIN_API_BASE_URL}/dashboard/orders/summary?range=${range}`),
        fetch(`${SUPERADMIN_API_BASE_URL}/dashboard/revenue/summary?range=${range}`),
        fetch(`${SUPERADMIN_API_BASE_URL}/dashboard/hubs/performance?limit=5`),
        fetch(`${SUPERADMIN_API_BASE_URL}/dashboard/users/active?range=${usrRange}`),
        fetch(`${SUPERADMIN_API_BASE_URL}/dashboard/orders/graph?range=weekly`),
        fetch(`${SUPERADMIN_API_BASE_URL}/dashboard/revenue/graph?range=weekly`)
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrdersSummary(ordersData);
      }

      if (revenueRes.ok) {
        const revenueData = await revenueRes.json();
        setRevenueSummary(revenueData);
      }

      if (hubsRes.ok) {
        const hubsData = await hubsRes.json();
        setHubPerformance(hubsData.topHubs || []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setActiveUsers(usersData);
      }

      if (ordersGraphRes.ok) {
        const graphData = await ordersGraphRes.json();
        setOrdersGraph(graphData);
      }

      if (revenueGraphRes.ok) {
        const graphData = await revenueGraphRes.json();
        setRevenueGraph(graphData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(selectedRange, userRange);
    fetchAlerts();
    connectAlertWebSocket();
    
    // Auto-refresh dashboard every 15 minutes
    refreshInterval.current = setInterval(() => {
      fetchDashboardData(selectedRange, userRange);
    }, 15 * 60 * 1000);

    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
      if (alertsInterval.current) clearInterval(alertsInterval.current);
      WebSocketService.disconnect();
    };
  }, [selectedRange, userRange, fetchDashboardData, fetchAlerts, connectAlertWebSocket]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(selectedRange, userRange);
    fetchAlerts();
  };

  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      await fetch(`${SUPERADMIN_API_BASE_URL}/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      });
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#f44336';
      case 'WARNING': return '#FF9800';
      case 'INFO': return '#2196F3';
      default: return '#757575';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'error';
      case 'WARNING': return 'warning';
      case 'INFO': return 'info';
      default: return 'notifications';
    }
  };

  const handleRangeChange = (range: RangeType) => {
    setSelectedRange(range);
    setIsLoading(true);
  };

  const handleUserRangeChange = (range: UserRangeType) => {
    setUserRange(range);
  };

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'INR' : 'USD');
  };

  const convertCurrency = (amount: number) => {
    return currency === 'INR' ? amount * 83 : amount;
  };

  const formatCurrency = (amount: number) => {
    const value = convertCurrency(amount);
    if (currency === 'USD') {
      return `$${value.toFixed(0)}`;
    } else {
      return `₹${value.toFixed(0)}`;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <MaterialIcons name="dashboard" size={normalize(24)} color="#FF8F00" />
        <Text style={styles.headerTitle}>Super Admin Dashboard</Text>
        <TouchableOpacity 
          style={styles.auditButton} 
          onPress={() => navigation.navigate('AuditDashboard')}
        >
          <MaterialIcons name="history" size={normalize(22)} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Alert Filter Tabs */}
        <View style={styles.alertFilterContainer}>
          {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.alertFilterTab,
                alertFilter === filter && styles.alertFilterTabActive,
                filter === 'CRITICAL' && alertFilter === filter && { backgroundColor: '#f44336' },
                filter === 'WARNING' && alertFilter === filter && { backgroundColor: '#FF9800' },
                filter === 'INFO' && alertFilter === filter && { backgroundColor: '#2196F3' },
              ]}
              onPress={() => setAlertFilter(filter)}
            >
              <Text style={[
                styles.alertFilterText,
                alertFilter === filter && styles.alertFilterTextActive
              ]}>
                {filter} ({filter === 'ALL' ? alerts.length : alerts.filter(a => a.severity === filter).length})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* System Alerts - Horizontal Scrolling */}
        {alerts.filter(a => alertFilter === 'ALL' || a.severity === alertFilter).length > 0 ? (
          <View style={styles.alertsSection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.alertsScrollContent}
            >
              {alerts
                .filter(alert => alertFilter === 'ALL' || alert.severity === alertFilter)
                .map((alert) => (
                <View key={alert.id} style={[styles.alertCard, { borderLeftColor: getSeverityColor(alert.severity) }]}>
                  <View style={styles.alertHeader}>
                    <View style={styles.alertTitleRow}>
                      <MaterialIcons 
                        name={getSeverityIcon(alert.severity) as any} 
                        size={normalize(18)} 
                        color={getSeverityColor(alert.severity)} 
                      />
                      <Text style={[styles.alertSeverity, { color: getSeverityColor(alert.severity) }]}>
                        {alert.severity}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleAcknowledgeAlert(alert.id)}>
                      <MaterialIcons name="close" size={normalize(20)} color="#757575" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertMessage} numberOfLines={2}>{alert.message}</Text>
                  <Text style={styles.alertTime}>
                    {new Date(alert.createdAt).toLocaleString()}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.noAlertsContainer}>
            <MaterialIcons name="check-circle" size={normalize(48)} color="#4CAF50" />
            <Text style={styles.noAlertsText}>No {alertFilter !== 'ALL' ? alertFilter.toLowerCase() : ''} alerts</Text>
          </View>
        )}

        {/* Range Selector */}
        <View style={styles.rangeSelector}>
          <TouchableOpacity
            style={[styles.rangeButton, selectedRange === 'daily' && styles.rangeButtonActive]}
            onPress={() => handleRangeChange('daily')}
          >
            <Text style={[styles.rangeText, selectedRange === 'daily' && styles.rangeTextActive]}>
              Daily
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rangeButton, selectedRange === 'weekly' && styles.rangeButtonActive]}
            onPress={() => handleRangeChange('weekly')}
          >
            <Text style={[styles.rangeText, selectedRange === 'weekly' && styles.rangeTextActive]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rangeButton, selectedRange === 'monthly' && styles.rangeButtonActive]}
            onPress={() => handleRangeChange('monthly')}
          >
            <Text style={[styles.rangeText, selectedRange === 'monthly' && styles.rangeTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        {/* KPI Cards */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#FFC107" style={styles.loader} />
        ) : (
          <>
            <View style={styles.kpiGrid}>
              <KPICard
                title="Total Orders"
                value={ordersSummary?.totalOrders || 0}
                subtitle={selectedRange === 'daily' ? 'Today' : selectedRange === 'weekly' ? 'This Week' : 'This Month'}
                icon="shopping-cart"
                percentageChange={ordersSummary?.percentageChange}
              />
              <View style={styles.kpiCard}>
                <View style={styles.kpiHeader}>
                  <Text style={styles.kpiTitle}>Total Revenue</Text>
                  <View style={styles.currencyToggle}>
                    <TouchableOpacity onPress={toggleCurrency} style={styles.currencyButton}>
                      <Text style={styles.currencyText}>{currency}</Text>
                      <MaterialIcons name="swap-horiz" size={16} color="#FFC107" />
                    </TouchableOpacity>
                    <MaterialIcons name="payments" size={24} color="#FFC107" />
                  </View>
                </View>
                <Text style={styles.kpiValue}>
                  {formatCurrency(revenueSummary?.totalRevenue || 0)}
                </Text>
                <View style={styles.kpiFooter}>
                  <Text style={styles.kpiSubtitle}>
                    {selectedRange === 'daily' ? 'Today' : selectedRange === 'weekly' ? 'This Week' : 'This Month'}
                  </Text>
                  {revenueSummary?.percentageChange !== undefined && (
                    <View style={styles.changeContainer}>
                      <MaterialIcons 
                        name={revenueSummary.percentageChange >= 0 ? "arrow-upward" : "arrow-downward"} 
                        size={14} 
                        color={revenueSummary.percentageChange >= 0 ? "#4CAF50" : "#f44336"} 
                      />
                      <Text style={[
                        styles.changeText,
                        { color: revenueSummary.percentageChange >= 0 ? "#4CAF50" : "#f44336" }
                      ]}>
                        {Math.abs(revenueSummary.percentageChange).toFixed(1)}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={[styles.kpiCard, { width: '100%' }]}>
                <View style={styles.kpiHeader}>
                  <Text style={styles.kpiTitle}>Active Users</Text>
                  <MaterialIcons name="group" size={24} color="#FFC107" />
                </View>
                <View style={styles.userRangeSelector}>
                  <TouchableOpacity 
                    style={[styles.userRangeBtn, userRange === '24h' && styles.userRangeBtnActive]}
                    onPress={() => handleUserRangeChange('24h')}
                  >
                    <Text style={[styles.userRangeText, userRange === '24h' && styles.userRangeTextActive]}>24h</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.userRangeBtn, userRange === '7d' && styles.userRangeBtnActive]}
                    onPress={() => handleUserRangeChange('7d')}
                  >
                    <Text style={[styles.userRangeText, userRange === '7d' && styles.userRangeTextActive]}>7d</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.userRangeBtn, userRange === '30d' && styles.userRangeBtnActive]}
                    onPress={() => handleUserRangeChange('30d')}
                  >
                    <Text style={[styles.userRangeText, userRange === '30d' && styles.userRangeTextActive]}>30d</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.kpiValue}>{activeUsers?.totalActiveUsers || 0}</Text>
                {activeUsers && (
                  <View style={styles.pieChartContainer}>
                    <PieChart
                      data={[
                        {
                          name: 'Customers',
                          population: activeUsers.activeCustomers,
                          color: '#2E7D32',
                          legendFontColor: '#212121',
                          legendFontSize: normalize(11)
                        },
                        {
                          name: 'Delivery',
                          population: activeUsers.activeDeliveryPartners,
                          color: '#FF8F00',
                          legendFontColor: '#212121',
                          legendFontSize: normalize(11)
                        }
                      ]}
                      width={wp(92)}
                      height={normalize(120)}
                      chartConfig={{
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      }}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="0"
                      absolute
                    />
                  </View>
                )}
              </View>
            </View>

            {/* Orders Graph */}
            {ordersGraph && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Weekly Orders Trend</Text>
                <Text style={styles.chartSubtitle}>Last 7 Days</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <BarChart
                    data={{
                      labels: ordersGraph.labels,
                      datasets: [{ data: ordersGraph.data }]
                    }}
                    width={wp(92)}
                    height={normalize(200)}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => '#FF9800',
                      labelColor: (opacity = 1) => '#212121',
                      style: { borderRadius: normalize(16) },
                      propsForLabels: { fontSize: normalize(10), fontWeight: '600' },
                      barPercentage: 0.7,
                      fillShadowGradient: '#FF9800',
                      fillShadowGradientOpacity: 1
                    }}
                    style={styles.chart}
                    fromZero
                    withInnerLines={false}
                  />
                </ScrollView>
              </View>
            )}

            {/* Revenue Graph */}
            {revenueGraph && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Revenue Trend</Text>
                <Text style={styles.chartSubtitle}>
                  Avg: {formatCurrency(revenueGraph.averageRevenue)} | Total: {formatCurrency(revenueGraph.cumulativeRevenue)}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <LineChart
                    data={{
                      labels: revenueGraph.labels,
                      datasets: [{ 
                        data: revenueGraph.data.map(v => convertCurrency(v)),
                        strokeWidth: 4
                      }]
                    }}
                    width={wp(92)}
                    height={normalize(200)}
                    yAxisLabel={currency === 'USD' ? '$' : '₹'}
                    yAxisSuffix=""
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => '#2E7D32',
                      labelColor: (opacity = 1) => '#212121',
                      style: { borderRadius: normalize(16) },
                      propsForLabels: { fontSize: normalize(10), fontWeight: '600' },
                      propsForDots: {
                        r: '6',
                        strokeWidth: '3',
                        stroke: '#2E7D32',
                        fill: '#2E7D32'
                      },
                      fillShadowGradient: '#2E7D32',
                      fillShadowGradientOpacity: 0.2
                    }}
                    bezier
                    style={styles.chart}
                    withInnerLines={false}
                    withOuterLines={true}
                    withVerticalLines={false}
                    withShadow={false}
                  />
                </ScrollView>
              </View>
            )}

            {/* Hub Performance */}
            {hubPerformance.length > 0 && (
              <View style={styles.hubPerformanceCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Hub Performance</Text>
                  <Text style={styles.sectionSubtitle}>Top 5 hubs by daily orders</Text>
                </View>
                {hubPerformance.map((hub, index) => (
                  <View key={hub.hubId} style={styles.hubRow}>
                    <View style={styles.hubLeft}>
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankText}>{index + 1}</Text>
                      </View>
                      <View style={styles.hubInfo}>
                        <Text style={styles.hubName}>{hub.hubName}</Text>
                        <View style={styles.hubMetrics}>
                          <Text style={styles.hubRevenue}>
                            {formatCurrency(hub.revenue)}
                          </Text>
                          <View style={styles.ratingContainer}>
                            <MaterialIcons name="star" size={normalize(12)} color="#FFC107" />
                            <Text style={styles.ratingText}>{hub.rating?.toFixed(1) || '0.0'}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.hubOrders}>{hub.orderCount} orders</Text>
                  </View>
                ))}
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => navigation.navigate('Hubs')}
                >
                  <Text style={styles.viewAllText}>View All Hubs</Text>
                  <MaterialIcons name="arrow-forward" size={16} color="#2196F3" />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: normalize(14),
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: normalize(12)
  },
  headerTitle: { 
    fontSize: normalize(16), 
    fontWeight: '700', 
    color: '#212121', 
    flex: 1
  },
  headerSpacer: { width: normalize(24) },
  auditButton: {
    backgroundColor: '#FF8F00',
    padding: normalize(8),
    borderRadius: normalize(8),
  },
  content: { flex: 1 },
  alertFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    paddingTop: normalize(12),
    paddingBottom: normalize(8),
    gap: normalize(8),
  },
  alertFilterTab: {
    flex: 1,
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(8),
    borderRadius: normalize(8),
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  alertFilterTabActive: {
    backgroundColor: '#424242',
    borderColor: '#424242',
  },
  alertFilterText: {
    fontSize: normalize(11),
    fontWeight: '600',
    color: '#757575',
  },
  alertFilterTextActive: {
    color: '#FFFFFF',
  },
  noAlertsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(40),
    backgroundColor: '#F9FBE7',
    marginHorizontal: wp(4),
    borderRadius: normalize(12),
    marginBottom: normalize(12),
  },
  noAlertsText: {
    marginTop: normalize(12),
    fontSize: normalize(14),
    color: '#689F38',
    fontWeight: '500',
  },
  rangeSelector: {
    flexDirection: 'row',
    padding: wp(4),
    gap: normalize(8)
  },
  rangeButton: {
    flex: 1,
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(8),
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  rangeButtonActive: {
    backgroundColor: '#FFC107',
    borderColor: '#FFC107'
  },
  rangeText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#757575'
  },
  rangeTextActive: {
    color: '#212121'
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: wp(4),
    paddingTop: wp(4),
    gap: wp(2.5),
    paddingBottom: 0
  },
  kpiCard: {
    width: wp(44),
    minHeight: normalize(120),
    backgroundColor: 'white',
    borderRadius: normalize(12),
    padding: normalize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(8)
  },
  kpiTitle: {
    fontSize: normalize(13),
    fontWeight: '500',
    color: '#757575'
  },
  kpiValue: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: normalize(4),
    flexShrink: 1
  },
  kpiFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  kpiSubtitle: {
    fontSize: normalize(11),
    color: '#757575'
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(2)
  },
  changeText: {
    fontSize: normalize(11),
    fontWeight: '600'
  },
  loader: {
    marginTop: normalize(40)
  },
  hubPerformanceCard: {
    backgroundColor: 'white',
    marginHorizontal: wp(4),
    marginTop: normalize(12),
    marginBottom: normalize(16),
    padding: normalize(16),
    borderRadius: normalize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  sectionHeader: {
    marginBottom: normalize(16)
  },
  sectionTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#212121',
    marginBottom: normalize(4)
  },
  sectionSubtitle: {
    fontSize: normalize(13),
    color: '#757575'
  },
  hubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: normalize(60)
  },
  hubLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(12),
    flex: 1
  },
  rankBadge: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  rankText: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: '#FFC107'
  },
  hubInfo: {
    flex: 1,
    marginRight: normalize(8)
  },
  hubName: {
    fontSize: normalize(13),
    fontWeight: '500',
    color: '#212121',
    marginBottom: normalize(4)
  },
  hubMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8)
  },
  hubOrders: {
    fontSize: normalize(12),
    fontWeight: 'bold',
    color: '#212121',
    flexShrink: 0
  },
  hubRevenue: {
    fontSize: normalize(10),
    color: '#4CAF50',
    flexShrink: 1
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(2),
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    borderRadius: normalize(8)
  },
  ratingText: {
    fontSize: normalize(10),
    fontWeight: '600',
    color: '#FFC107'
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(12),
    marginTop: normalize(8),
    gap: normalize(4)
  },
  viewAllText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#2196F3'
  },
  chartCard: {
    backgroundColor: 'white',
    marginHorizontal: wp(4),
    marginTop: normalize(12),
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(12),
    borderRadius: normalize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  chartTitle: {
    fontSize: normalize(15),
    fontWeight: '700',
    color: '#212121',
    marginBottom: normalize(4)
  },
  chartSubtitle: {
    fontSize: normalize(11),
    color: '#757575',
    marginBottom: normalize(12),
    flexWrap: 'wrap'
  },
  chart: {
    marginVertical: normalize(8),
    borderRadius: normalize(16),
    marginLeft: -normalize(12)
  },
  currencyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8)
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: normalize(12)
  },
  currencyText: {
    fontSize: normalize(11),
    fontWeight: '600',
    color: '#FFC107'
  },
  userRangeSelector: {
    flexDirection: 'row',
    gap: normalize(8),
    marginVertical: normalize(8)
  },
  userRangeBtn: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(12),
    backgroundColor: '#F5F5F5'
  },
  userRangeBtnActive: {
    backgroundColor: '#FFC107'
  },
  userRangeText: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: '#757575'
  },
  userRangeTextActive: {
    color: '#212121'
  },
  pieChartContainer: {
    marginTop: normalize(12),
    alignItems: 'center'
  },
  alertsSection: {
    paddingHorizontal: wp(4),
    paddingTop: wp(4),
    marginBottom: normalize(8)
  },
  alertsScrollContent: {
    paddingRight: wp(4),
    gap: normalize(12)
  },
  alertCard: {
    width: wp(75),
    backgroundColor: 'white',
    borderRadius: normalize(12),
    padding: normalize(12),
    borderLeftWidth: normalize(4),
    marginRight: normalize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(8)
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6)
  },
  alertSeverity: {
    fontSize: normalize(11),
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  alertTitle: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#212121',
    marginBottom: normalize(4)
  },
  alertMessage: {
    fontSize: normalize(12),
    color: '#757575',
    lineHeight: normalize(18),
    marginBottom: normalize(6)
  },
  alertTime: {
    fontSize: normalize(10),
    color: '#9E9E9E'
  }
});
