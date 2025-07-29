import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/colors';
import { StatusBadge } from './StatusBadge';
import type { VercelDeployment } from '../types';

interface DeploymentCardProps {
  deployment: VercelDeployment;
  onPress: () => void;
}

export const DeploymentCard: React.FC<DeploymentCardProps> = ({ deployment, onPress }) => {
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

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const getStateColor = (state: string) => {
    if (state === 'READY') return colors.success;
    if (state === 'BUILDING') return colors.warning;
    if (state === 'ERROR') return colors.error;
    return colors.gray[600];
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
        {/* Top Row */}
        <View style={styles.topRow}>
          <View style={styles.leftSection}>
            <View style={styles.projectInfo}>
              <Text style={styles.projectName} numberOfLines={1}>
                {deployment.name}
              </Text>
              {deployment.target === 'production' && (
                <View style={styles.prodBadge}>
                  <Text style={styles.prodText}>PROD</Text>
                </View>
              )}
            </View>
            {deployment.meta?.githubCommitMessage && (
              <Text style={styles.commitMsg} numberOfLines={1}>
                {deployment.meta.githubCommitMessage}
              </Text>
            )}
          </View>
          <StatusBadge 
            status={deployment.state as any} 
            size="sm" 
            showIcon={false}
          />
        </View>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          <View style={styles.metaSection}>
            {deployment.meta?.githubCommitSha && (
              <View style={styles.metaItem}>
                <Ionicons name="git-commit-outline" size={11} color={colors.gray[600]} />
                <Text style={styles.metaText}>
                  {deployment.meta.githubCommitSha.slice(0, 7)}
                </Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={11} color={colors.gray[600]} />
              <Text style={styles.metaText}>
                {formatTimeAgo(deployment.created)}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={(e) => {
              e.stopPropagation();
              onPress();
            }}
          >
            <Ionicons name="open-outline" size={14} color={colors.gray[500]} />
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 2,
  },
  leftSection: {
    flex: 1,
    gap: spacing.xs,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  projectName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.normal,
    flex: 1,
  },
  prodBadge: {
    backgroundColor: colors.accent.blue,
    paddingHorizontal: spacing.sm - 1,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  prodText: {
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.bold,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.wide,
  },
  commitMsg: {
    fontSize: typography.sizes.sm,
    color: colors.foregroundMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.sizes.xs,
    color: colors.gray[600],
    letterSpacing: typography.letterSpacing.normal,
  },
  viewButton: {
    padding: spacing.xs,
  },
});
