import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

type EmptyStateProps = {
  text: string;
  actionLabel?: string;
  onAction?: () => void;
  accessibilityLabel?: string;
};

export const EmptyState = ({ text, actionLabel, onAction, accessibilityLabel }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction} style={styles.button} accessibilityLabel={accessibilityLabel || actionLabel}>
          <Text>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 32, alignItems: 'center' },
  text: { fontSize: 14, color: '#202124', textAlign: 'center', marginBottom: 16 },
  button: { minWidth: tokens.size.touchMin, minHeight: tokens.size.touchMin, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1a73e8' },
});
