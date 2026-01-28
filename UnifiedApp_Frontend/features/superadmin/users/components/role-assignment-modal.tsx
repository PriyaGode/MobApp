import { ThemedText } from '@/components/superadmin/themed-text';
import { ThemedView } from '@/components/superadmin/themed-view';
import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { assignUserRole } from '../api';
import type { AccessLevel, RoleType, User } from '../types';

interface RoleAssignmentModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: (updatedUser: User) => void;
}

const ROLE_OPTIONS: { value: RoleType; label: string }[] = [
  { value: 'CUSTOMER' as RoleType, label: 'Customer' },
  { value: 'HUB_ADMIN' as RoleType, label: 'Hub Admin' },
  { value: 'DELIVERY_PARTNER' as RoleType, label: 'Delivery Partner' },
];

const ACCESS_LEVEL_OPTIONS: { value: AccessLevel; label: string }[] = [
  { value: 'READ' as AccessLevel, label: 'Read' },
  { value: 'WRITE' as AccessLevel, label: 'Write' },
  { value: 'ADMIN' as AccessLevel, label: 'Admin' },
];

export function RoleAssignmentModal({
  visible,
  user,
  onClose,
  onSuccess,
}: RoleAssignmentModalProps) {
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<AccessLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize values when user changes
  useState(() => {
    if (user) {
      setSelectedRole(user.role);
      setSelectedAccessLevel(user.accessLevel);
      setError(null);
      setSuccessMessage(null);
    }
  });

  const handleConfirm = async () => {
    if (!user || !selectedRole || !selectedAccessLevel) {
      setError('Please select both role and access level');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await assignUserRole(user.id, {
        role: selectedRole,
        accessLevel: selectedAccessLevel,
      });

      setSuccessMessage('Role updated successfully!');
      setTimeout(() => {
        onSuccess(updatedUser);
        onClose();
        setSuccessMessage(null);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  if (!user) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                Assign Role
              </ThemedText>
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {/* User Name (Readonly) */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>User Name</ThemedText>
              <View style={styles.readonlyField}>
                <ThemedText style={styles.readonlyText}>{user.fullName}</ThemedText>
              </View>
              <ThemedText style={styles.helper}>User ID: {user.userId}</ThemedText>
            </View>

            {/* Role Dropdown */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Role *</ThemedText>
              <View style={styles.optionsGroup}>
                {ROLE_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.optionButton,
                      selectedRole === option.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => setSelectedRole(option.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedRole === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Access Level Toggle */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Access Level *</ThemedText>
              <View style={styles.optionsGroup}>
                {ACCESS_LEVEL_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.optionButton,
                      selectedAccessLevel === option.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => setSelectedAccessLevel(option.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedAccessLevel === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Success Message */}
            {successMessage && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.confirmButton, loading && styles.buttonDisabled]}
                onPress={handleConfirm}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#687076',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#11181C',
  },
  helper: {
    fontSize: 12,
    color: '#687076',
    marginTop: 4,
  },
  readonlyField: {
    padding: 12,
    backgroundColor: '#f4f4f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  readonlyText: {
    fontSize: 16,
    color: '#687076',
  },
  optionsGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d0d5dd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: '#0a7ea4',
    backgroundColor: '#e6f4f8',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#687076',
  },
  optionTextSelected: {
    color: '#0a7ea4',
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 16,
  },
  errorText: {
    color: '#b42318',
    fontSize: 14,
  },
  successContainer: {
    padding: 12,
    backgroundColor: '#ecfdf3',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a6f4c5',
    marginBottom: 16,
  },
  successText: {
    color: '#067647',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d5dd',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
  confirmButton: {
    backgroundColor: '#11181C',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
