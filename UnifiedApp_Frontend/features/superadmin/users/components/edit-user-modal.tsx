import { ThemedText } from '@/components/superadmin/themed-text';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { updateUser } from '../api';
import type { User } from '../types';
import { AccessLevel, getAccessLevelDisplayName, getRoleDisplayName, RoleType } from '../types';

interface EditUserModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: (user: User) => void;
  hubs: Array<{ id: string; code: string; name: string }>;
}

export function EditUserModal({ visible, user, onClose, onSuccess, hubs }: EditUserModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<RoleType>(RoleType.CUSTOMER);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(AccessLevel.READ);
  const [hubId, setHubId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showAccessPicker, setShowAccessPicker] = useState(false);
  const [showHubPicker, setShowHubPicker] = useState(false);

  const roles = [
    RoleType.SUPER_ADMIN,
    RoleType.HUB_ADMIN,
    RoleType.DELIVERY_PARTNER,
    RoleType.CUSTOMER,
  ];

  const accessLevels = [AccessLevel.READ, AccessLevel.WRITE, AccessLevel.ADMIN];

  // Hub is required for HUB_ADMIN and DELIVERY_PARTNER
  const isHubRequired = role === RoleType.HUB_ADMIN || role === RoleType.DELIVERY_PARTNER;

  // Pre-fill form when user changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(''); // Email not available in UserSummaryResponse
      setPhone(''); // Phone not available in UserSummaryResponse
      setRole(user.role);
      setAccessLevel(user.accessLevel);
      // Find hub ID from hub code if available
      const foundHub = hubs.find((h) => h.code === user.assignedHubCode);
      setHubId(foundHub?.id || '');
    }
  }, [user, hubs]);

  const handleRoleChange = (newRole: RoleType) => {
    setRole(newRole);
    // Auto-set access level based on role
    switch (newRole) {
      case RoleType.SUPER_ADMIN:
      case RoleType.HUB_ADMIN:
        setAccessLevel(AccessLevel.ADMIN);
        break;
      case RoleType.DELIVERY_PARTNER:
        setAccessLevel(AccessLevel.WRITE);
        break;
      case RoleType.CUSTOMER:
        setAccessLevel(AccessLevel.READ);
        break;
    }
    setShowRolePicker(false);
  };

  const validateForm = (): string | null => {
    if (!fullName.trim()) return 'Full name is required';
    if (isHubRequired && !hubId) return 'Hub assignment is required for this role';
    return null;
  };

  const handleSubmit = async () => {
    if (!user) return;

    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await updateUser(user.id, {
        fullName: fullName.trim(),
        role,
        accessLevel,
        hubId: isHubRequired ? hubId : undefined,
      });

      Alert.alert('Success', 'User updated successfully');
      onSuccess(updatedUser);
      onClose();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!user) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>Edit User</ThemedText>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          {/* Form */}
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* User ID (readonly) */}
            <View style={styles.field}>
              <Text style={styles.label}>User ID</Text>
              <View style={styles.readonlyField}>
                <Text style={styles.readonlyText}>{user.userId}</Text>
              </View>
            </View>

            {/* Full Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Role Picker */}
            <View style={styles.field}>
              <Text style={styles.label}>Role *</Text>
              <Pressable style={styles.picker} onPress={() => setShowRolePicker(!showRolePicker)}>
                <Text style={styles.pickerText}>{getRoleDisplayName(role)}</Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </Pressable>
              {showRolePicker && (
                <View style={styles.pickerDropdown}>
                  {roles.map((r) => (
                    <Pressable
                      key={r}
                      style={styles.pickerOption}
                      onPress={() => handleRoleChange(r)}
                    >
                      <Text style={[styles.pickerOptionText, r === role && styles.pickerOptionTextActive]}>
                        {getRoleDisplayName(r)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Access Level Picker */}
            <View style={styles.field}>
              <Text style={styles.label}>Access Level *</Text>
              <Pressable style={styles.picker} onPress={() => setShowAccessPicker(!showAccessPicker)}>
                <Text style={styles.pickerText}>{getAccessLevelDisplayName(accessLevel)}</Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </Pressable>
              {showAccessPicker && (
                <View style={styles.pickerDropdown}>
                  {accessLevels.map((level) => (
                    <Pressable
                      key={level}
                      style={styles.pickerOption}
                      onPress={() => {
                        setAccessLevel(level);
                        setShowAccessPicker(false);
                      }}
                    >
                      <Text style={[styles.pickerOptionText, level === accessLevel && styles.pickerOptionTextActive]}>
                        {getAccessLevelDisplayName(level)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Hub Picker (conditionally shown) */}
            {isHubRequired && (
              <View style={styles.field}>
                <Text style={styles.label}>Assigned Hub *</Text>
                <Pressable style={styles.picker} onPress={() => setShowHubPicker(!showHubPicker)}>
                  <Text style={styles.pickerText}>
                    {hubId
                      ? hubs.find((h) => h.id === hubId)?.name || 'Select Hub'
                      : 'Select Hub'}
                  </Text>
                  <Text style={styles.pickerArrow}>▼</Text>
                </Pressable>
                {showHubPicker && (
                  <View style={styles.pickerDropdown}>
                    {hubs.map((hub) => (
                      <Pressable
                        key={hub.id}
                        style={styles.pickerOption}
                        onPress={() => {
                          setHubId(hub.id);
                          setShowHubPicker(false);
                        }}
                      >
                        <Text style={[styles.pickerOptionText, hub.id === hubId && styles.pickerOptionTextActive]}>
                          {hub.name} ({hub.code})
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Current Status */}
            <View style={styles.field}>
              <Text style={styles.label}>Current Status</Text>
              <View style={styles.readonlyField}>
                <Text style={[
                  styles.statusBadgeText,
                  user.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive
                ]}>
                  {user.status}
                </Text>
              </View>
              <Text style={styles.helperText}>
                Use the Activate/Deactivate option from the menu to change status
              </Text>
            </View>

            {/* Info Text */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                {isHubRequired
                  ? '* Hub assignment is required for this role'
                  : '* Hub assignment is optional for this role'}
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Pressable style={styles.cancelButton} onPress={handleClose} disabled={loading}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Save Changes</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eceef0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
  formContainer: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  readonlyField: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  readonlyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  picker: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  pickerText: {
    fontSize: 16,
    color: '#374151',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#687076',
  },
  pickerDropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  pickerOptionTextActive: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusActive: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  infoBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eceef0',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#687076',
  },
  submitButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
