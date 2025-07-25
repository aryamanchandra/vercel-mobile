import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../theme/colors';
import type { VercelDeployment } from '../types';

interface DeploymentCardProps {
  deployment: VercelDeployment;
  onPress: () => void;
}

export const DeploymentCard: React.FC<DeploymentCardProps> = ({ deployment, onPress }) => {
  const getStateConfig = (state: string) => {
    const configs: { [key: string]: { color: string; bg: string } } = {
      READY: { color: colors.success, bg: 'rgba(0, 112, 243, 0.1)' },
      BUILDING: { color: colors.warning, bg: 'rgba(245, 166, 35, 0.1)' },
      ERROR: { color: colors.error, bg: 'rgba(238, 0, 0, 0.1)' },
      QUEUED: { color: colors.gray[600], bg: colors.gray[900] },
      INITIALIZING: { color: colors.gray[600], bg: colors.gray[900] },
      CANCELED: { color: colors.gray[600], bg: colors.gray[900] },
    };
    return configs[state] || configs.QUEUED;
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

  const stateConfig = getStateConfig(deployment.state);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
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
        <View style={[styles.stateBadge, { backgroundColor: stateConfig.bg }]}>
          <View style={[styles.stateDot, { backgroundColor: stateConfig.color }]} />
          <Text style={[styles.stateText, { color: stateConfig.color }]}>
            {deployment.state}
          </Text>
        </View>
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
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  leftSection: {
    flex: 1,
    gap: 4,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    letterSpacing: -0.2,
    flex: 1,
  },
  prodBadge: {
    backgroundColor: colors.accent.blue,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  prodText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: 0.3,
  },
  commitMsg: {
    fontSize: 12,
    color: colors.gray[500],
    letterSpacing: -0.2,
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stateDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  stateText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.gray[600],
    letterSpacing: -0.2,
  },
  viewButton: {
    padding: 4,
  },
});
