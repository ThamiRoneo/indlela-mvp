import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type TopAppBarProps = {
  title: string;
  onBack?: () => void;
  action?: () => void;
};

export const TopAppBar = ({ title, onBack, action }: TopAppBarProps) => {
  return (
    <View style={styles.bar}>
      {onBack && <TouchableOpacity onPress={onBack}><Text>←</Text></TouchableOpacity>}
      <Text style={styles.title}>{title}</Text>
      {action && <TouchableOpacity onPress={action}><Text>Action</Text></TouchableOpacity>}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', flex: 1 },
});
