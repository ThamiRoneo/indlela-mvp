import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

type TopAppBarProps = {
  title: string;
  onBack?: () => void;
  action?: () => void;
  accessibilityLabel?: string;
};

export const TopAppBar = ({ title, onBack, action, accessibilityLabel }: TopAppBarProps) => {
  return (
    <View style={styles.bar}>
      {onBack && (
        <TouchableOpacity onPress={onBack} accessibilityLabel="Go back" style={styles.touchTarget}>
          <Text>←</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title} accessibilityLabel={accessibilityLabel || title}>
        {title}
      </Text>
      {action && <TouchableOpacity onPress={action} style={styles.touchTarget}><Text>Action</Text></TouchableOpacity>}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  touchTarget: { minWidth: tokens.size.touchMin, minHeight: tokens.size.touchMin },
  title: { fontSize: 24, fontWeight: '700', flex: 1 },
});
