import { ThemedText } from '@/components/superadmin/themed-text';
import { ThemedView } from '@/components/superadmin/themed-view';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { fetchLoginHistory } from '../api';
import type { LoginHistoryEntry } from '../types';

interface LoginHistoryModalProps {
  visible: boolean;
  userId: string | null;
  userName: string | null;
  onClose: () => void;
}

export function LoginHistoryModal({
  visible,
  userId,
  userName,
  onClose,
}: LoginHistoryModalProps) {
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadHistory = useCallback(
    async (pageNum: number = 0, append: boolean = false) => {
      if (!userId) return;

      try {
        if (!append) {
          setLoading(true);
        }
        setError(null);

        const response = await fetchLoginHistory(userId, {
          page: pageNum,
          size: 20,
          direction: 'DESC',
        });

        if (append) {
          setHistory((prev) => [...prev, ...response.content]);
        } else {
          setHistory(response.content);
        }

        setHasMore(response.hasNext);
        setPage(pageNum);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load login history');
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (visible && userId) {
      loadHistory();
    } else if (!visible) {
      setHistory([]);
      setPage(0);
      setHasMore(true);
      setError(null);
    }
  }, [visible, userId, loadHistory]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadHistory(page + 1, true);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderHistoryItem = ({ item }: { item: LoginHistoryEntry }) => (
    <View style={styles.historyItem}>
      <View style={styles.timestampContainer}>
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <ThemedText style={styles.description}>{item.description}</ThemedText>
        
        {(item.ipAddress || item.deviceInfo) && (
          <View style={styles.metadataContainer}>
            {item.ipAddress && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>IP:</Text>
                <Text style={styles.metadataValue}>{item.ipAddress}</Text>
              </View>
            )}
            {item.deviceInfo && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Device:</Text>
                <Text style={styles.metadataValue}>{item.deviceInfo}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>No login history available</ThemedText>
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

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ThemedView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <ThemedText type="title" style={styles.title}>
                Login Activity
              </ThemedText>
              {userName && (
                <ThemedText style={styles.subtitle}>{userName}</ThemedText>
              )}
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          {/* Content */}
          {loading && history.length === 0 ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#0a7ea4" />
              <ThemedText style={styles.loadingText}>Loading history...</ThemedText>
            </View>
          ) : error && history.length === 0 ? (
            <View style={styles.centerContent}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
              <Pressable style={styles.retryButton} onPress={() => loadHistory()}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={history}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={renderEmpty}
              ListFooterComponent={renderFooter}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
            />
          )}
        </ThemedView>
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
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eceef0',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#687076',
    marginTop: 4,
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  listContent: {
    padding: 16,
  },
  historyItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eceef0',
  },
  timestampContainer: {
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0a7ea4',
  },
  detailsContainer: {
    gap: 8,
  },
  description: {
    fontSize: 15,
    color: '#11181C',
  },
  metadataContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  metadataItem: {
    flexDirection: 'row',
    gap: 4,
  },
  metadataLabel: {
    fontSize: 12,
    color: '#687076',
    fontWeight: '600',
  },
  metadataValue: {
    fontSize: 12,
    color: '#687076',
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
});
