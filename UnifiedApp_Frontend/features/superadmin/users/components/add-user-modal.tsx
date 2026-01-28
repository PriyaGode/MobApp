import { SimplePhoneInput, validatePhoneNumber } from '@/components/superadmin/simple-phone-input';
import { ThemedText } from '@/components/superadmin/themed-text';
import { formatEmail, validateEmail, suggestEmailCorrection } from '@/utils/validation';
import { useState } from 'react';
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
import { createUser } from '../api';
import type { User } from '../types';
import { AccessLevel, getAccessLevelDisplayName, getRoleDisplayName, RoleType } from '../types';

interface AddUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  hubs: Array<{ id: string; code: string; name: string }>;
}

export function AddUserModal({ visible, onClose, onSuccess, hubs }: AddUserModalProps) {
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
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});

  const roles = [
    RoleType.SUPER_ADMIN,
    RoleType.HUB_ADMIN,
    RoleType.DELIVERY_PARTNER,
    RoleType.CUSTOMER,
  ];

  const accessLevels = [AccessLevel.READ, AccessLevel.WRITE, AccessLevel.ADMIN];

  // Hub is required for HUB_ADMIN and DELIVERY_PARTNER
  const isHubRequired = role === RoleType.HUB_ADMIN || role === RoleType.DELIVERY_PARTNER;

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
    const errors: { email?: string; phone?: string } = {};
    
    if (!fullName.trim()) return 'Full name is required';
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error!;
    }
    
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error!;
    }
    
    setValidationErrors(errors);
    
    if (errors.email) return errors.email;
    if (errors.phone) return errors.phone;
    if (isHubRequired && !hubId) return 'Hub assignment is required for this role';
    return null;
  };
  
  const handleEmailChange = (text: string) => {
    setEmail(text);
    setValidationErrors(prev => ({ ...prev, email: undefined }));
    
    // Check for email suggestions
    const suggestion = suggestEmailCorrection(text);
    setEmailSuggestion(suggestion);
  };
  
  const handlePhoneChange = (text: string) => {
    setPhone(text);
    setValidationErrors(prev => ({ ...prev, phone: undefined }));
  };
  
  const applySuggestion = () => {
    if (emailSuggestion) {
      setEmail(emailSuggestion);
      setEmailSuggestion(null);
    }
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    setLoading(true);
    try {
      const newUser = await createUser({
        fullName: fullName.trim(),
        email: formatEmail(email),
        phone: phone.trim(),
        role,
        accessLevel,
        hubId: isHubRequired ? hubId : undefined,
      });

      Alert.alert('Success', 'User created successfully');
      onSuccess(newUser);
      resetForm();
      onClose();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setRole(RoleType.CUSTOMER);
    setAccessLevel(AccessLevel.READ);
    setHubId('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>Add New User</ThemedText>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          {/* Form */}
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
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

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, validationErrors.email && styles.inputError]}
                placeholder="user@example.com"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
              />
              {validationErrors.email && (
                <Text style={styles.errorText}>{validationErrors.email}</Text>
              )}
              {emailSuggestion && (
                <Pressable style={styles.suggestionContainer} onPress={applySuggestion}>
                  <Text style={styles.suggestionText}>
                    Did you mean: <Text style={styles.suggestionEmail}>{emailSuggestion}</Text>?
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Phone */}
            <View style={styles.field}>
              <Text style={styles.label}>Phone Number *</Text>
              <SimplePhoneInput
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="Enter phone number"
                error={!!validationErrors.phone}
              />
              {validationErrors.phone && (
                <Text style={styles.errorText}>{validationErrors.phone}</Text>
              )}
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
                <Text style={styles.submitButtonText}>Create User</Text>
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
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  suggestionContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  suggestionText: {
    fontSize: 13,
    color: '#92400e',
  },
  suggestionEmail: {
    fontWeight: '600',
    color: '#0a7ea4',
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
