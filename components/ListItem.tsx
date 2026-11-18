import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type ListItemProps = {
  state?: 'default' | 'selected' | 'disabled';
  label: string;
  onPress?: () => void;
};

export const ListItem = ({ state = 'default', label, onPress }: ListItemProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={state === 'disabled'}
      style={[styles.item, styles[state]]}
    >
      <Text>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: { padding: 16, borderRadius: 8 },
  default: { backgroundColor: 'transparent' },
  selected: { backgroundColor: '#1a73e8' },
  disabled: { opacity: 0.5 },
});
