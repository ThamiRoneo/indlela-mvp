import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle2,
  WifiOff,
  Fuel,
} from 'lucide-react-native';

type BannerProps = {
  variant?: 'alert' | 'info' | 'error' | 'success';
  children: React.ReactNode;
  icon?: string | React.ReactNode;
  title?: string;
};

const variantStyles = {
  alert: {
    bg: '#fef7e0',
    border: '#f9ab00',
    text: '#202124',
    titleColor: '#b06000',
  },
  info: {
    bg: '#e8f0fe',
    border: '#1a73e8',
    text: '#202124',
    titleColor: '#174ea6',
  },
  error: {
    bg: '#fce8e6',
    border: '#ea4335',
    text: '#202124',
    titleColor: '#c5221f',
  },
  success: {
    bg: '#e6f4ea',
    border: '#34a853',
    text: '#202124',
    titleColor: '#137333',
  },
};

export const Banner = ({ variant = 'info', children, icon, title }: BannerProps) => {
  const current = variantStyles[variant] || variantStyles.info;

  const renderIcon = () => {
    if (React.isValidElement(icon)) return icon;
    if (icon === '🛜') {
      return <WifiOff size={18} color={current.titleColor} strokeWidth={2} />;
    }
    if (icon === '⛽') {
      return <Fuel size={18} color={current.titleColor} strokeWidth={2} />;
    }
    if (icon === '⚠') {
      return <AlertTriangle size={18} color={current.titleColor} strokeWidth={2} />;
    }
    if (icon === 'ℹ') {
      return <Info size={18} color={current.titleColor} strokeWidth={2} />;
    }
    if (icon === '!') {
      return <AlertCircle size={18} color={current.titleColor} strokeWidth={2} />;
    }
    if (icon === '✓') {
      return <CheckCircle2 size={18} color={current.titleColor} strokeWidth={2} />;
    }
    if (typeof icon === 'string') {
      return <Text style={[styles.iconText, { color: current.titleColor }]}>{icon}</Text>;
    }

    // Default variant icons
    switch (variant) {
      case 'alert':
        return <AlertTriangle size={18} color={current.titleColor} strokeWidth={2} />;
      case 'error':
        return <AlertCircle size={18} color={current.titleColor} strokeWidth={2} />;
      case 'success':
        return <CheckCircle2 size={18} color={current.titleColor} strokeWidth={2} />;
      case 'info':
      default:
        return <Info size={18} color={current.titleColor} strokeWidth={2} />;
    }
  };

  return (
    <View style={[styles.banner, { backgroundColor: current.bg, borderColor: current.border }]}>
      <View style={styles.iconWrap}>{renderIcon()}</View>
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
