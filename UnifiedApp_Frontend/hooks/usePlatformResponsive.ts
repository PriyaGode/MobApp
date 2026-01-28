import { Platform } from 'react-native';
import { useResponsive } from './useResponsive';

export const usePlatformResponsive = () => {
  const responsive = useResponsive();
  
  // Platform-specific overrides
  const platformResponsive = {
    ...responsive,
    
    // iOS: Always treat as single screen
    isFoldable: Platform.OS === 'ios' ? false : responsive.isFoldable,
    
    // iOS: Conservative grid columns
    gridColumns: Platform.OS === 'ios' 
      ? Math.min(responsive.gridColumns, 3) // Max 3 columns on iOS
      : responsive.gridColumns,
    
    // iOS: Consistent padding
    padding: Platform.OS === 'ios'
      ? Math.min(responsive.padding, 24) // Max 24px padding on iOS
      : responsive.padding,
    
    // Platform-specific layout decisions
    shouldUseSidebar: Platform.OS === 'android' && responsive.isUltraWide,
    shouldUseSingleScreen: Platform.OS === 'ios' || !responsive.isFoldable,
    
    // Platform-specific breakpoints
    getLayoutType: () => {
      if (Platform.OS === 'ios') {
        if (responsive.width >= 768) return 'tablet';
        if (responsive.width >= 414) return 'large-phone';
        return 'phone';
      }
      
      // Android
      if (responsive.width >= 900) return 'ultra-wide';
      if (responsive.width >= 600) return 'foldable';
      if (responsive.width >= 414) return 'large-phone';
      return 'phone';
    }
  };
  
  return platformResponsive;
};