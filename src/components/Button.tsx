import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: [styles.primaryContainer, disabled && styles.disabled],
          text: styles.primaryText,
        };
      case 'secondary':
        return {
          container: [styles.secondaryContainer, disabled && styles.disabled],
          text: styles.secondaryText,
        };
      case 'danger':
        return {
          container: [styles.dangerContainer, disabled && styles.disabled],
          text: styles.dangerText,
        };
      case 'ghost':
        return {
          container: [styles.ghostContainer, disabled && styles.disabled],
          text: styles.ghostText,
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: styles.smContainer,
          text: styles.smText,
          iconSize: 16,
        };
      case 'md':
        return {
          container: styles.mdContainer,
          text: styles.mdText,
          iconSize: 18,
        };
      case 'lg':
        return {
          container: styles.lgContainer,
          text: styles.lgText,
          iconSize: 20,
        };
      default:
        return {
          container: styles.mdContainer,
          text: styles.mdText,
          iconSize: 18,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && { width: '100%' }]}>
      <TouchableOpacity
        style={[
          styles.base,
          variantStyles.container,
          sizeStyles.container,
          fullWidth && styles.fullWidth,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.9}
      >
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' ? colors.background : colors.foreground} 
          />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === 'left' && (
              <Ionicons 
                name={icon} 
                size={sizeStyles.iconSize} 
                color={variantStyles.text.color} 
                style={{ marginRight: spacing.xs }}
              />
            )}
            <Text style={[variantStyles.text, sizeStyles.text]}>{title}</Text>
            {icon && iconPosition === 'right' && (
              <Ionicons 
                name={icon} 
                size={sizeStyles.iconSize} 
                color={variantStyles.text.color} 
                style={{ marginLeft: spacing.xs }}
              />
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  
  // Size variants
  smContainer: {
    height: 32,
    paddingHorizontal: spacing.md,
  },
  smText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  mdContainer: {
    height: 40,
    paddingHorizontal: spacing.base,
  },
  mdText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  lgContainer: {
    height: 48,
    paddingHorizontal: spacing.lg,
  },
  lgText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.normal,
  },
  
  // Variant styles
  primaryContainer: {
    backgroundColor: colors.foreground,
    borderWidth: 0,
  },
  primaryText: {
    color: colors.background,
  },
  secondaryContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  secondaryText: {
    color: colors.foreground,
  },
  dangerContainer: {
    backgroundColor: colors.error,
    borderWidth: 0,
  },
  dangerText: {
    color: colors.foreground,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  ghostText: {
    color: colors.foregroundMuted,
  },
  disabled: {
    opacity: 0.5,
  },
});
