import Constants from 'expo-constants';
import { Platform } from 'react-native';

export interface DeviceInfo {
  deviceModel: string;
  osName: string;
  osVersion: string;
  appVersion: string;
  platform: string;
}

export const getDeviceInfo = (): DeviceInfo => {
  return {
    deviceModel: Constants.deviceName || 'Unknown Device',
    osName: Platform.OS,
    osVersion: Platform.Version.toString(),
    appVersion: Constants.expoConfig?.version || '1.0.0',
    platform: Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web',
  };
};

export const createSignupPayload = (formData: {
  fullName: string;
  email: string;
  password: string;
  referralCode?: string;
}) => {
  const deviceInfo = getDeviceInfo();
  
  return {
    ...formData,
    deviceInfo,
    timestamp: new Date().toISOString(),
  };
};