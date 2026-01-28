import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Lightweight tab switcher to expose tab titles when user is on a stacked detail screen.
// Shows all 7 tabs: Home, Teammate's tabs (Orders, Tickets, Products), Your tabs (Hubs, Users, Profile)
export function AdminTabSwitcher() {
  const navigation: any = useNavigation();
  const tabs: { name: string; label: string }[] = [
    { name: 'index', label: 'Home' },
    { name: 'orders', label: 'Orders' },
    { name: 'tickets', label: 'Tickets' },
    { name: 'explore', label: 'Products' },
    { name: 'hubs', label: 'Hubs' },
    { name: 'users', label: 'Users' },
    { name: 'profile', label: 'Profile' },
  ];

  return (
    <View style={styles.wrapper}>
      {tabs.map(t => (
        <TouchableOpacity
          key={t.name}
          style={styles.tabButton}
          onPress={() => navigation.navigate(t.name)}
          accessibilityRole="button"
        >
          <Text style={styles.tabLabel}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 10,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB'
  }
});

export default AdminTabSwitcher;