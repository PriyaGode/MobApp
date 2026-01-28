import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { TouchableOpacity, Text } from "react-native";

// Customer Screens
import CartScreen from '../screens/customer/CartScreen';
import EditProfileScreen from "../screens/customer/EditProfileScreen";
import FavoritesScreen from '../screens/customer/FavoritesScreen';
import Home from '../screens/customer/Home';
import { ResponsiveTest } from '../components/ResponsiveTest';
import ManageAddressesScreen from "../screens/customer/ManageAddressesScreen";
import MangoFilterScreen from '../screens/customer/MangoFilterScreen';
import MangoProductDetailsScreen from '../screens/customer/MangoProductDetailsScreen';
import MangoSearchScreen from '../screens/customer/MangoSearchScreen';
import OrderDetailScreen from "../screens/customer/OrderDetailScreen";
import OrderHistoryScreen from "../screens/customer/OrderHistoryScreen";
import ProductDetailScreen from "../screens/customer/ProductDetailScreen";
import ProfileScreen from "../screens/customer/ProfileScreen";
import InvoiceScreen from "../screens/customer/InvoiceScreen";
import HelpSupportScreen from "../screens/customer/HelpSupportScreen";
import ChatScreen from "../screens/customer/ChatScreen";
import CustomerReviewsScreen from "../screens/customer/CustomerReviewsScreen";
import WriteReviewScreen from "../screens/customer/WriteReviewScreen";
import SupportTicketsScreen from "../screens/customer/SupportTicketsScreen";
import WalletScreen from '../screens/customer/WalletScreen';

// Payment flow screens
import CardDetailsScreen from '../screens/customer/CardDetailsScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import OrderConfirmationScreen from '../screens/customer/OrderConfirmationScreen';
import PaymentFailedDetailedScreen from '../screens/customer/PaymentFailedDetailedScreen';
import PaymentFailedScreen from '../screens/customer/PaymentFailedScreen';
import PaymentMethodScreen from '../screens/customer/PaymentMethodScreen';
import PaymentProcessingScreen from '../screens/customer/PaymentProcessingScreen';
import PaymentSuccessScreen from '../screens/customer/PaymentSuccessScreen';

// Order tracking screens
import DeliveryTrackingScreen from '../screens/customer/DeliveryTrackingScreen';
import OrderTrackingScreen from '../screens/customer/OrderTrackingScreen';

import { useCart } from "../contexts/CartContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator for Customer
function CustomerTabs() {
  const { items } = useCart();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof Feather>['name'] = 'home';
          if (route.name === 'Favorites') iconName = 'heart';
          else if (route.name === 'Orders') iconName = 'package';
          else if (route.name === 'Cart') iconName = 'shopping-cart';
          return <Feather name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={({ navigation }) => ({ 
        title: 'Favorites',
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Home')} 
            style={{ marginLeft: 16, padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>‹</Text>
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Cart')} 
            style={{ marginRight: 16, padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Feather name="shopping-cart" size={20} color="#000" />
          </TouchableOpacity>
        ),
      })} />
      <Tab.Screen name="Orders" component={OrderHistoryScreen} options={({ navigation }) => ({ 
        title: 'My Orders',
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Home')} 
            style={{ marginLeft: 16, padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>‹</Text>
          </TouchableOpacity>
        ),
      })} />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen} 
        options={({ navigation }) => ({ 
          title: 'MY CART',
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Home')} 
              style={{ marginLeft: 16, padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>‹</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Favorites')} 
              style={{ marginRight: 16, padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20, color: '#000' }}>♡</Text>
            </TouchableOpacity>
          ),
        })} 
      />
    </Tab.Navigator>
  );
}

// Customer Stack Navigator
export default function CustomerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Main" component={CustomerTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={({ navigation }) => ({ 
        title: "Profile",
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{ marginLeft: 16, padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>‹</Text>
          </TouchableOpacity>
        ),
      })} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MangoSearch" component={MangoSearchScreen} options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="MangoFilter" component={MangoFilterScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="MangoProductDetails" component={MangoProductDetailsScreen} />
      
      {/* Payment flow screens */}
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} options={({ navigation }) => ({ 
        title: 'Payment Method',
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{ marginLeft: 16, padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>‹</Text>
          </TouchableOpacity>
        ),
      })} />
      <Stack.Screen name="CardDetails" component={CardDetailsScreen} options={({ navigation }) => ({ 
        title: 'Card Details',
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{ marginLeft: 16, padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>‹</Text>
          </TouchableOpacity>
        ),
      })} />
      <Stack.Screen name="PaymentProcessing" component={PaymentProcessingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PaymentFailed" component={PaymentFailedScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PaymentFailedDetailed" component={PaymentFailedDetailedScreen} options={{ headerShown: false }} />
      
      {/* Order tracking screens */}
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeliveryTracking" component={DeliveryTrackingScreen} options={{ headerShown: false }} />
      
      {/* Profile screens */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} options={({ navigation }) => ({ 
        title: "My Orders",
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{ marginLeft: 16, padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>‹</Text>
          </TouchableOpacity>
        ),
      })} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Invoice" component={InvoiceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ManageAddresses" component={ManageAddressesScreen} options={({ navigation }) => ({ 
        title: "Manage Addresses",
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{ marginLeft: 16, padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>‹</Text>
          </TouchableOpacity>
        ),
      })} />
      <Stack.Screen name="ResponsiveTest" component={ResponsiveTest} options={{ title: 'Responsive Test' }} />
      <Stack.Screen name="CustomerReviews" component={CustomerReviewsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="WriteReview" component={WriteReviewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SupportTickets" component={SupportTicketsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Wallet" component={WalletScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
