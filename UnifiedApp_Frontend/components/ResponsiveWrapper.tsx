import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  responsiveStyles?: {
    xs?: ViewStyle;
    sm?: ViewStyle;
    md?: ViewStyle;
    lg?: ViewStyle;
    xl?: ViewStyle;
    xxl?: ViewStyle;
  };
}

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  style,
  responsiveStyles = {}
}) => {
  const { getResponsiveStyle } = useResponsive();
  
  const combinedStyle = [
    style,
    getResponsiveStyle(responsiveStyles)
  ];

  return (
    <View style={combinedStyle}>
      {children}
    </View>
  );
};

// Responsive container with automatic padding
export const ResponsiveContainer: React.FC<ResponsiveWrapperProps> = ({
  children,
  style,
  responsiveStyles = {}
}) => {
  const { padding } = useResponsive();
  
  const defaultStyle: ViewStyle = {
    flex: 1,
    paddingHorizontal: padding,
  };
  
  return (
    <ResponsiveWrapper
      style={[defaultStyle, style]}
      responsiveStyles={responsiveStyles}
    >
      {children}
    </ResponsiveWrapper>
  );
};

// Responsive grid container
interface ResponsiveGridProps {
  children: React.ReactNode;
  style?: ViewStyle;
  spacing?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  style,
  spacing = 16
}) => {
  const { gridColumns, padding } = useResponsive();
  
  const gridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: padding,
    gap: spacing,
  };

  return (
    <View style={[gridStyle, style]}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const itemWidth = `${(100 / gridColumns) - ((spacing * (gridColumns - 1)) / gridColumns)}%`;
        
        return React.cloneElement(child, {
          style: [
            child.props.style,
            { width: itemWidth }
          ]
        });
      })}
    </View>
  );
};