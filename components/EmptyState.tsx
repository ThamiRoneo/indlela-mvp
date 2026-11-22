import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

type EmptyStateProps = {
  text: string;
  actionLabel?: string;
  onAction?: () => void;
  accessibilityLabel?: string;
  icon?: React.ReactNode;
};

export const EmptyState = ({ text, actionLabel, onAction, accessibilityLabel, icon }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={styles.text}>{text}</Text>
      {actionLabel && (
        <TouchableOpacity
          onPress={onAction}
          style={styles.button}
          accessibilityLabel={accessibilityLabel || actionLabel}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 32, alignItems: 'center' },
  iconWrap: { marginBottom: 16, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 14, color: '#202124', textAlign: 'center', marginBottom: 16 },
  button: {
    minWidth: tokens.size.touchMin,
    minHeight: tokens.size.touchMin,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a73e8',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '600',
  },
});
