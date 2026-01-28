import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { 
  getScreenDimensions, 
  isSmallDevice, 
  isMediumDevice, 
  isLargeDevice, 
  isTablet, 
  isFoldable, 
  isUltraWide,
  getResponsivePadding,
  getGridColumns,
  getFontSize,
  getComponentSize,
  breakpoints,
  addDimensionListener
} from '../utils/responsive';

export interface ResponsiveState {
  width: number;
  height: number;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isTablet: boolean;
  isFoldable: boolean;
  isUltraWide: boolean;
  padding: number;
  gridColumns: number;
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(() => getScreenDimensions());

  useEffect(() => {
    const removeListener = addDimensionListener(setDimensions);
    return removeListener;
  }, []);

  const getBreakpoint = (width: number): ResponsiveState['breakpoint'] => {
    if (width >= breakpoints.xxl) return 'xxl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  const responsiveState: ResponsiveState = {
    width: dimensions.width,
    height: dimensions.height,
    isSmall: isSmallDevice(),
    isMedium: isMediumDevice(),
    isLarge: isLargeDevice(),
    isTablet: isTablet(),
    isFoldable: isFoldable(),
    isUltraWide: isUltraWide(),
    padding: getResponsivePadding(),
    gridColumns: getGridColumns(),
    breakpoint: getBreakpoint(dimensions.width),
  };

  return {
    ...responsiveState,
    // Helper functions
    wp: (percentage: number) => (dimensions.width * percentage) / 100,
    hp: (percentage: number) => (dimensions.height * percentage) / 100,
    fontSize: (baseSize: number) => getFontSize(baseSize),
    componentSize: (baseSize: number) => getComponentSize(baseSize),
    // Responsive styles helper
    getResponsiveStyle: (styles: {
      xs?: any;
      sm?: any;
      md?: any;
      lg?: any;
      xl?: any;
      xxl?: any;
    }) => {
      const breakpoint = getBreakpoint(dimensions.width);
      return styles[breakpoint] || styles.xs || {};
    }
  };
};

// Hook for responsive layout calculations
export const useResponsiveLayout = () => {
  const responsive = useResponsive();
  
  return {
    ...responsive,
    // Layout helpers
    getCardWidth: () => {
      const { width, gridColumns } = responsive;
      const padding = responsive.padding;
      const gap = 16;
      return (width - (padding * 2) - (gap * (gridColumns - 1))) / gridColumns;
    },
    
    getModalWidth: () => {
      const { width } = responsive;
      if (width >= 900) return Math.min(600, width * 0.6); // Ultra-wide: max 600px or 60%
      if (width >= 600) return width * 0.7; // Foldable: 70%
      return width * 0.9; // Phone: 90%
    },
    
    getHeaderHeight: () => {
      const { isFoldable, isUltraWide } = responsive;
      if (isUltraWide) return 80;
      if (isFoldable) return 70;
      return 60;
    },
    
    getTabBarHeight: () => {
      const { isFoldable, isUltraWide } = responsive;
      if (isUltraWide) return 90;
      if (isFoldable) return 80;
      return 70;
    }
  };
};