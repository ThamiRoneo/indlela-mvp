import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

type TopAppBarProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: () => void;
  actionLabel?: string;
};

export const TopAppBar = ({ title, subtitle, onBack, action, actionLabel }: TopAppBarProps) => {
  return (
    <View style={styles.bar}>
      {onBack && <TouchableOpacity onPress={onBack}><Text>←</Text></TouchableOpacity>}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {actionLabel ? (
        <TouchableOpacity onPress={action} style={styles.actionAvatar}>
          <Text style={styles.avatarText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : (
        action && <TouchableOpacity onPress={action}><Text>Action</Text></TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  titleContainer: { flex: 1 },
  title: { fontSize: tokens.font.h3.size, fontWeight: '600' },
  subtitle: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginTop: 2 },
  actionAvatar: { padding: 4, borderRadius: 8, backgroundColor: '#f8f9fa' },
  avatarText: { fontSize: tokens.font.caption.size, fontWeight: '600', color: tokens.color.text },
});
