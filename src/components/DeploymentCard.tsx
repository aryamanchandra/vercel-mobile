import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../theme/colors';
import { Badge } from './Badge';
import type { VercelDeployment } from '../types';

interface DeploymentCardProps {
  deployment: VercelDeployment;
  onPress: () => void;
}

export const DeploymentCard: React.FC<DeploymentCardProps> = ({ deployment, onPress }) => {
  const getStateConfig = (state: string) => {
    const configs: { [key: string]: { variant: 'success' | 'warning' | 'error' | 'gray'; icon: string } } = {
      READY: { variant: 'success', icon: 'checkmark-circle' },
      BUILDING: { variant: 'warning', icon: 'time' },
      ERROR: { variant: 'error', icon: 'close-circle' },
      QUEUED: { variant: 'gray', icon: 'hourglass' },
      INITIALIZING: { variant: 'gray', icon: 'ellipsis-horizontal' },
      CANCELED: { variant: 'gray', icon: 'ban' },
    };
    return configs[state] || configs.QUEUED;
  };

  const getTargetIcon = (target?: string) => {
    if (target === 'production') return 'rocket';
    if (target === 'preview') return 'eye';
    return 'git-branch';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const stateConfig = getStateConfig(deployment.state);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.projectInfo}>
            <Ionicons 
              name={getTargetIcon(deployment.target) as any}
              size={14} 
              color={colors.gray[500]}
              style={styles.icon}
            />
            <Text style={styles.name} numberOfLines={1}>
              {deployment.name}
            </Text>
          </View>
          <Badge label={deployment.state} variant={stateConfig.variant} size="sm" />
        </View>

        {deployment.meta?.githubCommitMessage && (
          <Text style={styles.commitMessage} numberOfLines={1}>
            {deployment.meta.githubCommitMessage}
          </Text>
        )}

        <View style={styles.meta}>
          <Ionicons name="git-commit-outline" size={12} color={colors.gray[600]} />
          <Text style={styles.metaText}>
            {deployment.meta?.githubCommitSha?.slice(0, 7) || 'Unknown'}
          </Text>
          <View style={styles.dot} />
          <Text style={styles.metaText}>{formatDate(deployment.created)}</Text>
          {deployment.target === 'production' && (
            <>
              <View style={styles.dot} />
              <View style={styles.prodBadge}>
                <Text style={styles.prodText}>PROD</Text>
              </View>
            </>
          )}
        </View>
      </View>

      {deployment.url && (
        <View style={styles.footer}>
          <Ionicons name="globe-outline" size={12} color={colors.gray[600]} />
          <Text style={styles.url} numberOfLines={1}>
            {deployment.url}
          </Text>
          <Ionicons name="open-outline" size={12} color={colors.gray[600]} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: spacing.xs,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    letterSpacing: -0.2,
    flex: 1,
  },
  commitMessage: {
    fontSize: 12,
    color: colors.gray[400],
    letterSpacing: -0.2,
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metaText: {
    fontSize: 11,
    color: colors.gray[600],
    letterSpacing: -0.2,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.gray[700],
  },
  prodBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    backgroundColor: colors.accent.blue,
  },
  prodText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.foreground,
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  url: {
    fontSize: 11,
    color: colors.gray[500],
    letterSpacing: -0.2,
    flex: 1,
    fontFamily: 'monospace',
  },
});
