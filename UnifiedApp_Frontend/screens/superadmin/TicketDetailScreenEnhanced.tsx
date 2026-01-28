import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    InputAccessoryView,
    Keyboard,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import AddNoteModal from '../../components/superadmin/AddNoteModal';
import AssignTicketModal from '../../components/superadmin/AssignTicketModal';
import AttachmentUploadModal from '../../components/superadmin/AttachmentUploadModal';
import supportTicketService, { SupportTicket, TicketAttachment } from '../../services/supportTicketService';
// Temporarily disabled WebSocket due to transformer error - using polling instead
// import websocketService from '../../services/websocketService';

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

// Helper function to parse resolution history
const parseResolutionHistory = (historyString: string | null | undefined): Array<{
  timestamp: string;
  resolver: string;
  role: string;
  resolution: string;
}> => {
  if (!historyString || historyString.trim() === '') return [];

  try {
    const entries = historyString.split('###RESOLUTION_SEPARATOR###');
    return entries.map(entry => {
      // Format: [timestamp|resolver|role] resolution text
      const match = entry.trim().match(/\[(.*?)\|(.*?)\|(.*?)\] ([\s\S]*)/);
      if (match) {
        return {
          timestamp: match[1],
          resolver: match[2],
          role: match[3],
          resolution: match[4].trim(),
        };
      }
      return null;
    }).filter(Boolean) as Array<{
      timestamp: string;
      resolver: string;
      role: string;
      resolution: string;
    }>;
  } catch (error) {
    console.error('Error parsing resolution history:', error);
    return [];
  }
};

const TicketDetailScreenEnhanced: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { ticketId } = route.params as { ticketId: number };

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [resolution, setResolution] = useState('');
  const [showResolutionHistory, setShowResolutionHistory] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<{
    timestamp: string;
    resolver: string;
    role: string;
    resolution: string;
    index: number;
  } | null>(null);

  const statuses: Array<SupportTicket['status']> = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

  useEffect(() => {
    loadTicketData();
    // setupWebSocket(); // Disabled due to transformer error
    
    // Polling removed - only load data on mount or manual refresh

    return () => {
      // websocketService.disconnect(); // Disabled
    };
  }, [ticketId]);

  /* Temporarily disabled WebSocket functionality
  const setupWebSocket = () => {
    websocketService.on('ticket_update', (data: any) => {
      if (data.ticketId === ticketId) {
        console.log('Ticket update received:', data);
        loadTicketData();
      }
    });
  };
  */

  const loadTicketData = async () => {
    try {
      setLoading(true);
      const [ticketData, attachmentsData] = await Promise.all([
        supportTicketService.getTicketById(ticketId),
        supportTicketService.getAttachments(ticketId),
      ]);
      setTicket(ticketData);
      setAttachments(attachmentsData);
      // Only set resolution for CLOSED tickets, clear it for IN_PROGRESS (even if reopened)
      setResolution(ticketData.status === 'CLOSED' ? (ticketData.resolution || '') : '');
    } catch (error) {
      console.error('Error loading ticket:', error);
      Alert.alert('Error', 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: SupportTicket['status']) => {
    try {
      // Prevent closing ticket through status modal if it's IN_PROGRESS
      // Users should use the Submit Resolution button instead
      if (newStatus === 'CLOSED' && ticket?.status === 'IN_PROGRESS') {
        Alert.alert(
          'Use Submit Resolution',
          'Please use the "Submit Resolution" button to close an IN_PROGRESS ticket. This ensures proper resolution documentation.',
          [{ text: 'OK' }]
        );
        setShowStatusModal(false);
        return;
      }

      // If changing to CLOSED from other statuses, still require resolution
      if (newStatus === 'CLOSED' && !resolution.trim()) {
        Alert.alert(
          'Resolution Required',
          'Please add a resolution before closing the ticket.',
          [{ text: 'OK' }]
        );
        setShowStatusModal(false);
        return;
      }

      const performedBy = ticket?.assignedToName || 'System';
      const performedByRole = 'Agent';

      // Include resolution when closing
      await supportTicketService.updateTicketStatus(
        ticketId, 
        newStatus, 
        newStatus === 'CLOSED' ? resolution : undefined,
        performedBy,
        performedByRole
      );
      
      Alert.alert('Success', newStatus === 'CLOSED' 
        ? 'Ticket closed successfully with resolution' 
        : 'Ticket status updated successfully');
      setShowStatusModal(false);
      loadTicketData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update ticket status');
    }
  };

  const handleUpdateResolution = async () => {
    if (!ticket) return;

    if (!resolution.trim()) {
      Alert.alert('Error', 'Please enter a resolution before submitting');
      return;
    }

    // Show confirmation to close the ticket
    Alert.alert(
      'Submit Resolution',
      'Resolution has been entered. Do you want to close this ticket now?',
      [
        {
          text: 'No, Edit Resolution',
          style: 'cancel',
          onPress: () => {
            // Stay on the same screen with resolution text intact
          }
        },
        {
          text: 'Yes, Close Ticket',
          onPress: async () => {
            try {
              const performedBy = ticket.assignedToName || 'System';
              const performedByRole = 'Agent';

              // Close the ticket with resolution
              await supportTicketService.updateTicketStatus(
                ticketId,
                'CLOSED',
                resolution,
                performedBy,
                performedByRole
              );

              Alert.alert('Success', 'Ticket closed successfully with resolution');
              loadTicketData();
            } catch (error) {
              Alert.alert('Error', 'Failed to close ticket');
            }
          }
        }
      ]
    );
  };

  const handleDeleteTicket = () => {
    Alert.alert(
      'Delete Ticket',
      'Are you sure you want to delete this ticket? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await supportTicketService.deleteTicket(ticketId);
              Alert.alert('Success', 'Ticket deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete ticket');
            }
          },
        },
      ]
    );
  };

  const parseNotes = (notesString: string | null): Array<{ timestamp: string; author: string; text: string }> => {
    if (!notesString) return [];
    
    const lines = notesString.split('\n').filter(line => line.trim());
    return lines.map(line => {
      // Format: [timestamp - author] note text
      const match = line.match(/\[(.*?) - (.*?)\] (.*)/);
      if (match) {
        return {
          timestamp: match[1],
          author: match[2],
          text: match[3],
        };
      }
      return {
        timestamp: new Date().toISOString(),
        author: 'System',
        text: line,
      };
    });
  };

  const renderAttachmentPreview = (attachment: TicketAttachment) => {
    const isImage = attachment.fileType?.startsWith('image/');
    const isPDF = attachment.fileType === 'application/pdf';

    return (
      <TouchableOpacity
        key={attachment.id}
        style={styles.attachmentCard}
        onPress={() => {
          if (attachment.fileUrl) {
            Linking.openURL(attachment.fileUrl);
          }
        }}
      >
        {isImage ? (
          <Image source={{ uri: attachment.fileUrl }} style={styles.attachmentImage} />
        ) : isPDF ? (
          <View style={styles.pdfPreview}>
            <Ionicons name="document-text" size={48} color="#ef4444" />
          </View>
        ) : (
          <View style={styles.filePreview}>
            <Ionicons name="document" size={48} color="#6b7280" />
          </View>
        )}
        
        <View style={styles.attachmentInfo}>
          <Text style={styles.attachmentName} numberOfLines={1}>
            {attachment.fileName || 'Unnamed File'}
          </Text>
          <Text style={styles.attachmentSize}>
            {getReadableFileSize(attachment.fileSize || 0)}
          </Text>
          <Text style={styles.attachmentDate}>
            {attachment.uploadedAt ? new Date(attachment.uploadedAt).toLocaleDateString() : 'N/A'}
          </Text>
          {attachment.description && (
            <Text style={styles.attachmentDescription} numberOfLines={2}>
              {attachment.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getReadableFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#3b82f6';
      case 'IN_PROGRESS': return '#f59e0b';
      case 'CLOSED': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#dc2626';
      case 'HIGH': return '#dc2626';
      case 'MEDIUM': return '#f97316';
      case 'LOW': return '#22c55e';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading ticket details...</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#dc2626" />
        <Text style={styles.errorText}>Ticket not found</Text>
      </View>
    );
  }

  const notes = parseNotes(ticket.notes || null);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.ticketId}>Ticket #{ticket.id}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title and Badges */}
        <View style={styles.titleSection}>
          <Text style={styles.subject}>{ticket.subject || 'No Subject'}</Text>
          <View style={styles.badges}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status || 'OPEN') }]}>
              <Text style={styles.badgeText}>{(ticket.status || 'OPEN').replace('_', ' ')}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(ticket.priority || 'LOW') }]}>
              <Text style={styles.badgeText}>{ticket.priority || 'LOW'}</Text>
            </View>
          </View>
        </View>

        {/* Ticket Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Raised By</Text>
              <Text style={styles.infoValue}>
                {formatCreatedBy(ticket)}
              </Text>
            </View>
          </View>

          {ticket.assignedTo && (
            <View style={styles.infoRow}>
              <Ionicons name="person-circle-outline" size={18} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Assigned To</Text>
                <Text style={styles.infoValue}>
                  {ticket.assignedToName || ticket.assignedTo}
                </Text>
              </View>
            </View>
          )}

          {ticket.hubRegion && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Hub / Region</Text>
                <Text style={styles.infoValue}>{ticket.hubRegion}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={18} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{ticket.category || 'General'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>
                {new Date(ticket.createdAt || '').toLocaleString()}
              </Text>
            </View>
          </View>

          {ticket.resolvedAt && (
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#22c55e" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Resolved</Text>
                <Text style={styles.infoValue}>
                  {new Date(ticket.resolvedAt).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{ticket.description || 'No Description'}</Text>
        </View>

        {/* Attachments */}
        {attachments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Attachments</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{attachments.length}</Text>
              </View>
            </View>
            <View style={styles.attachmentsGrid}>
              {attachments.map(renderAttachmentPreview)}
            </View>
          </View>
        )}

        {/* Notes Timeline */}
        {notes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Notes & Activity</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{notes.length}</Text>
              </View>
            </View>
            <View style={styles.timeline}>
              {notes.map((note, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  {index < notes.length - 1 && <View style={styles.timelineLine} />}
                  <View style={styles.noteContent}>
                    <View style={styles.noteHeader}>
                      <Text style={styles.noteAuthor}>{note.author}</Text>
                      <Text style={styles.noteTimestamp}>
                        {new Date(note.timestamp).toLocaleString()}
                      </Text>
                    </View>
                    <Text style={styles.noteText}>{note.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ===== SCENARIO 1: IN_PROGRESS with Previous Resolutions ===== */}
        {ticket.status === 'IN_PROGRESS' && ticket.resolutionHistory && parseResolutionHistory(ticket.resolutionHistory).length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.dropdownHeader}
              onPress={() => setShowResolutionHistory(!showResolutionHistory)}
            >
              <View style={styles.dropdownHeaderContent}>
                <View style={styles.historyHeaderLeft}>
                  <Ionicons name="time-outline" size={22} color="#3b82f6" />
                  <Text style={styles.sectionTitle}>Previous Resolutions</Text>
                </View>
                <View style={styles.headerRightContent}>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                      {parseResolutionHistory(ticket.resolutionHistory).length}
                    </Text>
                  </View>
                  <Ionicons 
                    name={showResolutionHistory ? "chevron-up" : "chevron-down"} 
                    size={24} 
                    color="#6b7280" 
                  />
                </View>
              </View>
            </TouchableOpacity>

            {showResolutionHistory && (
              <View style={styles.resolutionHistoryContainer}>
                {parseResolutionHistory(ticket.resolutionHistory)
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((historyItem, index, arr) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.historyItemCompact}
                      onPress={() => setSelectedResolution({ ...historyItem, index: arr.length - index })}
                    >
                      <View style={styles.historyItemHeader}>
                        <View style={styles.historyBadge}>
                          <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                          <Text style={styles.historyBadgeText}>Resolution #{arr.length - index}</Text>
                        </View>
                        <View style={styles.eyeIconContainer}>
                          <Ionicons name="eye-outline" size={20} color="#3b82f6" />
                          <Text style={styles.tapToViewText}>Tap to view</Text>
                        </View>
                      </View>
                      <View style={styles.historyMetadata}>
                        <View style={styles.metadataItem}>
                          <Ionicons name="person-outline" size={14} color="#6b7280" />
                          <Text style={styles.historyResolver}>
                            {historyItem.resolver} • {historyItem.role}
                          </Text>
                        </View>
                        <View style={styles.metadataItem}>
                          <Ionicons name="time-outline" size={14} color="#6b7280" />
                          <Text style={styles.historyTimestamp}>
                            {new Date(historyItem.timestamp).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.resolutionPreviewContainer}>
                        <Text style={styles.resolutionPreviewLabel}>Resolution:</Text>
                        <Text style={styles.historyResolutionPreview} numberOfLines={2} ellipsizeMode="tail">
                          {historyItem.resolution}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </View>
        )}

        {/* ===== SCENARIO 1 & 2: Add Resolution for IN_PROGRESS tickets ===== */}
        {ticket.status === 'IN_PROGRESS' && (
          <View style={styles.section}>
            <View style={styles.newResolutionHeader}>
              <View style={styles.historyHeaderLeft}>
                <Ionicons name="create-outline" size={22} color="#10b981" />
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
                  {ticket.resolutionHistory && parseResolutionHistory(ticket.resolutionHistory).length > 0 
                    ? 'Add New Resolution' 
                    : 'Add Resolution'}
                </Text>
              </View>
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>Required to close</Text>
              </View>
            </View>

            {ticket.resolutionHistory && parseResolutionHistory(ticket.resolutionHistory).length > 0 && (
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={18} color="#3b82f6" />
                <Text style={styles.infoBoxText}>
                  This ticket was previously resolved. Add a new resolution to close it again.
                </Text>
              </View>
            )}
            
            <Text style={styles.resolutionHint}>
              💡 Describe how you resolved this issue, then submit to close the ticket.
            </Text>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter resolution details..."
              value={resolution}
              onChangeText={setResolution}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              returnKeyType="default"
              blurOnSubmit={false}
              enablesReturnKeyAutomatically={false}
              inputAccessoryViewID={Platform.OS === 'ios' ? "resolutionInputAccessory" : undefined}
            />
            {Platform.OS === 'android' && (
              <View style={styles.androidKeyboardButtons}>
                <TouchableOpacity
                  style={styles.newLineButton}
                  onPress={() => {
                    setResolution(prev => prev + '\n');
                  }}
                >
                  <Ionicons name="return-down-back" size={18} color="#3b82f6" />
                  <Text style={styles.newLineButtonText}>New Line</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.doneAccessoryButton}
                  onPress={() => Keyboard.dismiss()}
                >
                  <Text style={styles.doneAccessoryButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Submit Resolution Button */}
            <TouchableOpacity
              style={[styles.submitButton, !resolution.trim() && styles.submitButtonDisabled]}
              onPress={handleUpdateResolution}
              disabled={!resolution.trim()}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Resolution & Close Ticket</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ===== CLOSED Tickets: Show Current Resolution ===== */}
        {ticket.status === 'CLOSED' && ticket.resolution && (
          <View style={styles.section}>
            <View style={styles.historyHeaderLeft}>
              <Ionicons name="checkmark-done-circle" size={22} color="#10b981" />
              <Text style={styles.sectionTitle}>Current Resolution</Text>
            </View>
            <View style={styles.currentResolutionCard}>
              <Text style={styles.resolutionDisplay}>{ticket.resolution}</Text>
              <View style={styles.resolutionMetaInfo}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.resolutionLabel}>
                  Resolved on {ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString() : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ===== CLOSED Tickets: Show Previous Resolutions ===== */}
        {ticket.status === 'CLOSED' && ticket.resolutionHistory && parseResolutionHistory(ticket.resolutionHistory).length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.dropdownHeader}
              onPress={() => setShowResolutionHistory(!showResolutionHistory)}
            >
              <View style={styles.dropdownHeaderContent}>
                <View style={styles.historyHeaderLeft}>
                  <Ionicons name="time-outline" size={22} color="#6b7280" />
                  <Text style={styles.sectionTitle}>Previous Resolutions</Text>
                </View>
                <View style={styles.headerRightContent}>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                      {parseResolutionHistory(ticket.resolutionHistory).length}
                    </Text>
                  </View>
                  <Ionicons 
                    name={showResolutionHistory ? "chevron-up" : "chevron-down"} 
                    size={24} 
                    color="#6b7280" 
                  />
                </View>
              </View>
            </TouchableOpacity>

            {showResolutionHistory && (
              <View style={styles.resolutionHistoryContainer}>
                {parseResolutionHistory(ticket.resolutionHistory)
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((historyItem, index, arr) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.historyItemCompact}
                      onPress={() => setSelectedResolution({ ...historyItem, index: arr.length - index })}
                    >
                      <View style={styles.historyItemHeader}>
                        <View style={styles.historyBadge}>
                          <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                          <Text style={styles.historyBadgeText}>Resolution #{arr.length - index}</Text>
                        </View>
                        <View style={styles.eyeIconContainer}>
                          <Ionicons name="eye-outline" size={20} color="#3b82f6" />
                          <Text style={styles.tapToViewText}>Tap to view</Text>
                        </View>
                      </View>
                      <View style={styles.historyMetadata}>
                        <View style={styles.metadataItem}>
                          <Ionicons name="person-outline" size={14} color="#6b7280" />
                          <Text style={styles.historyResolver}>
                            {historyItem.resolver} • {historyItem.role}
                          </Text>
                        </View>
                        <View style={styles.metadataItem}>
                          <Ionicons name="time-outline" size={14} color="#6b7280" />
                          <Text style={styles.historyTimestamp}>
                            {new Date(historyItem.timestamp).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.resolutionPreviewContainer}>
                        <Text style={styles.resolutionPreviewLabel}>Resolution:</Text>
                        <Text style={styles.historyResolutionPreview} numberOfLines={2} ellipsizeMode="tail">
                          {historyItem.resolution}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.statusButton]}
            onPress={() => setShowStatusModal(true)}
          >
            <Ionicons name="swap-horizontal" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Change Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteTicket}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: '#3b82f6' }]}
          onPress={() => setShowAssignModal(true)}
        >
          <Ionicons name="person-add" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: '#f59e0b' }]}
          onPress={() => setShowNoteModal(true)}
        >
          <Ionicons name="create" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: '#8b5cf6' }]}
          onPress={() => setShowAttachmentModal(true)}
        >
          <Ionicons name="attach" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Status Change Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Status</Text>
            {statuses.map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.statusOption, { borderLeftColor: getStatusColor(status) }]}
                onPress={() => handleStatusUpdate(status)}
              >
                <Text style={styles.statusOptionText}>{status.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Other Modals */}
      <AssignTicketModal
        visible={showAssignModal}
        ticket={ticket}
        onClose={() => setShowAssignModal(false)}
        onSuccess={() => {
          setShowAssignModal(false);
          loadTicketData();
        }}
      />

      <AddNoteModal
        visible={showNoteModal}
        ticket={ticket}
        onClose={() => setShowNoteModal(false)}
        onSuccess={() => {
          setShowNoteModal(false);
          loadTicketData();
        }}
      />

      <AttachmentUploadModal
        visible={showAttachmentModal}
        ticket={ticket}
        onClose={() => setShowAttachmentModal(false)}
        onSuccess={() => {
          setShowAttachmentModal(false);
          loadTicketData();
        }}
      />

      {/* Resolution Detail Modal */}
      <Modal
        visible={selectedResolution !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedResolution(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resolutionModalContent}>
            {selectedResolution && (
              <>
                <View style={styles.resolutionModalHeader}>
                  <View style={styles.historyBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text style={styles.resolutionModalTitle}>
                      Resolution #{selectedResolution.index}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setSelectedResolution(null)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={28} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  style={styles.resolutionModalScroll}
                  showsVerticalScrollIndicator={true}
                >
                  <View style={styles.resolutionModalMetadata}>
                    <View style={styles.metadataRow}>
                      <Ionicons name="person" size={16} color="#6b7280" />
                      <Text style={styles.metadataText}>
                        {selectedResolution.resolver} ({selectedResolution.role})
                      </Text>
                    </View>
                    <View style={styles.metadataRow}>
                      <Ionicons name="time" size={16} color="#6b7280" />
                      <Text style={styles.metadataText}>
                        {new Date(selectedResolution.timestamp).toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.resolutionModalTextContainer}>
                    <Text style={styles.resolutionModalText}>
                      {selectedResolution.resolution}
                    </Text>
                  </View>
                </ScrollView>

                <TouchableOpacity 
                  style={styles.resolutionModalCloseButton}
                  onPress={() => setSelectedResolution(null)}
                >
                  <Text style={styles.resolutionModalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Input Accessory View for Resolution Input - iOS only */}
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID="resolutionInputAccessory">
          <View style={styles.inputAccessoryContainer}>
            <View style={styles.inputAccessoryButtons}>
              <TouchableOpacity
                style={styles.newLineButton}
                onPress={() => {
                  setResolution(prev => prev + '\n');
                }}
              >
                <Ionicons name="return-down-back" size={20} color="#3b82f6" />
                <Text style={styles.newLineButtonText}>New Line</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.doneAccessoryButton}
                onPress={() => Keyboard.dismiss()}
              >
                <Text style={styles.doneAccessoryButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </InputAccessoryView>
      )}
    </KeyboardAvoidingView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  ticketId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  scrollContent: {
    flex: 1,
  },
  titleSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  subject: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  countBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  attachmentsGrid: {
    gap: 12,
  },
  attachmentCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  attachmentImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  pdfPreview: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filePreview: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  attachmentSize: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  attachmentDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  attachmentDescription: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
    fontStyle: 'italic',
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    position: 'relative',
    paddingLeft: 24,
    paddingBottom: 16,
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: '#fff',
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 12,
    bottom: 0,
    width: 2,
    backgroundColor: '#e5e7eb',
  },
  noteContent: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  noteAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  noteTimestamp: {
    fontSize: 11,
    color: '#6b7280',
  },
  noteText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
  },
  resolutionHint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  resolutionDisplayContainer: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  resolutionDisplay: {
    fontSize: 14,
    color: '#065f46',
    lineHeight: 22,
    marginBottom: 8,
  },
  resolutionLabel: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  resolutionHistoryContainer: {
    gap: 12,
  },
  historyItem: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
  historyTimestamp: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '400',
  },
  historyMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyResolver: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '400',
  },
  historyResolution: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 22,
  },
  updateButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 6,
  },
  statusButton: {
    backgroundColor: '#f59e0b',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
    borderRadius: 8,
  },
  statusOptionText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  // Collapsible dropdown styles
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  dropdownHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Compact history item styles
  historyItemCompact: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eyeIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tapToViewText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '500',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resolutionPreviewContainer: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  resolutionPreviewLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyResolutionPreview: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  // Resolution modal styles
  resolutionModalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 60,
    borderRadius: 16,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  resolutionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  resolutionModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
    marginLeft: 6,
  },
  closeButton: {
    padding: 4,
  },
  resolutionModalScroll: {
    maxHeight: 400,
  },
  resolutionModalMetadata: {
    padding: 16,
    backgroundColor: '#f9fafb',
    gap: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataText: {
    fontSize: 13,
    color: '#6b7280',
  },
  resolutionModalTextContainer: {
    padding: 16,
  },
  resolutionModalText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 24,
  },
  resolutionModalCloseButton: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  resolutionModalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Input Accessory View styles (iOS keyboard toolbar)
  inputAccessoryContainer: {
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputAccessoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Android keyboard buttons (below text input)
  androidKeyboardButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  newLineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  newLineButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  doneAccessoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  doneAccessoryButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  // Submit Resolution Button
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  // New Resolution Header Styles
  newResolutionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requiredBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  requiredText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    gap: 10,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  currentResolutionCard: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginTop: 8,
  },
  resolutionMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
});

export default TicketDetailScreenEnhanced;

