import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface LocationPickerProps {
  visible: boolean;
  initialLatitude?: number;
  initialLongitude?: number;
  initialAddress?: string;
  onLocationSelect: (latitude: number, longitude: number, address: string) => void;
  onClose: () => void;
}

export default function LocationPicker({
  visible,
  initialLatitude,
  initialLongitude,
  initialAddress,
  onLocationSelect,
  onClose,
}: LocationPickerProps) {
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: initialLatitude || 37.78825,
    longitude: initialLongitude || -122.4324,
  });

  const [address, setAddress] = useState(initialAddress || '');
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [manualLat, setManualLat] = useState(initialLatitude?.toString() || '');
  const [manualLng, setManualLng] = useState(initialLongitude?.toString() || '');

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0) {
        const location = result[0];
        const fullAddress = [
          location.name,
          location.street,
          location.city,
          location.region,
          location.country,
        ]
          .filter(Boolean)
          .join(', ');
        setAddress(fullAddress);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) {
      Alert.alert('Error', 'Please enter a location to search');
      return;
    }

    try {
      setLoading(true);
      const results = await Location.geocodeAsync(searchText);
      if (results.length > 0) {
        const location = results[0];
        setMarkerCoordinate({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        setManualLat(location.latitude.toString());
        setManualLng(location.longitude.toString());
        reverseGeocode(location.latitude, location.longitude);
      } else {
        Alert.alert('Not Found', 'Location not found. Please try a different search.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search location');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Error', 'Please enter valid coordinates');
      return;
    }

    if (lat < -90 || lat > 90) {
      Alert.alert('Error', 'Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      Alert.alert('Error', 'Longitude must be between -180 and 180');
      return;
    }

    setMarkerCoordinate({ latitude: lat, longitude: lng });
    reverseGeocode(lat, lng);
  };

  const handleConfirm = () => {
    if (!address) {
      Alert.alert('Error', 'Please search for a location or enter coordinates');
      return;
    }
    onLocationSelect(markerCoordinate.latitude, markerCoordinate.longitude, address);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Select Location</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search for a location..."
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Ionicons name="search" size={24} color="#007AFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Web Fallback */}
        <View style={styles.map}>
          <View style={styles.webFallback}>
            <Ionicons name="map-outline" size={64} color="#ccc" />
            <Text style={styles.webFallbackTitle}>Interactive Map on Mobile Only</Text>
            <Text style={styles.webFallbackText}>
              The interactive map picker is available in the Expo Go mobile app.
            </Text>
            <Text style={styles.webFallbackText}>
              On web, you can search for a location above or enter coordinates manually below.
            </Text>

            {/* Manual Coordinate Entry */}
            <View style={styles.manualInputContainer}>
              <Text style={styles.manualInputLabel}>Manual Coordinates</Text>
              <View style={styles.coordinateInputRow}>
                <View style={styles.coordinateInputGroup}>
                  <Text style={styles.inputLabel}>Latitude (-90 to 90)</Text>
                  <TextInput
                    style={styles.coordinateInput}
                    value={manualLat}
                    onChangeText={setManualLat}
                    placeholder="37.7749"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.coordinateInputGroup}>
                  <Text style={styles.inputLabel}>Longitude (-180 to 180)</Text>
                  <TextInput
                    style={styles.coordinateInput}
                    value={manualLng}
                    onChangeText={setManualLng}
                    placeholder="-122.4194"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleManualCoordinates}
                disabled={loading}
              >
                <Text style={styles.applyButtonText}>Apply Coordinates</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Address Display */}
        <View style={styles.addressContainer}>
          <View style={styles.addressHeader}>
            <Ionicons name="location-sharp" size={24} color="#007AFF" />
            <Text style={styles.addressTitle}>Selected Location</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <>
              <Text style={styles.address}>
                {address || 'Search for a location or enter coordinates'}
              </Text>
              <View style={styles.coordinates}>
                <Text style={styles.coordinateText}>
                  Lat: {markerCoordinate.latitude.toFixed(6)}
                </Text>
                <Text style={styles.coordinateText}>
                  Long: {markerCoordinate.longitude.toFixed(6)}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  confirmButton: {
    padding: 4,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  searchButton: {
    padding: 10,
  },
  map: {
    flex: 1,
  },
  addressContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  address: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  coordinates: {
    flexDirection: 'row',
    gap: 16,
  },
  coordinateText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 32,
  },
  webFallbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  webFallbackText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  manualInputContainer: {
    marginTop: 24,
    width: '100%',
    maxWidth: 500,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  manualInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  coordinateInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  coordinateInputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  coordinateInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  applyButton: {
    marginTop: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
