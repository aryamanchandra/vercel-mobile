import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, animations } from '../theme/colors';

interface StatusBadgeProps {
  status: 'READY' | 'BUILDING' | 'ERROR' | 'QUEUED' | 'CANCELED' | 'INITIALIZING';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true,
  showDot = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'BUILDING' || status === 'INITIALIZING') {
      // Pulse animation for building status
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotation animation for icon
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [status]);

  const getStatusConfig = () => {
    const configs = {
      READY: {
        color: colors.success,
        bg: colors.successBg,
        label: 'Ready',
        icon: 'checkmark-circle' as const,
      },
      BUILDING: {
        color: colors.warning,
        bg: colors.warningBg,
        label: 'Building',
        icon: 'reload-circle' as const,
      },
      ERROR: {
        color: colors.error,
        bg: colors.errorBg,
        label: 'Error',
        icon: 'close-circle' as const,
      },
      QUEUED: {
        color: colors.gray[500],
        bg: 'rgba(115, 115, 115, 0.1)',
        label: 'Queued',
        icon: 'time' as const,
      },
      CANCELED: {
        color: colors.gray[500],
        bg: 'rgba(115, 115, 115, 0.1)',
        label: 'Canceled',
        icon: 'ban' as const,
      },
      INITIALIZING: {
        color: colors.accent.purple,
        bg: 'rgba(121, 40, 202, 0.1)',
        label: 'Initializing',
        icon: 'rocket' as const,
      },
    };
    return configs[status] || configs.QUEUED;
  };

  const config = getStatusConfig();
  const sizeConfig = {
    sm: { height: 20, paddingH: 6, fontSize: 10, iconSize: 12, dotSize: 6 },
    md: { height: 24, paddingH: 8, fontSize: 11, iconSize: 14, dotSize: 8 },
    lg: { height: 28, paddingH: 10, fontSize: 12, iconSize: 16, dotSize: 10 },
  }[size];

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, height: sizeConfig.height, paddingHorizontal: sizeConfig.paddingH }]}>
      {showDot && (
        <Animated.View 
          style={[
            styles.dot, 
            { 
              backgroundColor: config.color,
              width: sizeConfig.dotSize,
              height: sizeConfig.dotSize,
              borderRadius: sizeConfig.dotSize / 2,
              transform: [{ scale: status === 'BUILDING' || status === 'INITIALIZING' ? pulseAnim : 1 }]
            }
          ]} 
        />
      )}
      {showIcon && (
        <Animated.View style={{ transform: [{ rotate: status === 'BUILDING' || status === 'INITIALIZING' ? rotate : '0deg' }] }}>
          <Ionicons name={config.icon} size={sizeConfig.iconSize} color={config.color} />
        </Animated.View>
      )}
      <Text style={[styles.text, { color: config.color, fontSize: sizeConfig.fontSize }]}>
        {config.label.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  dot: {
    // Size set dynamically
  },
  text: {
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },
});

