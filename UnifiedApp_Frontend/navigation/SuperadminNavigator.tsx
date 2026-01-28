import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { useResponsive } from '../hooks/useResponsive';
import { ResponsiveNavigation } from '../components/ResponsiveNavigation';

// Superadmin Screens
import AdminDashboardScreen from '../screens/superadmin/AdminDashboardScreen';
import AuditDashboardScreen from '../screens/superadmin/AuditDashboardScreen';
import BulkUploadScreen from '../screens/superadmin/BulkUploadScreen';
import CreateTicketScreen from '../screens/superadmin/CreateTicketScreen';
import GlobalOrdersScreen from '../screens/superadmin/GlobalOrdersScreen';
import HubListScreenRN from '../screens/superadmin/HubListScreenRN';
import InventoryScreen from '../screens/superadmin/InventoryScreen';
import OrderDetailsScreen from '../screens/superadmin/OrderDetailsScreen';
import OrdersTabScreen from '../screens/superadmin/OrdersTabScreen';
import ProductEditScreen from '../screens/superadmin/ProductEditScreen';
import ProductListScreen from '../screens/superadmin/ProductListScreen';
import ProfileTabScreen from '../screens/superadmin/ProfileTabScreen';
import StockSyncScreen from '../screens/superadmin/StockSyncScreen';
import SuperAdminDashboardScreen from '../screens/superadmin/SuperAdminDashboardScreen';
import TicketDetailScreenEnhanced from '../screens/superadmin/TicketDetailScreenEnhanced';
import TicketsTabScreen from '../screens/superadmin/TicketsTabScreen';
import UserListScreenRN from '../screens/superadmin/UserListScreenRN';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Admin Tab Navigator (for Super Admin and Hub Admin)
function AdminTabNavigator() {
  const { getResponsiveStyle, isUltraWide, componentSize } = useResponsive();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: getResponsiveStyle({
          xs: { height: 70 },
          lg: { height: 80 },
          xxl: { height: 90 }
        }),
        tabBarLabelStyle: {
          fontSize: isUltraWide ? 14 : 12,
        },
        tabBarIcon: ({ color, size }) => {
          const iconSize = componentSize(size);
          switch (route.name) {
            case 'Home': return <Feather name="home" color={color} size={iconSize} />;
            case 'GlobalOrders': return <Feather name="list" color={color} size={iconSize} />;
            case 'SupportTickets': return <Feather name="help-circle" color={color} size={iconSize} />;
            case 'Products': return <Feather name="box" color={color} size={iconSize} />;
            case 'Hubs': return <Feather name="map-pin" color={color} size={iconSize} />;
            case 'Users': return <Feather name="users" color={color} size={iconSize} />;
            case 'Profile': return <Feather name="user" color={color} size={iconSize} />;
            default: return <Feather name="circle" color={color} size={iconSize} />;
          }
        }
      })}
    >
      <Tab.Screen
        name="Home"
        component={AdminDashboardScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="GlobalOrders"
        component={OrdersTabScreen}
        options={{ title: 'Orders' }}
      />
      <Tab.Screen
        name="SupportTickets"
        component={TicketsTabScreen}
        options={{ title: 'Tickets' }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductListScreen} 
        options={{ title: 'Products' }} 
      />
      <Tab.Screen
        name="Hubs"
        component={HubListScreenRN}
        options={{ title: 'Hubs' }}
      />
      <Tab.Screen
        name="Users"
        component={UserListScreenRN}
        options={{ title: 'Users' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTabScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Superadmin Stack Navigator (includes both Super Admin and other admin roles)
export default function SuperadminNavigator({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  if (isSuperAdmin) {
    // Full admin interface for SUPER_ADMIN and HUB_ADMIN
    return (
      <ResponsiveNavigation>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
        {/* Detail/child screens accessible from tab list */}
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ headerShown: true, title: 'Order Details' }} />
        <Stack.Screen name="ProductEdit" component={ProductEditScreen} options={{ headerShown: true, title: 'Product' }} />
        <Stack.Screen name="StockSync" component={StockSyncScreen} options={{ headerShown: true, title: 'Stock Sync' }} />
        <Stack.Screen name="BulkUpload" component={BulkUploadScreen} options={{ headerShown: true, title: 'Bulk Upload Products' }} />
        <Stack.Screen 
          name="Inventory" 
          component={InventoryScreen as any} 
          options={{ headerShown: true, title: 'Hub Inventory' }} 
        />
        <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AuditDashboard" component={AuditDashboardScreen} options={{ headerShown: true, title: 'Audit Logs' }} />
        <Stack.Screen name="CreateTicket" component={CreateTicketScreen} options={{ headerShown: true, title: 'Create Ticket' }} />
        <Stack.Screen name="TicketDetailEnhanced" component={TicketDetailScreenEnhanced} options={{ headerShown: true, title: 'Ticket Details' }} />
        </Stack.Navigator>
      </ResponsiveNavigation>
    );
  }
  
  // Limited interface for DELIVERY_PARTNER or other non-admin roles
  return (
    <ResponsiveNavigation>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SupportMain" component={TicketsTabScreen} />
        <Stack.Screen name="CreateTicket" component={CreateTicketScreen} options={{ headerShown: true, title: 'Create Ticket' }} />
        <Stack.Screen name="TicketDetailEnhanced" component={TicketDetailScreenEnhanced} options={{ headerShown: true, title: 'Ticket Details' }} />
      </Stack.Navigator>
    </ResponsiveNavigation>
  );
}
