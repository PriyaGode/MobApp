import { Dimensions, PixelRatio, Platform } from 'react-native';

// Get initial screen dimensions
let { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Platform-aware device detection
export const isSmallDevice = () => {
  const { width } = getScreenDimensions();
  return width < 375;
};

export const isMediumDevice = () => {
  const { width } = getScreenDimensions();
  return width >= 375 && width < 414;
};

export const isLargeDevice = () => {
  const { width } = getScreenDimensions();
  return width >= 414 && width < 600;
};

export const isTablet = () => {
  const { width } = getScreenDimensions();
  // iOS: iPad detection, Android: large tablets
  if (Platform.OS === 'ios') {
    return width >= 768; // iPad and larger
  }
  return width >= 768; // Android tablets
};

export const isFoldable = () => {
  const { width } = getScreenDimensions();
  // Only for Android foldable devices
  return Platform.OS === 'android' && width >= 600 && width < 900;
};

export const isUltraWide = () => {
  const { width } = getScreenDimensions();
  // Large tablets and desktop
  return width >= 900;
};

// Dynamic screen dimensions (updates on orientation change)
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

// Responsive scaling based on device type
const getBaseWidth = () => {
  const { width } = getScreenDimensions();
  if (width >= 900) return 414; // Ultra-wide devices use large phone as base
  if (width >= 600) return 375; // Foldables use medium phone as base
  return 375; // Default base width
};

export const normalize = (size: number): number => {
  const { width } = getScreenDimensions();
  const scale = width / getBaseWidth();
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Width percentage - responsive to current screen width
export const wp = (percentage: number): number => {
  const { width } = getScreenDimensions();
  return (width * percentage) / 100;
};

// Height percentage - responsive to current screen height
export const hp = (percentage: number): number => {
  const { height } = getScreenDimensions();
  return (height * percentage) / 100;
};

// Platform-aware responsive padding
export const getResponsivePadding = () => {
  const { width } = getScreenDimensions();
  
  if (Platform.OS === 'ios') {
    // iOS: Consistent with iOS design guidelines
    if (width >= 768) return 24; // iPad
    if (width >= 414) return 20; // iPhone Plus/Pro Max
    return 16; // Standard iPhone
  }
  
  // Android: Support various form factors
  if (width >= 900) return 32; // Ultra-wide
  if (width >= 600) return 24; // Foldable
  if (width >= 414) return 20; // Large phone
  return 16; // Standard phone
};

// Platform-aware responsive grid columns
export const getGridColumns = () => {
  const { width } = getScreenDimensions();
  
  if (Platform.OS === 'ios') {
    // iOS: More conservative grid for better UX
    if (width >= 768) return 3; // iPad: 3 columns
    if (width >= 414) return 2; // iPhone Plus/Pro Max: 2 columns
    return 2; // Standard iPhone: 2 columns
  }
  
  // Android: Support foldables and various sizes
  if (width >= 900) return 4; // Ultra-wide: 4 columns
  if (width >= 600) return 3; // Foldable unfolded: 3 columns
  if (width >= 414) return 2; // Large phones: 2 columns
  return 2; // Standard phones: 2 columns
};

// Platform-aware responsive font sizes
export const getFontSize = (baseSize: number) => {
  const { width } = getScreenDimensions();
  
  if (Platform.OS === 'ios') {
    // iOS: Subtle scaling to maintain iOS feel
    if (width >= 768) return baseSize * 1.1; // iPad: slightly larger
    return baseSize; // iPhone: standard size
  }
  
  // Android: More aggressive scaling for foldables
  if (width >= 900) return baseSize * 1.2; // Ultra-wide: 20% larger
  if (width >= 600) return baseSize * 1.15; // Foldable: 15% larger
  return baseSize; // Standard size
};

// Responsive component sizing
export const getComponentSize = (baseSize: number) => {
  const { width } = getScreenDimensions();
  if (width >= 900) return baseSize * 1.3; // Ultra-wide: 30% larger
  if (width >= 600) return baseSize * 1.15; // Foldable: 15% larger
  return baseSize; // Default size
};

// Listen for orientation changes
let dimensionListeners: ((dimensions: { width: number; height: number }) => void)[] = [];

Dimensions.addEventListener('change', ({ window }) => {
  SCREEN_WIDTH = window.width;
  SCREEN_HEIGHT = window.height;
  dimensionListeners.forEach(listener => listener({ width: window.width, height: window.height }));
});

export const addDimensionListener = (listener: (dimensions: { width: number; height: number }) => void) => {
  dimensionListeners.push(listener);
  return () => {
    dimensionListeners = dimensionListeners.filter(l => l !== listener);
  };
};

// Responsive breakpoints
export const breakpoints = {
  xs: 0,     // Extra small devices
  sm: 375,   // Small devices (phones)
  md: 414,   // Medium devices (large phones)
  lg: 600,   // Large devices (foldables unfolded)
  xl: 768,   // Extra large devices (tablets)
  xxl: 900   // Ultra-wide devices
};

// Media query helper
export const useBreakpoint = () => {
  const { width } = getScreenDimensions();
  return {
    xs: width >= breakpoints.xs,
    sm: width >= breakpoints.sm,
    md: width >= breakpoints.md,
    lg: width >= breakpoints.lg,
    xl: width >= breakpoints.xl,
    xxl: width >= breakpoints.xxl,
    current: width
  };
};
