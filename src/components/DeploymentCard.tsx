import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/colors';
import { StatusBadge } from './StatusBadge';
import type { VercelDeployment } from '../types';

interface DeploymentCardProps {
  deployment: VercelDeployment;
  onPress: () => void;
  hideProjectName?: boolean;
  onRedeploy?: () => void | Promise<void>;
  redeploying?: boolean;
}

export const DeploymentCard: React.FC<DeploymentCardProps> = ({ deployment, onPress, hideProjectName = false, onRedeploy, redeploying = false }) => {
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
        {/* Top Row: Commit Message and Status */}
        <View style={styles.topRow}>
          {!hideProjectName && (
            <Text style={styles.projectName} numberOfLines={1}>
              {deployment.name}
            </Text>
          )}
          {hideProjectName && deployment.meta?.githubCommitMessage && (
            <Text style={styles.commitMsg} numberOfLines={1}>
              {deployment.meta.githubCommitMessage}
            </Text>
          )}
          {!hideProjectName && deployment.meta?.githubCommitMessage && (
            <Text style={styles.commitMsg} numberOfLines={1}>
              {deployment.meta.githubCommitMessage}
            </Text>
          )}
          <StatusBadge 
            status={deployment.state as any} 
            size="sm" 
            showIcon={false}
          />
        </View>

        {/* Bottom Row: Git SHA and Time + Redeploy */}
        <View style={styles.bottomRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            {deployment.meta?.githubCommitSha && (
              <Text style={styles.metaText}>
                {deployment.meta.githubCommitSha.slice(0, 7)}
              </Text>
            )}
            <Text style={styles.metaText}>
              {formatTimeAgo(deployment.created)}
            </Text>
          </View>
          {onRedeploy && (
            <TouchableOpacity
              accessibilityRole="button"
              disabled={redeploying}
              onPress={(e) => {
                e.stopPropagation();
                onRedeploy();
              }}
              style={[styles.redeployButton, redeploying && { opacity: 0.7 }]}
            >
              {redeploying ? (
                <ActivityIndicator size="small" color={colors.foreground} />
              ) : (
                <>
                  <Ionicons name="refresh" size={14} color={colors.foreground} />
                  <Text style={styles.redeployText}>Redeploy</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  projectName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.tight,
    flex: 1,
  },
  commitMsg: {
    fontSize: typography.sizes.base,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.normal,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  metaText: {
    fontSize: typography.sizes.sm,
    color: colors.foregroundMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  redeployButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 32,
  },
  redeployText: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
    fontWeight: typography.weights.semibold,
  },
});
