import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from '../../../../components/toast';
import { createHub, updateHub } from '../api';
import { HubCreateRequest, HubStatus, HubSummary, HubUpdateRequest } from '../types';
import LocationPicker from './location-picker';

interface AddEditHubModalProps {
  visible: boolean;
  hub?: HubSummary | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEditHubModal({
  visible,
  hub,
  onClose,
  onSuccess,
}: AddEditHubModalProps) {
  const isEdit = !!hub;
  const [loading, setLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<HubStatus>(HubStatus.ACTIVE);

  // Initialize form with hub data if editing
  useEffect(() => {
    if (hub) {
      setCode(hub.code);
      setName(hub.name);
      setLocation(hub.location);
      setLatitude(hub.latitude);
      setLongitude(hub.longitude);
      setContactName(hub.contactName || '');
      setContactPhone(hub.contactPhone || '');
      setContactEmail(hub.contactEmail || '');
      setCity(hub.city || '');
      setRegion(hub.region || '');
      setAddress('');
      setStatus(hub.status);
    } else {
      resetForm();
    }
  }, [hub]);

  const resetForm = () => {
    setCode('');
    setName('');
    setLocation('');
    setLatitude(undefined);
    setLongitude(undefined);
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setCity('');
    setRegion('');
    setAddress('');
    setStatus(HubStatus.ACTIVE);
  };

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setLocation(addr);
    // Try to extract city from address
    const addressParts = addr.split(',').map(part => part.trim());
    if (addressParts.length >= 2) {
      setCity(addressParts[addressParts.length - 3] || '');
      setRegion(addressParts[addressParts.length - 2] || '');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      showToastMessage('Hub name is required', 'error');
      return;
    }

    if (!isEdit && !code.trim()) {
      showToastMessage('Hub code is required', 'error');
      return;
    }

    if (!location.trim()) {
      showToastMessage('Location is required', 'error');
      return;
    }

    setLoading(true);

    try {
      if (isEdit && hub) {
        // Update existing hub
        const updateData: HubUpdateRequest = {
          name: name.trim(),
          location: location.trim(),
          contactName: contactName.trim() || undefined,
          contactPhone: contactPhone.trim() || undefined,
          contactEmail: contactEmail.trim() || undefined,
          city: city.trim() || undefined,
          region: region.trim() || undefined,
          address: address.trim() || undefined,
          latitude,
          longitude,
          status,
        };
        await updateHub(hub.id, updateData);
        showToastMessage('Hub updated successfully', 'success');
      } else {
        // Create new hub
        const createData: HubCreateRequest = {
          code: code.trim(),
          name: name.trim(),
          location: location.trim(),
          contactName: contactName.trim() || undefined,
          contactPhone: contactPhone.trim() || undefined,
          contactEmail: contactEmail.trim() || undefined,
          city: city.trim() || undefined,
          region: region.trim() || undefined,
          address: address.trim() || undefined,
          latitude,
          longitude,
          status,
        };
        await createHub(createData);
        showToastMessage('Hub created successfully', 'success');
      }
      onSuccess();
      setTimeout(() => onClose(), 1000); // Delay close to show toast
    } catch (error) {
      showToastMessage(
        error instanceof Error ? error.message : 'Failed to save hub',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>{isEdit ? 'Edit Hub' : 'Add New Hub'}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Form */}
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Hub Code (only for new hubs) */}
          {!isEdit && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Hub Code <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="e.g., HUB001"
                autoCapitalize="characters"
              />
            </View>
          )}

          {/* Hub Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Hub Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Downtown Hub"
            />
          </View>

          {/* Location */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Location <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.locationInputContainer}>
              <TextInput
                style={[styles.input, styles.locationInput]}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g., 123 Main Street"
                multiline
                numberOfLines={2}
              />
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => setShowLocationPicker(true)}
              >
                <Ionicons name="map" size={24} color="#007AFF" />
                <Text style={styles.mapButtonText}>Pick on Map</Text>
              </TouchableOpacity>
            </View>
            {latitude && longitude && (
              <Text style={styles.coordinatesHint}>
                📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </Text>
            )}
          </View>

          {/* City */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="e.g., New York"
            />
          </View>

          {/* Region */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Region/State</Text>
            <TextInput
              style={styles.input}
              value={region}
              onChangeText={setRegion}
              placeholder="e.g., NY"
            />
          </View>

          {/* Address */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Complete address details"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Contact Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Contact Name</Text>
            <TextInput
              style={styles.input}
              value={contactName}
              onChangeText={setContactName}
              placeholder="e.g., John Doe"
            />
          </View>

          {/* Contact Phone */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Contact Phone</Text>
            <TextInput
              style={styles.input}
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="e.g., +1234567890"
              keyboardType="phone-pad"
            />
          </View>

          {/* Contact Email */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Contact Email</Text>
            <TextInput
              style={styles.input}
              value={contactEmail}
              onChangeText={setContactEmail}
              placeholder="e.g., contact@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Status Toggle */}
          <View style={styles.formGroup}>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Active Status</Text>
              <Switch
                value={status === HubStatus.ACTIVE}
                onValueChange={(value) =>
                  setStatus(value ? HubStatus.ACTIVE : HubStatus.INACTIVE)
                }
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={status === HubStatus.ACTIVE ? '#007AFF' : '#f4f3f4'}
              />
            </View>
            <Text style={styles.statusHint}>
              {status === HubStatus.ACTIVE ? 'Hub is active' : 'Hub is inactive'}
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEdit ? 'Update Hub' : 'Create Hub'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Toast Notification */}
        <Toast
          visible={showToast}
          message={toastMessage}
          type={toastType}
          onHide={() => setShowToast(false)}
        />
      </View>

      {/* Location Picker Modal */}
      <LocationPicker
        visible={showLocationPicker}
        initialLatitude={latitude}
        initialLongitude={longitude}
        initialAddress={location}
        onLocationSelect={handleLocationSelect}
        onClose={() => setShowLocationPicker(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 4,
  },
  placeholder: {
    width: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#d32f2f',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  locationInputContainer: {
    gap: 8,
  },
  locationInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  mapButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  coordinatesHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: 'monospace',
  },
});
