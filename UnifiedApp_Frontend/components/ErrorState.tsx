import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, StyleSheet, Text, View } from 'react-native';

type ErrorStateProps = {
  onRetry: () => void;
  title?: string;
  message?: string;
};

export default function ErrorState({ onRetry, title, message }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <MaterialIcons name="signal-wifi-off" size={64} color="#888" />
      <Text style={styles.title}>{title || t('error.title')}</Text>
      <Text style={styles.message}>{message || t('error.message')}</Text>
      {onRetry && (
        <Button title={t('error.tryAgain')} onPress={onRetry} />
      )}
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
    marginBottom: 16,
  },
});
