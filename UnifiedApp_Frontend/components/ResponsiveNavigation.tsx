import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';

interface ResponsiveNavigationProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  sidebarContent?: React.ReactNode;
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  children,
  showSidebar = false,
  sidebarContent
}) => {
  const { isUltraWide, isFoldable, isTablet } = useResponsive();

  // iOS: Always use single screen layout, no sidebar
  if (Platform.OS === 'ios') {
    return (
      <View style={styles.iosLayout}>
        {children}
      </View>
    );
  }

  // Android: Support sidebar for ultra-wide devices only
  if (isUltraWide && showSidebar && sidebarContent) {
    return (
      <View style={styles.sidebarLayout}>
        <View style={styles.sidebar}>
          {sidebarContent}
        </View>
        <View style={styles.mainContent}>
          {children}
        </View>
      </View>
    );
  }

  // Android foldable: Optimized single-screen layout
  if (isFoldable) {
    return (
      <View style={styles.foldableLayout}>
        {children}
      </View>
    );
  }

  // Default layout for all other devices
  return (
    <View style={styles.defaultLayout}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#f8f9fa',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
  },
  mainContent: {
    flex: 1,
  },
  iosLayout: {
    flex: 1,
    // iOS: Always single screen, no dual-screen behavior
    width: '100%',
  },
  foldableLayout: {
    flex: 1,
    // Android foldable: Single unified screen when unfolded
    width: '100%',
  },
  defaultLayout: {
    flex: 1,
    width: '100%',
  },
});