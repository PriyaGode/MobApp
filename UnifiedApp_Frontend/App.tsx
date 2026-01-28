import { Feather } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Dimensions } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Localization
import './localization/i18n';

// Shared Screens (Auth flows)
import OfflineScreen from './components/OfflineScreen';
import OnboardingScreen from './components/customer/onboarding/Onboarding';
import AuthLanding from './screens/customer/AuthLanding';
import CompleteProfileScreen from "./screens/customer/CompleteProfileScreen";
import EmailOtpRequestScreen from "./screens/customer/EmailOtpRequestScreen";
import EmailOtpVerifyScreen from "./screens/customer/EmailOtpVerifyScreen";
import EmailSentScreen from './screens/customer/EmailSentScreen';
import ForgotPasswordScreen from './screens/customer/ForgotPasswordScreen';
import Login from './screens/customer/Login';
import OtpVerifyScreen from './screens/customer/OtpVerifyScreen';
import PhoneEntryScreen from './screens/customer/PhoneEntryScreen';
import Register from './screens/customer/Register';
import ResetPassword from './screens/customer/ResetPassword';
import VerifyEmail from './screens/customer/VerifyEmail';

// Role-based Navigators
import CustomerNavigator from './navigation/CustomerNavigator';
import SuperadminNavigator from './navigation/SuperadminNavigator';

// Contexts
import { getToken } from "./components/auth/tokenStore";
import { AppProvider, AuthContext, LoadingContext } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";

import type { ProductInfo } from "./screens/customer/productData";

// Create navigators
const Stack = createNativeStackNavigator();

// Define the param list for the Root Stack Navigator
export type RootStackParamList = {
  Onboarding: undefined;
  AuthLanding: undefined;
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email?: string; token?: string } | undefined;
  ForgotPasswordScreen: undefined;
  EmailSentScreen: { email?: string } | undefined;
  ResetPassword: { token?: string };
  PhoneEntry: undefined;
  OtpVerify: { phoneE164: string; isExistingUser: boolean; deviceId: string; channel: string; debugCode?: string };
  CompleteProfile: { phoneE164: string };
  EmailOtpRequest: undefined;
  EmailOtpVerify: {
    email: string;
    purpose?: "verification" | "registration" | "password_reset" | "login";
    debugCode?: string;
    registrationData?: {
      fullName: string;
      password: string;
      referralCode?: string;
    };
  };
  CustomerReviews: { product?: ProductInfo };
  WriteReview: { product?: ProductInfo };
  ProductDetail: { product: ProductInfo };
  SupportTickets: undefined;
  Wallet: undefined;
  Main: { screen?: string };
  Checkout: {
    amount: number;
    orderItems: any[];
    summary: any;
    orderId: string;
    deliveryAddress: string;
  };
};


// ----------------- Error Boundary -----------------
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: any }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // Error boundary caught an error
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View>
            <Text style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>
              An error occurred in navigation.
            </Text>
            <Text>{String(this.state.error)}</Text>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

// ----------------- Stack Navigator with Role-Based Routing -----------------
function AppNavigator() {
  const { user } = useContext(AuthContext);

  // Determine if user is an admin (SUPER_ADMIN, HUB_ADMIN, DELIVERY_PARTNER)
  const isAdminRole = user?.role && ['SUPER_ADMIN', 'HUB_ADMIN', 'DELIVERY_PARTNER'].includes(user.role);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'HUB_ADMIN';

  console.log('AppNavigator - User:', user);
  console.log('AppNavigator - User Role:', user?.role);
  console.log('AppNavigator - isAdminRole:', isAdminRole);
  console.log('AppNavigator - isSuperAdmin:', isSuperAdmin);

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      {!user ? (
        // Auth flow screens - shared for all users
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AuthLanding" component={AuthLanding} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmail as any} />
          <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
          <Stack.Screen name="EmailSentScreen" component={EmailSentScreen as any} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
          <Stack.Screen name="PhoneEntry" component={PhoneEntryScreen} />
          <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
          <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
          <Stack.Screen name="EmailOtpRequest" component={EmailOtpRequestScreen} />
          <Stack.Screen name="EmailOtpVerify" component={EmailOtpVerifyScreen} />
        </>
      ) : isAdminRole ? (
        // Admin users (SUPER_ADMIN, HUB_ADMIN, DELIVERY_PARTNER) → SuperadminNavigator
        <Stack.Screen 
          name="SuperadminApp" 
          options={{ headerShown: false }}
        >
          {() => <SuperadminNavigator isSuperAdmin={isSuperAdmin} />}
        </Stack.Screen>
      ) : (
        // Customer users (CUSTOMER or no role) → CustomerNavigator
        <Stack.Screen 
          name="CustomerApp" 
          component={CustomerNavigator} 
          options={{ headerShown: false }} 
        />
      )}
    </Stack.Navigator>
  );
}

// ----------------- Root App -----------------
export default function App() {
  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  // Network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected != null) setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Screen dimension changes (orientation, foldable state)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  const handleRetryConnection = () =>
    NetInfo.fetch().then((state) => setIsConnected(state.isConnected ?? false));

  // Bootstrapping token
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored: unknown = await getToken();
      } finally {
        if (mounted) setBooting(false);
      }
    })();
    return () => { mounted = false; };
  }, []);


  const linking = {
    prefixes: ["myapp://", "https://yourapp.com/"],
    config: {
      screens: {
        AuthLanding: "auth",
        Login: "login",
        Register: "register",
        Main: "main",
        VerifyEmail: { path: "verify/:token?", parse: { token: (token: string) => token } },
        ResetPassword: { path: "reset/:token?", parse: { token: (token: string) => token } },
      },
    },
  };
  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

// If offline, render the full-screen offline component.
  if (!isConnected) {
    return <OfflineScreen onRetry={handleRetryConnection} />;
  }
  return (
    <SafeAreaProvider>
      <AppProvider>
        <LoadingContext.Provider value={{ loading, setLoading }}>
          <CartProvider>
            <FavoritesProvider>
              <NavigationContainer>
                <ErrorBoundary>
                  <AppNavigator />
                </ErrorBoundary>
              </NavigationContainer>
            </FavoritesProvider>
          </CartProvider>
        </LoadingContext.Provider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
