import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../theme/colors';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'gray';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ 
  label, 
  variant = 'default',
  size = 'md',
  style 
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: 'rgba(0, 112, 243, 0.1)',
          borderColor: 'rgba(0, 112, 243, 0.3)',
        };
      case 'error':
        return {
          backgroundColor: 'rgba(238, 0, 0, 0.1)',
          borderColor: 'rgba(238, 0, 0, 0.3)',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(245, 166, 35, 0.1)',
          borderColor: 'rgba(245, 166, 35, 0.3)',
        };
      case 'gray':
        return {
          backgroundColor: colors.gray[900],
          borderColor: colors.gray[800],
        };
      default:
        return {
          backgroundColor: colors.gray[900],
          borderColor: colors.gray[700],
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'success':
        return colors.accent.blue;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'gray':
        return colors.gray[400];
      default:
        return colors.gray[300];
    }
  };

  return (
    <View style={[
      styles.badge, 
      getVariantStyle(),
      size === 'sm' && styles.badgeSm,
      style
    ]}>
      <Text style={[
        styles.text,
        { color: getTextColor() },
        size === 'sm' && styles.textSm,
      ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  textSm: {
    fontSize: 10,
  },
});

