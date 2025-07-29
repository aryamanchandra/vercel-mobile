import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/colors';
import type { VercelDomain } from '../types';

interface DomainCardProps {
  domain: VercelDomain;
  onPress: () => void;
  onManageDNS: () => void;
}

export const DomainCard: React.FC<DomainCardProps> = ({ domain, onPress, onManageDNS }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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

  const handleOpenDomain = (e: any) => {
    e.stopPropagation();
    Linking.openURL(`https://${domain.name}`);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={styles.card} 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.nameSection}>
            <Ionicons name="globe-outline" size={16} color={colors.foreground} />
            <Text style={styles.name} numberOfLines={1}>{domain.name}</Text>
          </View>
          {domain.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color={colors.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{domain.serviceType || 'External'}</Text>
          </View>
          {domain.cdnEnabled && (
            <View style={styles.cdnBadge}>
              <Ionicons name="flash" size={10} color={colors.accent.cyan} />
              <Text style={styles.cdnText}>CDN</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleOpenDomain}>
            <Ionicons name="open-outline" size={14} color={colors.foregroundMuted} />
            <Text style={styles.actionText}>Open</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={(e) => {
              e.stopPropagation();
              onManageDNS();
            }}
          >
            <Ionicons name="settings-outline" size={14} color={colors.foregroundMuted} />
            <Text style={styles.actionText}>DNS</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginBottom: spacing.md,
    gap: spacing.sm + 2,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.normal,
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  verifiedText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.success,
    letterSpacing: typography.letterSpacing.normal,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoItem: {
    gap: 2,
  },
  infoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.gray[600],
    letterSpacing: typography.letterSpacing.normal,
  },
  infoValue: {
    fontSize: typography.sizes.xs,
    color: colors.foregroundMuted,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  cdnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(80, 227, 194, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  cdnText: {
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.bold,
    color: colors.accent.cyan,
    letterSpacing: typography.letterSpacing.wide,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionText: {
    fontSize: typography.sizes.sm,
    color: colors.foregroundMuted,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border.default,
  },
});
