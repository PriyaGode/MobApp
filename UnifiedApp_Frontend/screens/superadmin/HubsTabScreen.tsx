import { Feather } from '@expo/vector-icons';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Temporary Hubs screen using React Navigation
// TODO: Integrate with actual hub-list-screen once navigation is unified
export default function HubsTabScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hub Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => Alert.alert('Coming Soon', 'Add Hub feature is being integrated')}
        >
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Feather name="map-pin" size={48} color="#2563EB" />
          <Text style={styles.cardTitle}>Hub Features</Text>
          <Text style={styles.cardDescription}>
            • View all hubs{'\n'}
            • Create and edit hubs{'\n'}
            • Manage hub locations{'\n'}
            • View hub inventory{'\n'}
            • Toggle hub status
          </Text>
          <Text style={styles.integrationNote}>
            Full hub management interface is being integrated with React Navigation.
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Info', 'Hub list will show all active and inactive hubs with search and filter capabilities')}
        >
          <Feather name="list" size={20} color="#2563EB" />
          <Text style={styles.actionButtonText}>View Hub List</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Info', 'Navigate to inventory management for each hub')}
        >
          <Feather name="package" size={20} color="#2563EB" />
          <Text style={styles.actionButtonText}>Manage Inventory</Text>
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
