import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BannerProps = {
  variant?: 'alert' | 'info' | 'error' | 'success';
  children: React.ReactNode;
  icon?: string;
  title?: string;
};

const variantStyles = {
  alert: {
    bg: '#fef7e0',
    border: '#f9ab00',
    text: '#202124',
    titleColor: '#b06000',
    defaultIcon: '⚠',
  },
  info: {
    bg: '#e8f0fe',
    border: '#1a73e8',
    text: '#202124',
    titleColor: '#174ea6',
    defaultIcon: 'ℹ',
  },
  error: {
    bg: '#fce8e6',
    border: '#ea4335',
    text: '#202124',
    titleColor: '#c5221f',
    defaultIcon: '!',
  },
  success: {
    bg: '#e6f4ea',
    border: '#34a853',
    text: '#202124',
    titleColor: '#137333',
    defaultIcon: '✓',
  },
};

export const Banner = ({ variant = 'info', children, icon, title }: BannerProps) => {
  const current = variantStyles[variant] || variantStyles.info;
  const displayIcon = icon !== undefined ? icon : current.defaultIcon;

  return (
    <View style={[styles.banner, { backgroundColor: current.bg, borderColor: current.border }]}>
      {displayIcon ? (
        <View style={styles.iconWrap}>
          <Text style={[styles.iconText, { color: current.titleColor }]}>{displayIcon}</Text>
        </View>
      ) : null}
      <View style={styles.contentWrap}>
        {title ? (
          <Text style={[styles.title, { color: current.titleColor }]}>{title}</Text>
        ) : null}
        <Text style={[styles.text, { color: current.text }]}>{children}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
  },
  iconWrap: {
    marginRight: 10,
    marginTop: 1,
  },
  iconText: {
    fontSize: 16,
    fontWeight: '700',
  },
  contentWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
  },
});
