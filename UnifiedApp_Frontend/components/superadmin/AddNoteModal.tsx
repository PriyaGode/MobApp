import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import supportTicketService, { SupportTicket } from '../../services/supportTicketService';

interface AddNoteModalProps {
  visible: boolean;
  ticket: SupportTicket | null;
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_NOTE_LENGTH = 1000;

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  visible,
  ticket,
  onClose,
  onSuccess,
}) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setNote('');
    }
  }, [visible]);

  const handleClose = () => {
    if (!loading) {
      Keyboard.dismiss();
      setNote('');
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!ticket) return;

    if (!note.trim()) {
      Alert.alert('Validation Error', 'Please enter a note');
      return;
    }

    if (note.trim().length < 10) {
      Alert.alert('Validation Error', 'Note must be at least 10 characters');
      return;
    }

    try {
      setLoading(true);

      const noteData = {
        note: note.trim(),
        performedBy: 'Super Admin', // TODO: Get from auth context
        performedByRole: 'Super Admin',
      };

      await supportTicketService.addNote(ticket.id!, noteData);

      Alert.alert(
        'Success',
        'Note added successfully',
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
      console.error('Error adding note:', error);
      Alert.alert('Error', 'Failed to add note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) return null;

  const remainingChars = MAX_NOTE_LENGTH - note.length;
  const isValidLength = note.trim().length >= 10;

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
              <Text style={styles.headerTitle}>Add Note</Text>
              <Text style={styles.headerSubtitle}>Ticket #{ticket.id}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Ticket Info */}
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketSubject} numberOfLines={2}>
                {ticket.subject}
              </Text>
              <View style={styles.ticketMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={16} color="#6b7280" />
                  <Text style={styles.metaText}>
                    {ticket.raisedByName || ticket.userId}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="flag-outline" size={16} color="#6b7280" />
                  <Text style={styles.metaText}>
                    {ticket.status}
                  </Text>
                </View>
              </View>
            </View>

            {/* Note Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Note <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  !isValidLength && note.length > 0 && styles.textAreaError,
                ]}
                placeholder="Enter detailed notes about this ticket... (minimum 10 characters)"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={8}
                maxLength={MAX_NOTE_LENGTH}
                editable={!loading}
                textAlignVertical="top"
              />
              <View style={styles.inputFooter}>
                <Text
                  style={[
                    styles.helperText,
                    !isValidLength && note.length > 0 && styles.helperTextError,
                  ]}
                >
                  {note.length > 0 && !isValidLength
                    ? `${10 - note.trim().length} more characters needed`
                    : 'Minimum 10 characters'}
                </Text>
                <Text
                  style={[
                    styles.characterCount,
                    remainingChars < 100 && styles.characterCountWarning,
                    remainingChars === 0 && styles.characterCountLimit,
                  ]}
                >
                  {remainingChars} remaining
                </Text>
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.infoText}>
                Notes are visible to all support staff and will be logged in the
                ticket's activity history. They help maintain context and track
                progress.
              </Text>
            </View>
          </View>

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
                (!isValidLength || loading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isValidLength || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Add Note</Text>
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
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 150,
    backgroundColor: '#fff',
  },
  textAreaError: {
    borderColor: '#ef4444',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
  },
  helperTextError: {
    color: '#ef4444',
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
  },
  characterCountWarning: {
    color: '#f59e0b',
  },
  characterCountLimit: {
    color: '#ef4444',
    fontWeight: '600',
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
});

export default AddNoteModal;
