import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';

export const ResponsiveTest = () => {
  const responsive = useResponsive();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Responsive Test</Text>
      <Text>Width: {responsive.width}px</Text>
      <Text>Height: {responsive.height}px</Text>
      <Text>Breakpoint: {responsive.breakpoint}</Text>
      <Text>Grid Columns: {responsive.gridColumns}</Text>
      <Text>Padding: {responsive.padding}px</Text>
      <Text>Is Foldable: {responsive.isFoldable ? 'Yes' : 'No'}</Text>
      <Text>Is Ultra-wide: {responsive.isUltraWide ? 'Yes' : 'No'}</Text>
      
      <View style={styles.grid}>
        {Array.from({ length: responsive.gridColumns * 2 }, (_, i) => (
          <View 
            key={i} 
            style={[
              styles.gridItem, 
              { width: `${100 / responsive.gridColumns - 2}%` }
            ]}
          >
            <Text style={{ fontSize: responsive.fontSize(14) }}>Item {i + 1}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  gridItem: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
});