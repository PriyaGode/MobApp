import { Feather } from '@expo/vector-icons';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Temporary Users screen using React Navigation
// TODO: Integrate with actual user-list-screen once navigation is unified
export default function UsersTabScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => Alert.alert('Coming Soon', 'Add User feature is being integrated')}
        >
          <Feather name="user-plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Feather name="users" size={48} color="#2563EB" />
          <Text style={styles.cardTitle}>User Features</Text>
          <Text style={styles.cardDescription}>
            • View all users{'\n'}
            • Create and edit users{'\n'}
            • Assign roles (Admin, Manager, Staff){'\n'}
            • Manage user status{'\n'}
            • View login history{'\n'}
            • Track user activities
          </Text>
          <Text style={styles.integrationNote}>
            Full user management interface is being integrated with React Navigation.
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Info', 'User list will show all users with search, filter, and role assignment capabilities')}
        >
          <Feather name="list" size={20} color="#2563EB" />
          <Text style={styles.actionButtonText}>View User List</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Info', 'Manage user roles and permissions')}
        >
          <Feather name="shield" size={20} color="#2563EB" />
          <Text style={styles.actionButtonText}>Role Management</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Info', 'View detailed user activity logs and login history')}
        >
          <Feather name="activity" size={20} color="#2563EB" />
          <Text style={styles.actionButtonText}>Activity Logs</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#2563EB',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  integrationNote: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2563EB',
    marginLeft: 12,
  },
});
