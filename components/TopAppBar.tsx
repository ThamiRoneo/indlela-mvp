import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, User, Check } from 'lucide-react-native';
import { tokens } from '../theme/tokens';

type TopAppBarProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: () => void;
  actionLabel?: string | React.ReactNode;
};

export const TopAppBar = ({ title, subtitle, onBack, action, actionLabel }: TopAppBarProps) => {
  const renderActionContent = () => {
    if (!actionLabel) return null;
    if (React.isValidElement(actionLabel)) return actionLabel;
    if (actionLabel === '👤') {
      return <User size={18} color={tokens.color.text} strokeWidth={2} />;
    }
    if (actionLabel === '✓') {
      return <Check size={18} color="#137333" strokeWidth={2} />;
    }
    return <Text style={styles.avatarText}>{String(actionLabel)}</Text>;
  };

  return (
    <View style={styles.bar}>
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          accessibilityLabel="Back"
          accessibilityRole="button"
        >
          <ArrowLeft size={20} color={tokens.color.text} strokeWidth={2} />
        </TouchableOpacity>
      )}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {actionLabel ? (
        <TouchableOpacity
          onPress={action}
          style={styles.actionAvatar}
          accessibilityLabel={typeof actionLabel === 'string' ? actionLabel : 'Action'}
          accessibilityRole="button"
        >
          {renderActionContent()}
        </TouchableOpacity>
      ) : (
        action && (
          <TouchableOpacity
            onPress={action}
            accessibilityLabel="Action"
            accessibilityRole="button"
          >
            <Text>Action</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  titleContainer: { flex: 1 },
  title: { fontSize: tokens.font.h3.size, fontWeight: '600' },
  subtitle: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginTop: 2 },
  actionAvatar: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    minWidth: tokens.size.touchMin,
    minHeight: tokens.size.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: tokens.font.caption.size, fontWeight: '600', color: tokens.color.text },
  backButton: {
    minWidth: tokens.size.touchMin,
    minHeight: tokens.size.touchMin,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
