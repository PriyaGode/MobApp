import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API } from "../../config/apiConfig";
import { AuthContext } from "../../contexts/AuthContext";

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  const formatPhoneForDisplay = (phone) => {
    if (!phone) return '';
    
    // If phone already has country code, format it nicely
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // If it's just digits, assume it needs formatting
    if (phone.length === 10) {
      return `+1 ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
    }
    
    return phone;
  };

  const fetchProfile = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API.GET_USER_PROFILE(user.userId));
      const data = await response.json();

      if (response.ok) {
        setProfileData({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: formatPhoneForDisplay(data.phone) || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#F4B400" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>

      {/* PROFILE INFO */}
      <View style={styles.profileSection}>
        <View style={styles.profileAvatar}>
          <Icon name="account" size={40} color="#2E7D32" />
        </View>
        <Text style={styles.name}>{profileData.fullName || 'Suresh Kumar'}</Text>
        <Text style={styles.subText}>{profileData.email || 'suresh.kumar@email.com'}</Text>
        {profileData.phone ? (
          <Text style={styles.subText}>{profileData.phone}</Text>
        ) : (
          <TouchableOpacity 
            style={styles.addPhoneButton} 
            onPress={() => navigation.navigate("EditProfile" as never)}
          >
            <Icon name="plus" size={16} color="#F4B400" />
            <Text style={styles.addPhoneText}>Add Phone Number</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("EditProfile" as never)}>
          <Icon name="pencil-outline" size={18} color="#000" />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* DIVIDER */}
      <View style={styles.divider} />

      {/* MAIN OPTIONS */}
      <View style={styles.card}>
        <OptionRow icon="map-marker-outline" label="Manage Addresses" onPress={() => navigation.navigate("ManageAddresses" as never)} />
        <RowDivider />
        <OptionRow icon="credit-card-outline" label="Payment Methods" onPress={() => navigation.navigate("Wallet" as never)} />
        <RowDivider />
        <OptionRow icon="clipboard-text-outline" label="Order History" onPress={() => navigation.navigate("OrderHistory" as never)} />
      </View>

      {/* NOTIFICATIONS */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <IconCircle icon="bell-outline" />
            <View style={styles.textBlock}>
              <Text style={styles.rowText}>Push Notifications</Text>
              <Text style={styles.rowSubText}>
                For order updates and offers
              </Text>
            </View>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ true: '#F4B400', false: '#DADADA' }}
            thumbColor="#FFF"
          />
        </View>

        <RowDivider />

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <IconCircle icon="email-outline" />
            <View style={styles.textBlock}>
              <Text style={styles.rowText}>Email Marketing</Text>
              <Text style={styles.rowSubText}>
                Receive promotional emails
              </Text>
            </View>
          </View>
          <Switch
            value={emailEnabled}
            onValueChange={setEmailEnabled}
            trackColor={{ true: '#F4B400', false: '#DADADA' }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      {/* HELP */}
      <View style={styles.card}>
        <OptionRow icon="help-circle-outline" label="Help & Support" onPress={() => navigation.navigate('HelpSupport' as never)} />
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#E53935" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      </View>
    </View>
  );
};

/* ---------- COMPONENTS ---------- */

const OptionRow = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <View style={styles.rowLeft}>
      <IconCircle icon={icon} />
      <Text style={styles.rowText}>{label}</Text>
    </View>
    <Icon name="chevron-right" size={22} color="#9E9E9E" />
  </TouchableOpacity>
);

const IconCircle = ({ icon }) => (
  <View style={styles.iconCircle}>
    <Icon name={icon} size={20} color="#2E7D32" />
  </View>
);

const RowDivider = () => <View style={styles.rowDivider} />;

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#FAFAFA',
  },

  /* PROFILE */
  profileSection: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  subText: {
    fontSize: 15,
    color: '#9E9E9E',
    marginTop: 3,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    marginTop: 10,
  },
  editText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
  },
  addPhoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  addPhoneText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#F4B400',
  },

  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },

  /* CARDS */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textBlock: {
    marginLeft: 12,
  },
  rowText: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
  },
  rowSubText: {
    fontSize: 13,
    color: '#9E9E9E',
    marginTop: 2,
  },

  rowDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginLeft: 68,
  },

  /* ICON CIRCLE */
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  /* LOGOUT */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E53935',
    borderRadius: 28,
    paddingVertical: 12,
    marginTop: 16,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#E53935',
  },
});

export default ProfileScreen;