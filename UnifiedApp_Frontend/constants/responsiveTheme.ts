import { getScreenDimensions, getFontSize, getComponentSize } from '../utils/responsive';

// Responsive theme configuration
export const getResponsiveTheme = () => {
  const { width } = getScreenDimensions();
  
  // Base theme values
  const baseTheme = {
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 24,
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      h1: 32,
      h2: 28,
      h3: 24,
    },
    iconSize: {
      sm: 16,
      md: 20,
      lg: 24,
      xl: 28,
      xxl: 32,
    },
    buttonHeight: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    cardMinHeight: {
      sm: 120,
      md: 140,
      lg: 160,
    }
  };

  // Apply responsive scaling
  const responsiveTheme = {
    spacing: {
      xs: getComponentSize(baseTheme.spacing.xs),
      sm: getComponentSize(baseTheme.spacing.sm),
      md: getComponentSize(baseTheme.spacing.md),
      lg: getComponentSize(baseTheme.spacing.lg),
      xl: getComponentSize(baseTheme.spacing.xl),
      xxl: getComponentSize(baseTheme.spacing.xxl),
    },
    borderRadius: {
      sm: getComponentSize(baseTheme.borderRadius.sm),
      md: getComponentSize(baseTheme.borderRadius.md),
      lg: getComponentSize(baseTheme.borderRadius.lg),
      xl: getComponentSize(baseTheme.borderRadius.xl),
      xxl: getComponentSize(baseTheme.borderRadius.xxl),
    },
    fontSize: {
      xs: getFontSize(baseTheme.fontSize.xs),
      sm: getFontSize(baseTheme.fontSize.sm),
      md: getFontSize(baseTheme.fontSize.md),
      lg: getFontSize(baseTheme.fontSize.lg),
      xl: getFontSize(baseTheme.fontSize.xl),
      xxl: getFontSize(baseTheme.fontSize.xxl),
      h1: getFontSize(baseTheme.fontSize.h1),
      h2: getFontSize(baseTheme.fontSize.h2),
      h3: getFontSize(baseTheme.fontSize.h3),
    },
    iconSize: {
      sm: getComponentSize(baseTheme.iconSize.sm),
      md: getComponentSize(baseTheme.iconSize.md),
      lg: getComponentSize(baseTheme.iconSize.lg),
      xl: getComponentSize(baseTheme.iconSize.xl),
      xxl: getComponentSize(baseTheme.iconSize.xxl),
    },
    buttonHeight: {
      sm: getComponentSize(baseTheme.buttonHeight.sm),
      md: getComponentSize(baseTheme.buttonHeight.md),
      lg: getComponentSize(baseTheme.buttonHeight.lg),
    },
    cardMinHeight: {
      sm: getComponentSize(baseTheme.cardMinHeight.sm),
      md: getComponentSize(baseTheme.cardMinHeight.md),
      lg: getComponentSize(baseTheme.cardMinHeight.lg),
    },
    // Device-specific adjustments
    layout: {
      maxContentWidth: width >= 900 ? 1200 : width >= 600 ? 800 : width,
      sidebarWidth: width >= 900 ? 280 : 0,
      headerHeight: width >= 900 ? 80 : width >= 600 ? 70 : 60,
      tabBarHeight: width >= 900 ? 90 : width >= 600 ? 80 : 70,
      modalMaxWidth: width >= 900 ? 600 : width >= 600 ? width * 0.7 : width * 0.9,
    }
  };

  return responsiveTheme;
};

// Hook to use responsive theme
export const useResponsiveTheme = () => {
  return getResponsiveTheme();
};