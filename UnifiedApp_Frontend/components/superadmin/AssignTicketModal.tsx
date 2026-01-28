import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import supportTicketService, { SupportTicket, UserRole } from '../../services/supportTicketService';

const { width } = Dimensions.get('window');

interface AssignTicketModalProps {
  visible: boolean;
  ticket: SupportTicket | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Support staff with roles - In production, fetch from API
interface Assignee {
  id: string;
  name: string;
  role: 'hub_agent' | 'delivery_agent' | 'support_staff' | 'super_admin';
  location?: string;
}

const ASSIGNEES: Assignee[] = [
  // Hub Agents
  { id: 'HUB_001_DALLAS', name: 'Sarah Connor', role: 'hub_agent', location: 'Dallas' },
  { id: 'HUB_002_HOUSTON', name: 'Mike Ross', role: 'hub_agent', location: 'Houston' },
  { id: 'HUB_003_AUSTIN', name: 'Rachel Green', role: 'hub_agent', location: 'Austin' },
  { id: 'HUB_004_MIAMI', name: 'Ross Geller', role: 'hub_agent', location: 'Miami' },
  { id: 'HUB_005_PHOENIX', name: 'Monica Geller', role: 'hub_agent', location: 'Phoenix' },
  { id: 'HUB_006_DENVER', name: 'Chandler Bing', role: 'hub_agent', location: 'Denver' },
  
  // Support Staff
  { id: 'support_001', name: 'Support Agent A', role: 'support_staff' },
  { id: 'support_002', name: 'Support Agent B', role: 'support_staff' },
  { id: 'support_003', name: 'Support Agent C', role: 'support_staff' },
  { id: 'support_004', name: 'Support Agent D', role: 'support_staff' },
  
  // Delivery Agents (can be assigned for delivery-related issues)
  { id: 'DEL_001', name: 'David Martinez', role: 'delivery_agent' },
  { id: 'DEL_002', name: 'Maria Garcia', role: 'delivery_agent' },
  { id: 'DEL_003', name: 'James Wilson', role: 'delivery_agent' },
  
  // Super Admins
  { id: 'ADMIN_001', name: 'Admin Master', role: 'super_admin' },
  { id: 'ADMIN_002', name: 'Super Admin', role: 'super_admin' },
];

const PRIORITIES = [
  { value: '', label: 'Keep current priority' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

// Helper to format role display
const formatRole = (role: string): string => {
  switch (role) {
    case 'hub_agent':
      return 'Hub Agent';
    case 'delivery_agent':
      return 'Delivery Agent';
    case 'support_staff':
      return 'Support Staff';
    case 'super_admin':
      return 'Super Admin';
    default:
      return role;
  }
};

// Helper to format ticket creator role
const formatCreatorRole = (role?: UserRole): string => {
  if (!role) return '';
  
  switch (role) {
    case 'CUSTOMER':
      return 'Customer';
    case 'HUB_AGENT':
      return 'Hub Agent';
    case 'DELIVERY_AGENT':
      return 'Delivery Agent';
    case 'SUPER_ADMIN':
      return 'Super Admin';
    default:
      return role;
  }
};

const AssignTicketModal: React.FC<AssignTicketModalProps> = ({
  visible,
  ticket,
  onClose,
  onSuccess,
}) => {
  const [assignedToId, setAssignedToId] = useState('');
  const [assignedToName, setAssignedToName] = useState('');
  const [priority, setPriority] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // Group assignees by role for better UX
  const groupedAssignees = React.useMemo(() => {
    const groups = {
      hub_agent: ASSIGNEES.filter(a => a.role === 'hub_agent'),
      support_staff: ASSIGNEES.filter(a => a.role === 'support_staff'),
      delivery_agent: ASSIGNEES.filter(a => a.role === 'delivery_agent'),
      super_admin: ASSIGNEES.filter(a => a.role === 'super_admin'),
    };
    return groups;
  }, []);

  React.useEffect(() => {
    if (ticket && visible) {
      setAssignedToId(ticket.assignedTo || '');
      setAssignedToName(ticket.assignedToName || '');
      setPriority(''); // Keep current priority by default
      setComment('');
    }
  }, [ticket, visible]);

  const handleClose = () => {
    if (!loading) {
      setAssignedToId('');
      setAssignedToName('');
      setPriority('');
      setComment('');
      onClose();
    }
  };

  const handleAssigneeChange = (id: string) => {
    setAssignedToId(id);
    const assignee = ASSIGNEES.find(a => a.id === id);
    if (assignee) {
      const displayName = assignee.location 
        ? `${assignee.name} (${formatRole(assignee.role)} - ${assignee.location})`
        : `${assignee.name} (${formatRole(assignee.role)})`;
      setAssignedToName(displayName);
    }
  };

  const handleSubmit = async () => {
    if (!ticket) return;

    if (!assignedToId || assignedToId.trim() === '') {
      Alert.alert('Validation Error', 'Please select an assignee');
      return;
    }

    try {
      setLoading(true);

      const assignmentData = {
        assignedTo: assignedToId.trim(),
        assignedToName: assignedToName.trim(),
        priority: priority || undefined,
        comment: comment.trim() || undefined,
        performedBy: 'ADMIN_001', // TODO: Get from auth context
        performedByRole: 'Super Admin',
      };

      await supportTicketService.assignTicket(ticket.id!, assignmentData);

      // Show success message
      Alert.alert(
        'Success',
        'Ticket assigned successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              handleClose();
              onSuccess();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error assigning ticket:', error);
      Alert.alert('Error', 'Failed to assign ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) return null;

  const isReassignment = ticket.assignedTo && ticket.assignedTo.trim() !== '';
  
  // Format ticket creator info
  const creatorInfo = ticket.raisedByLocation 
    ? `${ticket.raisedByName || ticket.userId} (${formatCreatorRole(ticket.raisedByRole)} - ${ticket.raisedByLocation})`
    : `${ticket.raisedByName || ticket.userId}${ticket.raisedByRole ? ` (${formatCreatorRole(ticket.raisedByRole)})` : ''}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>
                {isReassignment ? 'Reassign Ticket' : 'Assign Ticket'}
              </Text>
              <Text style={styles.headerSubtitle}>Ticket #{ticket.id}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Ticket Info */}
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketSubject}>{ticket.subject}</Text>
              <View style={styles.ticketMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={16} color="#6b7280" />
                  <Text style={styles.metaText}>{creatorInfo}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="flag-outline" size={16} color="#6b7280" />
                  <Text style={styles.metaText}>
                    Priority: {ticket.priority}
                  </Text>
                </View>
              </View>
              {isReassignment && (
                <View style={styles.currentAssignment}>
                  <Ionicons name="information-circle" size={16} color="#3b82f6" />
                  <Text style={styles.currentAssignmentText}>
                    Currently assigned to: {ticket.assignedToName || ticket.assignedTo}
                  </Text>
                </View>
              )}
            </View>

            {/* Assignee Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Assigned To <Text style={styles.required}>*</Text>
              </Text>
              
              {/* Custom Dropdown Button */}
              <TouchableOpacity
                style={[styles.dropdownButton, showAssigneeDropdown && styles.dropdownButtonActive]}
                onPress={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                disabled={loading}
              >
                <Text style={[styles.dropdownButtonText, !assignedToName && styles.dropdownPlaceholder]}>
                  {assignedToName || 'Select assignee...'}
                </Text>
                <Ionicons 
                  name={showAssigneeDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#6b7280" 
                />
              </TouchableOpacity>

              {/* Dropdown List */}
              {showAssigneeDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {/* Hub Agents Section */}
                    <View style={styles.dropdownSection}>
                      <Text style={styles.dropdownSectionTitle}>Hub Agents</Text>
                      {groupedAssignees.hub_agent.map((assignee) => (
                        <TouchableOpacity
                          key={assignee.id}
                          style={[
                            styles.dropdownItem,
                            assignedToId === assignee.id && styles.dropdownItemSelected
                          ]}
                          onPress={() => {
                            handleAssigneeChange(assignee.id);
                            setShowAssigneeDropdown(false);
                          }}
                        >
                          <View style={styles.dropdownItemContent}>
                            <Ionicons name="business-outline" size={16} color="#3b82f6" />
                            <View style={styles.dropdownItemTextContainer}>
                              <Text style={styles.dropdownItemText}>{assignee.name}</Text>
                              <Text style={styles.dropdownItemSubtext}>{assignee.location}</Text>
                            </View>
                          </View>
                          {assignedToId === assignee.id && (
                            <Ionicons name="checkmark" size={20} color="#3b82f6" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Support Staff Section */}
                    <View style={styles.dropdownSection}>
                      <Text style={styles.dropdownSectionTitle}>Support Staff</Text>
                      {groupedAssignees.support_staff.map((assignee) => (
                        <TouchableOpacity
                          key={assignee.id}
                          style={[
                            styles.dropdownItem,
                            assignedToId === assignee.id && styles.dropdownItemSelected
                          ]}
                          onPress={() => {
                            handleAssigneeChange(assignee.id);
                            setShowAssigneeDropdown(false);
                          }}
                        >
                          <View style={styles.dropdownItemContent}>
                            <Ionicons name="headset-outline" size={16} color="#10b981" />
                            <Text style={styles.dropdownItemText}>{assignee.name}</Text>
                          </View>
                          {assignedToId === assignee.id && (
                            <Ionicons name="checkmark" size={20} color="#3b82f6" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Delivery Agents Section */}
                    <View style={styles.dropdownSection}>
                      <Text style={styles.dropdownSectionTitle}>Delivery Agents</Text>
                      {groupedAssignees.delivery_agent.map((assignee) => (
                        <TouchableOpacity
                          key={assignee.id}
                          style={[
                            styles.dropdownItem,
                            assignedToId === assignee.id && styles.dropdownItemSelected
                          ]}
                          onPress={() => {
                            handleAssigneeChange(assignee.id);
                            setShowAssigneeDropdown(false);
                          }}
                        >
                          <View style={styles.dropdownItemContent}>
                            <Ionicons name="bicycle-outline" size={16} color="#f59e0b" />
                            <Text style={styles.dropdownItemText}>{assignee.name}</Text>
                          </View>
                          {assignedToId === assignee.id && (
                            <Ionicons name="checkmark" size={20} color="#3b82f6" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Super Admins Section */}
                    <View style={styles.dropdownSection}>
                      <Text style={styles.dropdownSectionTitle}>Super Admins</Text>
                      {groupedAssignees.super_admin.map((assignee) => (
                        <TouchableOpacity
                          key={assignee.id}
                          style={[
                            styles.dropdownItem,
                            assignedToId === assignee.id && styles.dropdownItemSelected
                          ]}
                          onPress={() => {
                            handleAssigneeChange(assignee.id);
                            setShowAssigneeDropdown(false);
                          }}
                        >
                          <View style={styles.dropdownItemContent}>
                            <Ionicons name="shield-checkmark-outline" size={16} color="#8b5cf6" />
                            <Text style={styles.dropdownItemText}>{assignee.name}</Text>
                          </View>
                          {assignedToId === assignee.id && (
                            <Ionicons name="checkmark" size={20} color="#3b82f6" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
              
              <Text style={styles.helperText}>
                {assignedToName ? `Selected: ${assignedToName}` : 'Select a hub agent or support staff member'}
              </Text>
            </View>

            {/* Priority Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Priority</Text>
              
              {/* Custom Dropdown Button */}
              <TouchableOpacity
                style={[styles.dropdownButton, showPriorityDropdown && styles.dropdownButtonActive]}
                onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
                disabled={loading}
              >
                <Text style={[styles.dropdownButtonText, !priority && styles.dropdownPlaceholder]}>
                  {PRIORITIES.find(p => p.value === priority)?.label || 'Keep current priority'}
                </Text>
                <Ionicons 
                  name={showPriorityDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#6b7280" 
                />
              </TouchableOpacity>

              {/* Dropdown List */}
              {showPriorityDropdown && (
                <View style={styles.dropdownList}>
                  {PRIORITIES.map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.dropdownItem,
                        priority === item.value && styles.dropdownItemSelected
                      ]}
                      onPress={() => {
                        setPriority(item.value);
                        setShowPriorityDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{item.label}</Text>
                      {priority === item.value && (
                        <Ionicons name="checkmark" size={20} color="#3b82f6" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              <Text style={styles.helperText}>
                {priority
                  ? 'Priority will be updated'
                  : 'Leave empty to keep current priority'}
              </Text>
            </View>

            {/* Comment */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {isReassignment ? 'Reason for Reassignment' : 'Comment'}
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder={
                  isReassignment
                    ? 'Explain why this ticket is being reassigned...'
                    : 'Add any notes or instructions... (optional)'
                }
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                maxLength={500}
                editable={!loading}
              />
              <Text style={styles.characterCount}>{comment.length}/500</Text>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.infoText}>
                The assignee will receive a push notification about this {isReassignment ? 'reassignment' : 'assignment'}.
                All changes will be logged for audit tracking.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Save & Notify</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  ticketInfo: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  ticketMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6b7280',
  },
  currentAssignment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  currentAssignmentText: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Custom Dropdown Styles
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#9ca3af',
  },
  dropdownList: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  dropdownSection: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemSelected: {
    backgroundColor: '#eff6ff',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dropdownItemTextContainer: {
    flex: 1,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  dropdownItemSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});

export default AssignTicketModal;
