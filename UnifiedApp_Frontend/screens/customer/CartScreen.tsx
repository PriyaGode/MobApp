import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useContext, useCallback, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    SafeAreaView
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabParamList, RootStackParamList } from "../../App";
import { getToken } from "../../components/auth/tokenStore";
import { API } from "../../config/apiConfig";
import { AuthContext } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useFavorites } from "../../contexts/FavoritesContext";
import { colors, typography } from "../themeTokens";
import { API_BASE } from "../../services/apiBase";

const DEFAULT_ADDRESS_KEY = 'user_default_address_id';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Cart">,
  NativeStackScreenProps<RootStackParamList>
>;

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

export default function CartScreen({ navigation }: Props) {
  const { items, adjustQuantity, totals } = useCart();
  const { user } = useContext(AuthContext);
  const { addFavorite } = useFavorites();
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<SavedAddress | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [promoMinAmount, setPromoMinAmount] = useState<number | null>(null);


  useFocusEffect(
    useCallback(() => {
      fetchDefaultAddress();
      fetchUserProfile();
    }, [user?.userId])
  );

  const fetchUserProfile = useCallback(async () => {
    if (!user?.userId) return;

    // First try to use data from user context
    if (user.fullName) {
      setProfileName(user.fullName || "");
      setProfilePhone(""); // Phone not in user context, will fetch from API
    }

    try {
      const response = await fetch(API.GET_USER_PROFILE(user.userId));
      if (response.ok) {
        const profile = await response.json();
        console.log('Profile data:', profile);
        setProfileName(profile.fullName || profile.name || profile.firstName || user.fullName || "");
        setProfilePhone(profile.phone || profile.phoneNumber || profile.mobile || "");
      }
    } catch (error) {
      console.log("Failed to fetch profile:", error);
    }
  }, [user?.userId, user?.fullName]);



  const fetchDefaultAddress = useCallback(async () => {
    if (!user?.userId) return;

    try {
      setLoadingAddress(true);
      const response = await fetch(API.GET_USER_ADDRESSES(user.userId));

      if (response.ok) {
        const addresses = await response.json();
        if (addresses.length === 0) {
          setDefaultAddress(null);
          return;
        }

        const storedDefaultId = await AsyncStorage.getItem(`${DEFAULT_ADDRESS_KEY}_${user.userId}`);
        const defaultId = storedDefaultId ? parseInt(storedDefaultId) : null;

        let defaultAddr = null;
        if (defaultId) {
          defaultAddr = addresses.find((addr: SavedAddress) => addr.id === defaultId);
        }
        if (!defaultAddr && addresses.length > 0) {
          defaultAddr = addresses[0];
        }

        setDefaultAddress(defaultAddr);
      } else {
        setDefaultAddress(null);
      }
    } catch (error) {
      setDefaultAddress(null);
    } finally {
      setLoadingAddress(false);
    }
  }, [user?.userId]);

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;



  const applyPromoCode = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    try {
      const response = await fetch(API.VALIDATE_PROMO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promoCode: code,
          orderAmount: totals.subtotal,
          userId: user?.userId || 1
        })
      });

      const result = await response.json();

      if (result.valid) {
        setAppliedDiscount(result.discountAmount);
        setAppliedPromoCode(code);
        setPromoMinAmount(result.minOrderAmount || null);
        Alert.alert("Success!", result.message);
      } else {


        Alert.alert("Invalid Code", result.message || "This promo code is not valid for your current items.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to validate promo code. Please try again.");
    }
  };

  const saveForLater = async (itemId: string) => {
    // Clear promo code when item is saved for later
    setAppliedDiscount(0);
    setAppliedPromoCode("");
    setPromoCode("");
    setPromoMinAmount(null);
    
    console.log('saveForLater called with itemId:', itemId);
    console.log('Current cart items:', items.map(i => ({ id: i.id, name: i.name })));
    console.log('User ID:', user?.userId);
    
    const item = items.find(i => i.id === itemId);
    console.log('Found item:', item);
    
    if (!user?.userId) {
      Alert.alert("Login Required", "Please login to save items to favorites");
      return;
    }
    
    if (item) {
      try {
        // Map cart item ID to backend product ID
        const productIdMap: Record<string, number> = {
          '1': 1,  // Alphonso
          '2': 2,  // Kesar  
          '3': 3,  // Product 3
          '4': 4,  // Banganapalle
          '5': 5,  // Product 5
          '6': 6,  // Langra
          '7': 7,  // Product 7
          '8': 8,  // Product 8
        };
        const productId = productIdMap[item.id] || parseInt(item.id) || 1;
        
        console.log('Saving item to favorites:', {
          itemName: item.name,
          itemId: item.id,
          productId: productId,
          userId: user.userId
        });
        
        await addFavorite(productId);
        console.log('Successfully added to favorites, now removing from cart');
        
        adjustQuantity(itemId, -item.quantity);
        console.log('Removed from cart');
        
        Alert.alert("Saved", `${item.name} moved to favorites`);
      } catch (error) {
        console.error('Save for later error:', error);
        Alert.alert("Error", "Failed to save item to favorites: " + (error as Error).message);
      }
    } else {
      console.error('Item not found in cart:', itemId);
      Alert.alert("Error", "Item not found in cart");
    }
  };

  const getEstimatedDelivery = () => {
    const today = new Date();
    const delivery = new Date(today);
    delivery.setDate(today.getDate() + 3);
    return delivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const finalTotal = totals.grandTotal - appliedDiscount;

  const handleProceedToPayment = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    if (!user?.userId) {
      Alert.alert(
        'Login Required',
        'Please login to complete your order',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    if (!defaultAddress) {
      Alert.alert(
        'Address Required',
        'Please add a delivery address before proceeding to payment',
        [
          {
            text: 'Add Address',
            onPress: () => (navigation as any).navigate('ManageAddresses')
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    try {
      setCreatingOrder(true);
      const token = await getToken();

      const deliveryAddressString = `${defaultAddress.addressLine1}${defaultAddress.addressLine2 ? ', ' + defaultAddress.addressLine2 : ''}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.zipCode}`;

      const orderRequest = {
        userId: user?.userId || 1,
        items: items.map(item => ({
          productId: parseInt(item.id) || 1,
          quantity: item.quantity,
          pricePerUnit: item.priceValue,
        })),
        subtotal: totals.subtotal,
        deliveryFee: totals.shipping,
        tax: totals.taxes,
        totalAmount: finalTotal,
        deliveryAddress: deliveryAddressString,
        promoCode: appliedPromoCode || null,
        discountAmount: appliedDiscount || 0,
      };

      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(API.CREATE_ORDER, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderRequest),
      });

      if (response.status === 401 || response.status === 403) {
        Alert.alert(
          'Authentication Error',
          'Your session has expired. Please continue as guest or log in.',
          [
            { text: 'Continue as Guest', onPress: () => handleProceedToPayment() },
            { text: 'Login', onPress: () => navigation.navigate('Login') }
          ]
        );
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      if (!data.orderId) {
        throw new Error('Order ID not returned from server');
      }

      const orderItems = items.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.priceValue,
        lineTotal: parseFloat((i.priceValue * i.quantity).toFixed(2)),
      }));

      const summary = {
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        taxes: totals.taxes,
        discount: appliedDiscount,
        rewardPoints: 0,
        total: finalTotal,
      };

      navigation.navigate("Checkout", {
        amount: finalTotal,
        orderItems,
        summary,
        orderId: data.orderId,
        deliveryAddress: deliveryAddressString,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create order. Please try again.');
    } finally {
      setCreatingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {appliedDiscount > 0 && (
        <View style={styles.savingsHeader}>
          <Text style={styles.savingText}>You're saving {formatCurrency(appliedDiscount)}</Text>
        </View>
      )}

      <View style={styles.progressRow}>
        <Text style={styles.progressActive}>Bag</Text>
        <View style={styles.progressLine} />
        <Text style={styles.progressInactive}>Address</Text>
        <View style={styles.progressLine} />
        <Text style={styles.progressInactive}>Payment</Text>
        <View style={styles.progressLine} />
        <Text style={styles.progressInactive}>Review</Text>
      </View>

      <View style={styles.addressRow}>
        <View style={styles.addressContent}>
          <Text style={styles.addressText}>
            Deliver to: <Text style={styles.bold}>{defaultAddress?.label || 'Add Address'}</Text>
          </Text>
          {defaultAddress && (
            <Text style={styles.fullAddress}>
              {defaultAddress.addressLine1}{defaultAddress.addressLine2 ? ', ' + defaultAddress.addressLine2 : ''}, {defaultAddress.city}, {defaultAddress.state} {defaultAddress.zipCode}
            </Text>
          )}
          <View style={styles.contactSection}>
            <Text style={styles.contactHeader}>Contact Details</Text>
            {(profileName && profilePhone) ? (
              <View style={styles.contactInfo}>
                <Text style={styles.contactText}>Name: {profileName}</Text>
                <Text style={styles.contactText}>Phone: {profilePhone}</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={() => (navigation as any).navigate('EditProfile')}>
                <Text style={styles.addContactLink}>Add Contact Details</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={() => (navigation as any).navigate('ManageAddresses')}>
          <Text style={styles.change}>Change</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.passCard}>
            <Image
              source={{ uri: "https://dummyimage.com/80x80/ffcc00/000.png&text=PROMO" }}
              style={styles.passImg}
            />
            <View style={styles.passContent}>
              <Text style={styles.passTitle}>Promo Code</Text>
              <Text style={styles.passDesc}>Enter code for extra discounts</Text>
              <TextInput
                style={styles.promoInput}
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Enter promo code"
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={applyPromoCode}>
              <Text style={styles.addBtnText}>APPLY</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emptyCart}>
            <Feather name="shopping-cart" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyText}>Add some delicious mangoes to get started!</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Text style={styles.shopNowText}>Shop Now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>$0.00</Text>
            </View>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.passCard}>
            <Image
              source={{ uri: "https://dummyimage.com/80x80/ffcc00/000.png&text=PROMO" }}
              style={styles.passImg}
            />
            <View style={styles.passContent}>
              <Text style={styles.passTitle}>Promo Code</Text>
              <Text style={styles.passDesc}>Enter code for extra discounts</Text>
              <TextInput
                style={styles.promoInput}
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Enter promo code"
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={applyPromoCode}>
              <Text style={styles.addBtnText}>APPLY</Text>
            </TouchableOpacity>
          </View>

          {appliedDiscount > 0 && (
            <View style={styles.savingsBar}>
              <Text style={styles.savingsText}>
                You're saving {formatCurrency(appliedDiscount)} on this order
              </Text>
            </View>
          )}

          <View style={styles.itemsHeader}>
            <Text style={styles.itemsText}>
              {items.length}/{items.length} ITEMS SELECTED{" "}
              <Text style={styles.totalAmount}>({formatCurrency(totals.subtotal)})</Text>
            </Text>
          </View>

          {items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Image
                source={
                  !item.image || imageErrors[item.id] 
                    ? require('../../assets/ImageNotFound.jpg')
                    : { uri: item.image }
                }
                style={styles.itemImg}
                onError={() => {
                  setImageErrors(prev => ({ ...prev, [item.id]: true }));
                }}
              />
              <View style={styles.itemContent}>
                <Text style={styles.brand}>Adi Aam</Text>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.seller}>Sold by: ADI AAM STORE</Text>

                <View style={styles.row}>
                  <Text style={styles.option}>Size: {item.size || 'Regular'}</Text>
                  <Text style={styles.option}>Qty: {item.quantity}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.price}>{formatCurrency(item.priceValue)}</Text>
                  {item.originalPrice && (
                    <Text style={styles.mrp}>{formatCurrency(item.originalPrice)}</Text>
                  )}
                  {item.originalPrice && (
                    <Text style={styles.off}>
                      {formatCurrency(item.originalPrice - item.priceValue)} OFF
                    </Text>
                  )}
                </View>

                <Text style={styles.return}>7 days return available</Text>
                <Text style={styles.delivery}>✔ Delivery by {getEstimatedDelivery()}</Text>

                <View style={styles.quantityRow}>
                  <TouchableOpacity 
                    style={styles.quantityBtn}
                    onPress={async () => {
                      const currentQty = item.quantity;
                      adjustQuantity(item.id, -1);
                      
                      // If item is completely removed, clear promo code
                      if (currentQty === 1) {
                        setAppliedDiscount(0);
                        setAppliedPromoCode("");
                        setPromoCode("");
                        setPromoMinAmount(null);
                      } else if (appliedPromoCode && promoMinAmount) {
                        // Check if order still meets minimum after quantity reduction
                        const newSubtotal = totals.subtotal - item.priceValue;
                        if (newSubtotal < promoMinAmount) {
                          setAppliedDiscount(0);
                          setAppliedPromoCode("");
                          setPromoCode("");
                          setPromoMinAmount(null);
                          Alert.alert("Promo Removed", `Order amount fell below minimum ₹${promoMinAmount} required for this promo code.`);
                        }
                      }
                    }}
                  >
                    <Text style={styles.quantityBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity 
                    style={styles.quantityBtn}
                    onPress={() => adjustQuantity(item.id, 1)}
                  >
                    <Text style={styles.quantityBtnText}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.saveBtn}
                    onPress={() => saveForLater(item.id)}
                  >
                    <Feather name="heart" size={14} color="#CC9806" />
                    <Text style={styles.saveBtnText}>Save for Later</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totals.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totals.shipping)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totals.taxes)}</Text>
            </View>
            {appliedDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, styles.discountText]}>-{formatCurrency(appliedDiscount)}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(finalTotal)}</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {items.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={[styles.placeOrder, creatingOrder && styles.placeOrderDisabled]} 
            onPress={handleProceedToPayment}
            disabled={creatingOrder}
          >
            <Text style={styles.placeOrderText}>
              {creatingOrder ? 'PROCESSING...' : 'CHECKOUT'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  savingsHeader: { backgroundColor: '#e8f5e8', paddingHorizontal: 16, paddingVertical: 8 },
  savingText: { fontSize: 14, color: '#00a651', textAlign: 'center' },
  progressRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f8f8f8' },
  progressActive: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  progressInactive: { fontSize: 14, color: '#999' },
  progressLine: { flex: 1, height: 1, backgroundColor: '#ddd', marginHorizontal: 8 },
  addressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f0f8ff' },
  addressContent: { flex: 1, marginRight: 12 },
  addressText: { fontSize: 14, color: '#333' },
  fullAddress: { fontSize: 12, color: '#666', marginTop: 4, lineHeight: 16 },
  contactSection: { marginTop: 12 },
  contactHeader: { fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  contactInfo: { marginTop: 4 },
  contactText: { fontSize: 12, color: '#333', marginBottom: 2 },
  addContactLink: { fontSize: 12, color: '#007bff', marginTop: 4, textDecorationLine: 'underline' },
  bold: { fontWeight: 'bold' },
  change: { fontSize: 14, color: '#007bff', fontWeight: '500' },
  scrollContent: { paddingBottom: 100 },
  emptyContainer: { flex: 1, justifyContent: 'space-between' },
  passCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 12, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  passImg: { width: 50, height: 50, borderRadius: 8 },
  passContent: { flex: 1, marginLeft: 12 },
  passTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  passDesc: { fontSize: 12, color: '#666', marginTop: 2 },
  promoInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 6, marginTop: 8, fontSize: 14 },
  addBtn: { backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  savingsBar: { backgroundColor: '#e8f5e8', paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 16, borderRadius: 4 },
  savingsText: { fontSize: 14, color: '#00a651', textAlign: 'center' },
  itemsHeader: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f8f8f8' },
  itemsText: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  totalAmount: { color: '#666' },
  itemCard: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 8, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  itemImg: { width: 80, height: 100, borderRadius: 8 },
  itemContent: { flex: 1, marginLeft: 12 },
  brand: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  title: { fontSize: 14, color: '#333', marginTop: 2 },
  seller: { fontSize: 12, color: '#666', marginTop: 4 },
  row: { flexDirection: 'row', marginTop: 8 },
  option: { fontSize: 12, color: '#666', marginRight: 16 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  mrp: { fontSize: 14, color: '#999', textDecorationLine: 'line-through', marginLeft: 8 },
  off: { fontSize: 12, color: '#00a651', marginLeft: 8 },
  return: { fontSize: 12, color: '#666', marginTop: 8 },
  delivery: { fontSize: 12, color: '#00a651', marginTop: 4 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  quantityBtn: { width: 30, height: 30, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  quantityBtnText: { fontSize: 16, fontWeight: 'bold' },
  quantityText: { marginHorizontal: 12, fontSize: 16, fontWeight: 'bold' },
  saveBtn: { marginLeft: 16, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  saveBtnText: { fontSize: 12, color: '#666' },
  summaryCard: { backgroundColor: '#fff', margin: 12, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, color: '#000' },
  discountText: { color: '#00a651' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingTop: 8, marginTop: 8 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  placeOrder: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  placeOrderDisabled: { backgroundColor: '#ccc' },
  placeOrderText: { color: colors.textPrimary, fontSize: 14, fontWeight: 'bold' },
  emptyCart: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, flex: 1, justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, marginBottom: 20 },
  shopNowText: { color: colors.primary, fontSize: 16, fontWeight: 'bold', textDecorationLine: 'underline' },
});