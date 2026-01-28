import { Feather } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import EmptyState from "../../components/EmptyState";
import { API } from "../../config/apiConfig";
import { AuthContext } from "../../contexts/AuthContext";
import { colors, typography } from "../themeTokens";

/* ===================== TYPES ===================== */

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

interface Order {
  id: number;
  orderId: string;
  totalAmount: number;
  status: string;
  orderDate: string;
  deliveryAddress: string;
  items: OrderItem[];
}

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "IN-TRANSIT", label: "In Transit" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

/* ===================== SCREEN ===================== */

export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  useEffect(() => {
    applyFilter(activeFilter);
  }, [activeFilter, orders]);

  /* ===================== API ===================== */

  const fetchOrders = async () => {
    if (!user?.userId) {
      Alert.alert("Error", "User ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API.GET_USER_ORDERS(user.userId));
      const data = await response.json();

      if (response.ok) {
        setOrders(data);
        setFilteredOrders(data);
      } else {
        Alert.alert("Error", data?.error || "Failed to load orders");
      }
    } catch {
      Alert.alert("Error", "Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  /* ===================== FILTER ===================== */

  const applyFilter = (filter: string) => {
    if (filter === "ALL") {
      setFilteredOrders(orders);
    } else if (filter === "IN-TRANSIT") {
      setFilteredOrders(
        orders.filter((order) => {
          const status = order.status.toUpperCase();
          return status === "IN-TRANSIT" || status === "IN_TRANSIT" || status === "IN TRANSIT" || status.includes("TRANSIT");
        })
      );
    } else {
      setFilteredOrders(
        orders.filter(
          (order) => order.status.toUpperCase() === filter
        )
      );
    }
  };

  /* ===================== HELPERS ===================== */

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (true) {
      case statusUpper === "CONFIRMED" || statusUpper.includes("CONFIRM"):
        return colors.primary;
      case statusUpper === "DELIVERED" || statusUpper.includes("DELIVER"):
        return colors.success;
      case statusUpper === "CANCELLED" || statusUpper.includes("CANCEL"):
        return colors.error;
      case statusUpper === "IN-TRANSIT" || statusUpper === "IN_TRANSIT" || statusUpper === "IN TRANSIT" || statusUpper.includes("TRANSIT"):
        return "#6B7280";
      case statusUpper === "SHIPPED" || statusUpper.includes("SHIP"):
        return "#8B5CF6";
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  /* ===================== RENDER ITEM ===================== */

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() =>
          (navigation as any).navigate("OrderDetail", {
            orderId: item.id,
            order: item,
          })
        }
      >
        <View style={styles.headerRow}>
          <View>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor + "22" },
                ]}
              >
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {item.status}
                </Text>
              </View>

              <Text style={styles.dateText}>
                {formatDate(item.orderDate)}
              </Text>
            </View>

            <Text style={styles.orderNumber}>
              Order #{item.orderId}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.amount}>
              ${item.totalAmount.toFixed(2)}
            </Text>
            <Text style={styles.itemsText}>
              {item.items.length}{" "}
              {item.items.length === 1 ? "item" : "items"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.addressRow}>
          <Feather
            name="map-pin"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.deliveryAddress}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  /* ===================== LOADING ===================== */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  /* ===================== UI ===================== */

  return (
    <View style={styles.container}>
      {/* 🔹 TOP FILTER */}
      <View style={styles.filterRow}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setActiveFilter(filter.key)}
            style={[
              styles.filterTab,
              activeFilter === filter.key && styles.activeFilterTab,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.key && styles.activeFilterText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon="package"
          title="No Orders"
          message="No orders found for this filter"
        />
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },

  /* FILTER */
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 10,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  activeFilterText: {
    color: colors.background,
    fontWeight: "600",
  },

  listContent: {
    padding: 16,
    paddingBottom: 32,
  },

  card: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  orderNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },

  itemsText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 12,
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  addressText: {
    ...typography.small,
    color: colors.textSecondary,
    flex: 1,
  },
});
