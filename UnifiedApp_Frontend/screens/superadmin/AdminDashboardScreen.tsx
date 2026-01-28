import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { ResponsiveContainer, ResponsiveGrid } from '../../components/ResponsiveWrapper';

type DashboardItemProps = {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  onPress: () => void;
};

const DashboardItem = ({ icon, title, onPress }: DashboardItemProps) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <Feather name={icon} size={32} color="#2196F3" />
    <Text style={styles.itemTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function AdminDashboardScreen({ navigation }: { navigation: any }) {
  const responsive = useResponsiveLayout();

  const handleManageProducts = () => {
    navigation.navigate('Products');
  };

  const handleBulkUpload = () => {
    navigation.navigate('BulkUpload');
  };

  const handleManageUsers = () => {
    navigation.navigate('Users');
  };

  const handleViewOrders = () => {
    navigation.navigate('GlobalOrders');
  };

  const handleViewAnalytics = () => {
    navigation.navigate('SuperAdminDashboard');
  };

  const handleViewAudit = () => {
    navigation.navigate('AuditDashboard');
  };

  return (
    <ResponsiveContainer style={styles.container}>
      <Text style={[styles.headerTitle, { fontSize: responsive.fontSize(28) }]}>Super Admin Dashboard</Text>

      <ScrollView style={styles.scrollView}>
        <ResponsiveGrid spacing={responsive.isFoldable ? 20 : 15}>
          <DashboardItem icon="bar-chart-2" title="Super Admin Dashboard" onPress={handleViewAnalytics} />
          <DashboardItem icon="file-text" title="Audit Logs" onPress={handleViewAudit} />
          <DashboardItem icon="package" title="Manage Products" onPress={handleManageProducts} />
          <DashboardItem icon="upload" title="Bulk Upload" onPress={handleBulkUpload} />
          <DashboardItem icon="users" title="Manage Users" onPress={handleManageUsers} />
          <DashboardItem icon="shopping-bag" title="View Orders" onPress={handleViewOrders} />
        </ResponsiveGrid>
      </ScrollView>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerTitle: { fontWeight: 'bold', paddingVertical: 20, color: '#333' },
  scrollView: { flex: 1 },
  itemContainer: { 
    aspectRatio: 1, 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 1.41,
    minHeight: 120, // Minimum height for better touch targets
  },
  itemTitle: { marginTop: 10, fontSize: 16, fontWeight: '600', color: '#555', textAlign: 'center' },
});
