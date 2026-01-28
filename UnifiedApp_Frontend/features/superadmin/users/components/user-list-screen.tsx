import { ThemedText } from '@/components/superadmin/themed-text';
import { ThemedView } from '@/components/superadmin/themed-view';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { fetchUsers, updateUserStatus } from '../api';
import type { User } from '../types';
import { getAccessLevelDisplayName, getRoleDisplayName, UserStatus } from '../types';
import { AddUserModal } from './add-user-modal';
import { EditUserModal } from './edit-user-modal';
import { LoginHistoryModal } from './login-history-modal';
import { RoleAssignmentModal } from './role-assignment-modal';

export function UserListScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loginHistoryModalVisible, setLoginHistoryModalVisible] = useState(false);
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<User | null>(null);
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'fullName' | 'lastLogin'>('fullName');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [editUserModalVisible, setEditUserModalVisible] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [hubs] = useState([
    { id: '1', code: 'HUB-001', name: 'Central Hub' },
    { id: '2', code: 'HUB-002', name: 'West Hub' },
    { id: '3', code: 'HUB-003', name: 'East Hub' },
  ]);

  const loadUsers = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);

      const response = await fetchUsers({
        page: pageNum,
        size: 20,
        search: searchQuery || undefined,
        sort: sortBy,
        direction: sortDirection,
      });

      if (append) {
        setUsers((prev) => [...prev, ...response.content]);
      } else {
        setUsers(response.content);
      }
      
      setHasMore(response.hasNext);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, sortBy, sortDirection]);

  useEffect(() => {
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      loadUsers();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [loadUsers]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers(0, false);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadUsers(page + 1, true);
    }
  };

  const handleOpenRoleModal = (user: User) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleRoleAssignmentSuccess = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    setModalVisible(false);
    setSelectedUser(null);
  };

  const handleOpenLoginHistory = (user: User) => {
    setSelectedUserForHistory(user);
    setLoginHistoryModalVisible(true);
  };

  const handleAddUserSuccess = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    setAddUserModalVisible(false);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUserForEdit(user);
    setEditUserModalVisible(true);
    setOpenMenuUserId(null);
  };

  const handleEditUserSuccess = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    setEditUserModalVisible(false);
    setSelectedUserForEdit(null);
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    const action = newStatus === UserStatus.ACTIVE ? 'activate' : 'deactivate';
    
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} ${user.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: newStatus === UserStatus.INACTIVE ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const updatedUser = await updateUserStatus(user.id, newStatus);
              setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? updatedUser : u))
              );
              Alert.alert('Success', `User ${action}d successfully`);
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : `Failed to ${action} user`);
            }
          },
        },
      ]
    );
    setOpenMenuUserId(null);
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <ThemedText style={styles.userName}>{item.fullName}</ThemedText>
          <View style={[
            styles.statusBadge,
            item.status === UserStatus.ACTIVE ? styles.statusActive : styles.statusInactive,
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <ThemedText style={styles.userId}>ID: {item.userId}</ThemedText>
        
        <View style={styles.userDetails}>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Role:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {getRoleDisplayName(item.role)}
            </ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Access:</ThemedText>
            <View style={styles.accessBadge}>
              <Text style={styles.accessText}>
                {getAccessLevelDisplayName(item.accessLevel)}
              </Text>
            </View>
          </View>
          
          {item.assignedHubName && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Hub:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {item.assignedHubName} ({item.assignedHubCode})
              </ThemedText>
            </View>
          )}
          
          {item.lastLogin && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Last Login:</ThemedText>
              <Pressable
                onPress={() => {
                  if (item.lastLoginIp || item.lastLoginDevice) {
                    Alert.alert(
                      'Login Details',
                      `IP: ${item.lastLoginIp || 'N/A'}\nDevice: ${item.lastLoginDevice || 'N/A'}`,
                      [{ text: 'OK' }]
                    );
                  }
                }}
              >
                <ThemedText style={[styles.detailValue, styles.lastLoginText]}>
                  {new Date(item.lastLogin).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {(item.lastLoginIp || item.lastLoginDevice) && (
                    <Text style={styles.infoIcon}> ℹ️</Text>
                  )}
                </ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Ellipsis Menu Button */}
      <View>
        <Pressable
          style={styles.menuButton}
          onPress={() => setOpenMenuUserId(openMenuUserId === item.id ? null : item.id)}
        >
          <Text style={styles.menuIcon}>⋮</Text>
        </Pressable>

        {/* Dropdown Menu */}
        {openMenuUserId === item.id && (
          <View style={styles.menuDropdown}>
            <Pressable
              style={styles.menuItem}
              onPress={() => handleOpenEditModal(item)}
            >
              <Text style={styles.menuItemText}>Edit User</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                handleOpenRoleModal(item);
                setOpenMenuUserId(null);
              }}
            >
              <Text style={styles.menuItemText}>Assign Role</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => handleToggleStatus(item)}
            >
              <Text style={styles.menuItemText}>
                {item.status === UserStatus.ACTIVE ? 'Deactivate' : 'Activate'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                handleOpenLoginHistory(item);
                setOpenMenuUserId(null);
              }}
            >
              <Text style={styles.menuItemText}>View Login History</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>No users found</ThemedText>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color="#0a7ea4" />
      </View>
    );
  };

  if (loading && users.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>Loading users...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error && users.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <Pressable style={styles.retryButton} onPress={() => loadUsers()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText type="title" style={styles.headerTitle}>User Management</ThemedText>
          <ThemedText style={styles.subtitle}>
            {users.length} user{users.length !== 1 ? 's' : ''}
          </ThemedText>
        </View>
        <Pressable style={styles.addButton} onPress={() => setAddUserModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add User</Text>
        </Pressable>
      </View>

      {/* Search and Sort Controls */}
      <View style={styles.controls}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ID, or role..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#687076"
        />
        <View style={styles.sortControls}>
          <Pressable
            style={[styles.sortButton, sortBy === 'fullName' && styles.sortButtonActive]}
            onPress={() => setSortBy('fullName')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'fullName' && styles.sortButtonTextActive]}>
              Name
            </Text>
          </Pressable>
          <Pressable
            style={[styles.sortButton, sortBy === 'lastLogin' && styles.sortButtonActive]}
            onPress={() => setSortBy('lastLogin')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'lastLogin' && styles.sortButtonTextActive]}>
              Last Login
            </Text>
          </Pressable>
          <Pressable
            style={styles.sortDirectionButton}
            onPress={() => setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC')}
          >
            <Text style={styles.sortDirectionText}>{sortDirection === 'ASC' ? '↑' : '↓'}</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <RoleAssignmentModal
        visible={modalVisible}
        user={selectedUser}
        onClose={() => {
          setModalVisible(false);
          setSelectedUser(null);
        }}
        onSuccess={handleRoleAssignmentSuccess}
      />

      <LoginHistoryModal
        visible={loginHistoryModalVisible}
        userId={selectedUserForHistory?.id ?? null}
        userName={selectedUserForHistory?.fullName ?? null}
        onClose={() => {
          setLoginHistoryModalVisible(false);
          setSelectedUserForHistory(null);
        }}
      />

      <AddUserModal
        visible={addUserModalVisible}
        onClose={() => setAddUserModalVisible(false)}
        onSuccess={handleAddUserSuccess}
        hubs={hubs}
      />

      <EditUserModal
        visible={editUserModalVisible}
        user={selectedUserForEdit}
        onClose={() => {
          setEditUserModalVisible(false);
          setSelectedUserForEdit(null);
        }}
        onSuccess={handleEditUserSuccess}
        hubs={hubs}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3ED',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#F7F3ED',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5C84C',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#1E1407',
    fontSize: 14,
    fontWeight: '600',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: '#1E1407',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 4,
    color: '#70614F',
    fontSize: 14,
  },
  controls: {
    padding: 16,
    backgroundColor: '#F7F3ED',
  },
  searchInput: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8E1D7',
    marginBottom: 12,
    color: '#1E1407',
  },
  sortControls: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E1D7',
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#F5C84C',
    borderColor: '#F5C84C',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#70614F',
  },
  sortButtonTextActive: {
    color: '#1E1407',
  },
  sortDirectionButton: {
    width: 44,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E1D7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortDirectionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F5C84C',
  },
  listContent: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E1D7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    color: '#1E1407',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusActive: {
    backgroundColor: '#ecfdf3',
  },
  statusInactive: {
    backgroundColor: '#f4f4f5',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E1407',
    textTransform: 'uppercase',
  },
  userId: {
    fontSize: 13,
    color: '#70614F',
    marginBottom: 12,
  },
  userDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#70614F',
    width: 60,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    color: '#1E1407',
  },
  lastLoginText: {
    color: '#0a7ea4',
    textDecorationLine: 'underline',
  },
  infoIcon: {
    fontSize: 14,
  },
  accessBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#e6f4f8',
    borderRadius: 12,
  },
  accessText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0a7ea4',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#687076',
  },
  menuDropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eceef0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 180,
    zIndex: 1000,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eceef0',
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#11181C',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#687076',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#687076',
  },
  errorText: {
    color: '#b42318',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#11181C',
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
