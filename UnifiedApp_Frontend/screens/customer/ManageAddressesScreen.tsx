import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { API } from "../../config/apiConfig";
import { AuthContext } from "../../contexts/AuthContext";
import { colors, typography } from "../themeTokens";

const DEFAULT_ADDRESS_KEY = 'user_default_address_id';

interface SavedAddress {
  id: number;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  isDefault: boolean;
}

export default function ManageAddressesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (!loading && addresses.length === 0) {
      setShowAddForm(true);
    }
  }, [loading, addresses.length]);

  const fetchAddresses = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API.GET_USER_ADDRESSES(user.userId));
      const data = await response.json();

      if (response.ok) {
        const storedDefaultId = await AsyncStorage.getItem(`${DEFAULT_ADDRESS_KEY}_${user.userId}`);
        const defaultId = storedDefaultId ? parseInt(storedDefaultId) : null;

        const addressesWithDefault = data.map((addr: SavedAddress, index: number) => ({
          ...addr,
          isDefault: defaultId ? addr.id === defaultId : index === 0
        }));

        setAddresses(addressesWithDefault);
      } else {
        Alert.alert("Error", data.error || "Failed to load addresses");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.label || !newAddress.addressLine1 || !newAddress.city ||
        !newAddress.state || !newAddress.zipCode) {
      Alert.alert("Missing Information", "Please fill in all required fields (marked with *)");
      return;
    }

    if (!user?.userId) {
      Alert.alert("Error", "Please login to add address");
      return;
    }

    try {
      setSaving(true);
      const addressData = {
        ...newAddress,
        country: "USA",
        isDefault: addresses.length === 0,
      };

      const response = await fetch(API.CREATE_ADDRESS(user.userId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      const data = await response.json();

      if (response.ok) {
        setAddresses([...addresses, data]);
        setShowAddForm(false);
        setNewAddress({
          label: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          zipCode: "",
        });
        Alert.alert("Success", "Address added successfully");
      } else {
        Alert.alert("Error", data.error || data.message || "Failed to add address");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    if (!user?.userId) return;

    try {
      await AsyncStorage.setItem(`${DEFAULT_ADDRESS_KEY}_${user.userId}`, id.toString());

      await fetch(API.SET_DEFAULT_ADDRESS(user.userId, id), {
        method: "PATCH",
      });

      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        }))
      );

      Alert.alert("Success", "Default address updated");
    } catch (error) {
      Alert.alert("Error", "Failed to set default address");
    }
  };

  const handleDeleteAddress = async (id: number) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!user?.userId) return;

            try {
              const response = await fetch(API.DELETE_ADDRESS(user.userId, id), {
                method: "DELETE",
              });

              const data = await response.json();

              if (response.ok) {
                setAddresses(addresses.filter((addr) => addr.id !== id));
                Alert.alert("Success", "Address deleted successfully");
              } else {
                Alert.alert("Error", data.error || "Failed to delete address");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete address");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: 20, paddingBottom: 80, paddingHorizontal: 16 }}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>{showAddForm ? "Add New Address" : "Your Addresses"}</Text>

      {addresses.length === 0 && !showAddForm && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No addresses saved yet</Text>
          <Text style={styles.emptyStateSubtext}>Add your first delivery address</Text>
        </View>
      )}

      {!showAddForm && addresses.map((address) => (
        <View key={address.id.toString()} style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressLabel}>{address.label}</Text>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>DEFAULT</Text>
              </View>
            )}
          </View>

          <Text style={styles.addressText}>{address.addressLine1}</Text>
          {address.addressLine2 && (
            <Text style={styles.addressText}>{address.addressLine2}</Text>
          )}
          <Text style={styles.addressText}>
            {address.city}, {address.state} {address.zipCode}
          </Text>

          <View style={styles.actionButtons}>
            {!address.isDefault && (
              <TouchableOpacity
                style={styles.defaultButton}
                onPress={() => handleSetDefault(address.id)}
              >
                <Text style={styles.defaultButtonText}>Set as Default</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteAddress(address.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {!showAddForm ? (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Text style={styles.addButtonText}>+ Add New Address</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.addForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Label (e.g., Home, Work) *</Text>
            <TextInput
              style={styles.input}
              value={newAddress.label}
              onChangeText={(text) => setNewAddress({ ...newAddress, label: text })}
              placeholder="Home"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address Line 1 *</Text>
            <TextInput
              style={styles.input}
              value={newAddress.addressLine1}
              onChangeText={(text) => setNewAddress({ ...newAddress, addressLine1: text })}
              placeholder="123 Main St"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address Line 2</Text>
            <TextInput
              style={styles.input}
              value={newAddress.addressLine2}
              onChangeText={(text) => setNewAddress({ ...newAddress, addressLine2: text })}
              placeholder="Apt, Suite, Floor (optional)"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={newAddress.city}
                onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
                placeholder="New York"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                value={newAddress.state}
                onChangeText={(text) => setNewAddress({ ...newAddress, state: text })}
                placeholder="NY"
                placeholderTextColor={colors.textSecondary}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ZIP Code *</Text>
            <TextInput
              style={styles.input}
              value={newAddress.zipCode}
              onChangeText={(text) => setNewAddress({ ...newAddress, zipCode: text })}
              placeholder="10001"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleAddAddress}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : "Save Address"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  addressCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addressLabel: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: colors.primary + "20",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  defaultText: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: "Roboto-Medium",
  },
  addressText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  defaultButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
  },
  defaultButtonText: {
    ...typography.small,
    color: colors.primary,
    fontFamily: "Roboto-Medium",
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: "center",
  },
  deleteButtonText: {
    ...typography.small,
    color: colors.error,
    fontFamily: "Roboto-Medium",
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  addButtonText: {
    ...typography.button,
    color: colors.background,
  },
  addForm: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    marginTop: 0,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  formTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 24,
    fontSize: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: 'bold',
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 8,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
  },
  formButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.background,
  },
  emptyState: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateText: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
});
