import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import supportTicketService, { SupportTicket } from '../../services/supportTicketService';

interface AttachmentUploadModalProps {
  visible: boolean;
  ticket: SupportTicket | null;
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

const AttachmentUploadModal: React.FC<AttachmentUploadModalProps> = ({
  visible,
  ticket,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (visible) {
      setSelectedFile(null);
      setDescription('');
      setUploadProgress(0);
    }
  }, [visible]);

  const handleClose = () => {
    if (!loading) {
      setSelectedFile(null);
      setDescription('');
      setUploadProgress(0);
      onClose();
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.mimeType || '')) {
        Alert.alert(
          'Invalid File Type',
          'Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed.'
        );
        return;
      }

      // Validate file size
      if (file.size && file.size > MAX_FILE_SIZE) {
        Alert.alert(
          'File Too Large',
          `File size exceeds 10MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`
        );
        return;
      }

      setSelectedFile(file);
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!ticket || !selectedFile) return;

    try {
      setLoading(true);
      setUploadProgress(0);

      // Create file object for upload
      const fileToUpload: any = {
        uri: selectedFile.uri,
        type: selectedFile.mimeType,
        name: selectedFile.name,
      };

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await supportTicketService.uploadAttachment(
        ticket.id!,
        fileToUpload,
        'Super Admin', // TODO: Get from auth context
        'Super Admin',
        description.trim() || undefined
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        Alert.alert(
          'Success',
          'Attachment uploaded successfully',
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
      }, 500);
    } catch (error: any) {
      console.error('Error uploading attachment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload attachment. Please try again.';
      Alert.alert('Upload Failed', errorMessage);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) return null;

  const isImage = selectedFile?.mimeType?.startsWith('image/');
  const isPDF = selectedFile?.mimeType === 'application/pdf';
  const fileSizeMB = selectedFile?.size ? (selectedFile.size / (1024 * 1024)).toFixed(2) : '0';

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
              <Text style={styles.headerTitle}>Upload Attachment</Text>
              <Text style={styles.headerSubtitle}>Ticket #{ticket.id}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                  <Text style={styles.metaText}>{ticket.status}</Text>
                </View>
              </View>
            </View>

            {/* File Picker */}
            {!selectedFile ? (
              <TouchableOpacity
                style={styles.filePicker}
                onPress={pickDocument}
                disabled={loading}
              >
                <Ionicons name="cloud-upload-outline" size={48} color="#3b82f6" />
                <Text style={styles.filePickerTitle}>Choose File</Text>
                <Text style={styles.filePickerSubtitle}>
                  Images (JPEG, PNG, GIF, WebP) or PDF
                </Text>
                <Text style={styles.filePickerLimit}>Maximum size: 10MB</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.filePreview}>
                {/* Preview */}
                <View style={styles.previewContainer}>
                  {isImage ? (
                    <Image source={{ uri: selectedFile.uri }} style={styles.imagePreview} />
                  ) : isPDF ? (
                    <View style={styles.pdfPreview}>
                      <Ionicons name="document-text" size={48} color="#ef4444" />
                      <Text style={styles.pdfLabel}>PDF</Text>
                    </View>
                  ) : (
                    <View style={styles.fileIcon}>
                      <Ionicons name="document" size={48} color="#6b7280" />
                    </View>
                  )}
                </View>

                {/* File Info */}
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={2}>
                    {selectedFile.name}
                  </Text>
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileSize}>{fileSizeMB} MB</Text>
                    <View style={styles.fileBadge}>
                      <Text style={styles.fileBadgeText}>
                        {isImage ? 'IMAGE' : isPDF ? 'PDF' : 'FILE'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Change File Button */}
                <TouchableOpacity
                  style={styles.changeFileButton}
                  onPress={pickDocument}
                  disabled={loading}
                >
                  <Ionicons name="swap-horizontal" size={20} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            )}

            {/* Description */}
            {selectedFile && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Add a description for this file..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                  editable={!loading}
                />
                <Text style={styles.characterCount}>{description.length}/200</Text>
              </View>
            )}

            {/* Upload Progress */}
            {loading && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
                </View>
                <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
              </View>
            )}

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>
                  • Supported formats: JPEG, PNG, GIF, WebP, PDF
                </Text>
                <Text style={styles.infoText}>
                  • Maximum file size: 10MB
                </Text>
                <Text style={styles.infoText}>
                  • Files are securely stored and accessible to all support staff
                </Text>
              </View>
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
                (!selectedFile || loading) && styles.submitButtonDisabled,
              ]}
              onPress={handleUpload}
              disabled={!selectedFile || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Upload</Text>
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
  filePicker: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#eff6ff',
  },
  filePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
  },
  filePickerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  filePickerLimit: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  previewContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  pdfPreview: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
  },
  pdfLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 4,
  },
  fileIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  fileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileSize: {
    fontSize: 12,
    color: '#6b7280',
  },
  fileBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fileBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1e40af',
  },
  changeFileButton: {
    padding: 8,
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
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
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
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 18,
    marginBottom: 2,
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

export default AttachmentUploadModal;
