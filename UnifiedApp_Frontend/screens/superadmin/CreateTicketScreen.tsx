import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import supportTicketService, { SupportTicket } from '../../services/supportTicketService';

const CreateTicketScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showHubSearch, setShowHubSearch] = useState(false);
  const [hubSearchQuery, setHubSearchQuery] = useState('');
  const [showAgentSearch, setShowAgentSearch] = useState(false);
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    hubRegion: '',
    assignedTo: '',
    assignedToName: '',
  });

  const categories = [
    'Technical Issue',
    'Billing',
    'Feature Request',
    'Bug Report',
    'Account',
    'General Inquiry',
    'Other',
  ];

  const priorities: Array<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'> = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  // Hub regions with their agents
  const hubsWithAgents = {
    'Dallas': [
      { id: 'HUB_001_DALLAS', name: 'Sarah Connor' },
      { id: 'HUB_002_DALLAS', name: 'John Smith' },
      { id: 'HUB_003_DALLAS', name: 'Robert Taylor' },
    ],
    'Denver': [
      { id: 'HUB_001_DENVER', name: 'Mike Johnson' },
      { id: 'HUB_002_DENVER', name: 'Lisa Anderson' },
      { id: 'HUB_003_DENVER', name: 'Tom Williams' },
    ],
    'Phoenix': [
      { id: 'HUB_001_PHOENIX', name: 'David Brown' },
      { id: 'HUB_002_PHOENIX', name: 'Emma Davis' },
      { id: 'HUB_003_PHOENIX', name: 'Jennifer Lee' },
    ],
    'Seattle': [
      { id: 'HUB_001_SEATTLE', name: 'Chris Wilson' },
      { id: 'HUB_002_SEATTLE', name: 'Anna Martinez' },
      { id: 'HUB_003_SEATTLE', name: 'Kevin Garcia' },
    ],
    'Austin': [
      { id: 'HUB_001_AUSTIN', name: 'Mark Rodriguez' },
      { id: 'HUB_002_AUSTIN', name: 'Patricia Lopez' },
    ],
    'Boston': [
      { id: 'HUB_001_BOSTON', name: 'James White' },
      { id: 'HUB_002_BOSTON', name: 'Mary Thomas' },
    ],
    'Chicago': [
      { id: 'HUB_001_CHICAGO', name: 'Daniel Harris' },
      { id: 'HUB_002_CHICAGO', name: 'Linda Clark' },
    ],
    'Miami': [
      { id: 'HUB_001_MIAMI', name: 'Paul Lewis' },
      { id: 'HUB_002_MIAMI', name: 'Nancy Walker' },
    ],
  };

  const hubRegions = Object.keys(hubsWithAgents);

  // Filter hubs based on search query
  const filteredHubs = hubRegions.filter(hub =>
    hub.toLowerCase().includes(hubSearchQuery.toLowerCase())
  );

  // Get agents for selected hub
  const getAgentsForHub = () => {
    if (!formData.hubRegion) return [];
    return hubsWithAgents[formData.hubRegion as keyof typeof hubsWithAgents] || [];
  };

  // Filter agents based on search query
  const filteredAgents = getAgentsForHub().filter(agent =>
    agent.name.toLowerCase().includes(agentSearchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!formData.subject.trim()) {
      Alert.alert('Validation Error', 'Please enter a subject');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description');
      return;
    }

    if (!formData.category) {
      Alert.alert('Validation Error', 'Please select a category');
      return;
    }

    if (!formData.hubRegion) {
      Alert.alert('Validation Error', 'Please select a hub region');
      return;
    }

    try {
      setLoading(true);
      
      const ticket: Omit<SupportTicket, 'id'> = {
        userId: 'user123', // Replace with actual user ID from auth context
        subject: formData.subject,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: 'OPEN',
        hubRegion: formData.hubRegion,
        assignedTo: formData.assignedTo || undefined,
        assignedToName: formData.assignedToName || undefined,
      };

      await supportTicketService.createTicket(ticket);
      
      Alert.alert(
        'Success',
        'Your support ticket has been created successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating ticket:', error);
      Alert.alert('Error', 'Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Support Ticket</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Subject *</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief description of your issue"
            value={formData.subject}
            onChangeText={(text) => setFormData({ ...formData, subject: text })}
            maxLength={200}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Provide detailed information about your issue..."
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  formData.category === category && styles.categoryButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, category })}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    formData.category === category && styles.categoryButtonTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.priorityButton,
                  formData.priority === priority && {
                    backgroundColor: getPriorityColor(priority),
                  },
                ]}
                onPress={() => setFormData({ ...formData, priority })}
              >
                <Text
                  style={[
                    styles.priorityButtonText,
                    formData.priority === priority && styles.priorityButtonTextActive,
                  ]}
                >
                  {priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Hub Region *</Text>
          <TouchableOpacity
            style={styles.searchableInput}
            onPress={() => setShowHubSearch(true)}
          >
            <Text style={[styles.searchableInputText, !formData.hubRegion && styles.placeholderText]}>
              {formData.hubRegion || 'Search and select a hub...'}
            </Text>
            <Ionicons name="search" size={20} color="#6b7280" />
          </TouchableOpacity>
          {formData.hubRegion && (
            <View style={styles.selectedBadge}>
              <Ionicons name="location" size={16} color="#3b82f6" />
              <Text style={styles.selectedBadgeText}>{formData.hubRegion}</Text>
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, hubRegion: '', assignedTo: '', assignedToName: '' })}
              >
                <Ionicons name="close-circle" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {formData.hubRegion && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Assign to Agent (Optional)</Text>
            <TouchableOpacity
              style={styles.searchableInput}
              onPress={() => setShowAgentSearch(true)}
            >
              <Text style={[styles.searchableInputText, !formData.assignedToName && styles.placeholderText]}>
                {formData.assignedToName || 'Search and select an agent...'}
              </Text>
              <Ionicons name="search" size={20} color="#6b7280" />
            </TouchableOpacity>
            {formData.assignedToName && (
              <View style={styles.selectedBadge}>
                <Ionicons name="person" size={16} color="#10b981" />
                <Text style={styles.selectedBadgeText}>{formData.assignedToName}</Text>
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, assignedTo: '', assignedToName: '' })}
                >
                  <Ionicons name="close-circle" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Ticket</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Hub Search Modal */}
      <Modal
        visible={showHubSearch}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHubSearch(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Hub Region</Text>
              <TouchableOpacity onPress={() => setShowHubSearch(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search hubs..."
                value={hubSearchQuery}
                onChangeText={setHubSearchQuery}
                autoFocus
              />
            </View>

            <ScrollView style={styles.optionsList}>
              {filteredHubs.length > 0 ? (
                filteredHubs.map((hub) => (
                  <TouchableOpacity
                    key={hub}
                    style={[
                      styles.optionItem,
                      formData.hubRegion === hub && styles.optionItemSelected
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, hubRegion: hub, assignedTo: '', assignedToName: '' });
                      setShowHubSearch(false);
                      setHubSearchQuery('');
                    }}
                  >
                    <Ionicons 
                      name="location" 
                      size={20} 
                      color={formData.hubRegion === hub ? '#3b82f6' : '#6b7280'} 
                    />
                    <Text style={[
                      styles.optionText,
                      formData.hubRegion === hub && styles.optionTextSelected
                    ]}>
                      {hub}
                    </Text>
                    {formData.hubRegion === hub && (
                      <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyStateText}>No hubs found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Agent Search Modal */}
      <Modal
        visible={showAgentSearch}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAgentSearch(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Agent from {formData.hubRegion}</Text>
              <TouchableOpacity onPress={() => setShowAgentSearch(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search agents..."
                value={agentSearchQuery}
                onChangeText={setAgentSearchQuery}
                autoFocus
              />
            </View>

            <ScrollView style={styles.optionsList}>
              {filteredAgents.length > 0 ? (
                filteredAgents.map((agent) => (
                  <TouchableOpacity
                    key={agent.id}
                    style={[
                      styles.optionItem,
                      formData.assignedTo === agent.id && styles.optionItemSelected
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, assignedTo: agent.id, assignedToName: agent.name });
                      setShowAgentSearch(false);
                      setAgentSearchQuery('');
                    }}
                  >
                    <Ionicons 
                      name="person" 
                      size={20} 
                      color={formData.assignedTo === agent.id ? '#10b981' : '#6b7280'} 
                    />
                    <Text style={[
                      styles.optionText,
                      formData.assignedTo === agent.id && styles.optionTextSelected
                    ]}>
                      {agent.name}
                    </Text>
                    {formData.assignedTo === agent.id && (
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyStateText}>No agents found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#3498db',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    minHeight: 120,
    maxHeight: 200,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  priorityButtonText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  priorityButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchableInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 14,
    marginTop: 8,
  },
  searchableInputText: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    gap: 8,
  },
  selectedBadgeText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  optionItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#1e40af',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
  },
});

export default CreateTicketScreen;
