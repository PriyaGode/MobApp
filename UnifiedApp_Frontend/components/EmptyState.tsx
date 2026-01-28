import { Feather } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

type EmptyStateProps = {
  title?: string;
  message?: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
};

export default function EmptyState({ title, message, icon = 'inbox' }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Feather name={icon} size={64} color="#888" />
      <Text style={styles.title}>{title || t('empty.title')}</Text>
      <Text style={styles.message}>{message || t('empty.message')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
