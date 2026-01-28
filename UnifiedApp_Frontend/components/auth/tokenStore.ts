import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
// We use dynamic import type to avoid requiring types at compile-time if not present
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SecureStore: any = require('expo-secure-store');

const TOKEN_KEY = 'auth_token';
const EMAIL_KEY = 'auth_email';
const USER_DATA_KEY = 'auth_user_data';

export type StoredAuth = { token: string; email: string; fullName?: string; userId?: number; role?: string };

async function secureAvailable(): Promise<boolean> {
  try {
    return Boolean(SecureStore?.setItemAsync && SecureStore?.getItemAsync);
  } catch {
    return false;
  }
}

export async function setToken(token: string, email: string, fullName?: string, userId?: number, role?: string): Promise<void> {
  const canSecure = await secureAvailable();
  const userData = JSON.stringify({ fullName, userId, role });
  
  try {
    if (canSecure) {
      await SecureStore.setItemAsync(TOKEN_KEY, token, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      });
      await SecureStore.setItemAsync(EMAIL_KEY, email, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      });
      await SecureStore.setItemAsync(USER_DATA_KEY, userData, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      });
      return;
    }
  } catch {
    // fall through to AsyncStorage
  }
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(EMAIL_KEY, email);
  await AsyncStorage.setItem(USER_DATA_KEY, userData);
}

export async function getToken(): Promise<StoredAuth | null> {
  const canSecure = await secureAvailable();
  try {
    if (canSecure) {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const email = await SecureStore.getItemAsync(EMAIL_KEY);
      const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
      if (token && email) {
        const parsed = userData ? JSON.parse(userData) : {};
        return { token, email, fullName: parsed.fullName, userId: parsed.userId, role: parsed.role };
      }
    }
  } catch {
    // fallback below
  }
  const [token, email, userData] = await Promise.all([
    AsyncStorage.getItem(TOKEN_KEY),
    AsyncStorage.getItem(EMAIL_KEY),
    AsyncStorage.getItem(USER_DATA_KEY),
  ]);
  if (token && email) {
    const parsed = userData ? JSON.parse(userData) : {};
    return { token, email, fullName: parsed.fullName, userId: parsed.userId, role: parsed.role };
  }
  return null;
}

export async function deleteToken(): Promise<void> {
  const canSecure = await secureAvailable();
  try {
    if (canSecure) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(EMAIL_KEY);
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
      return;
    }
  } catch {
    // fallback
  }
  await AsyncStorage.multiRemove([TOKEN_KEY, EMAIL_KEY, USER_DATA_KEY]);
}

// Alias for clearToken (used by AuthContext)
export async function clearToken(): Promise<void> {
  return deleteToken();
}

export async function isHardwareBacked(): Promise<boolean> {
  // Expo SecureStore abstracts platform details; we provide a best-effort signal.
  return Platform.OS === 'android';
}

export function generateFakeToken(email: string): string {
  // Lightweight fake token (NOT secure, for demo only), avoids Node Buffer
  const iat = Date.now();
  const rand = Math.random().toString(36).slice(2);
  const safeEmail = encodeURIComponent(email);
  return `demo.${iat}.${rand}.${safeEmail}`;
}
