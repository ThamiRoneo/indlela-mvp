import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type EmptyStateProps = {
  text: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({ text, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction} style={styles.button}>
          <Text>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 32, alignItems: 'center' },
  text: { fontSize: 14, color: '#202124', textAlign: 'center', marginBottom: 16 },
  button: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1a73e8' },
});
