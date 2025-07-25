import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../theme/colors';
import type { VercelProject } from '../types';

interface ProjectCardProps {
  project: VercelProject;
  onPress: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
  const getStatusColor = () => {
    if (!project.latestDeployments || project.latestDeployments.length === 0) {
      return colors.gray[700];
    }
    const state = project.latestDeployments[0].state;
    if (state === 'READY') return colors.success;
    if (state === 'BUILDING') return colors.warning;
    if (state === 'ERROR') return colors.error;
    return colors.gray[600];
  };

  const getStatusText = () => {
    if (!project.latestDeployments || project.latestDeployments.length === 0) {
      return 'No deployments';
    }
    const deployment = project.latestDeployments[0];
    if (deployment.state === 'READY') return 'Production';
    return deployment.state;
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 30) return `${days}d`;
    return `${Math.floor(days / 30)}mo`;
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Row: Name and Status */}
      <View style={styles.row}>
        <View style={styles.nameSection}>
          <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
          {project.framework && (
            <View style={styles.frameworkBadge}>
              <Text style={styles.frameworkText}>{project.framework}</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.gray[600]} />
      </View>

      {/* Status Row */}
      <View style={styles.statusRow}>
        <View style={styles.statusLeft}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
        {project.latestDeployments && project.latestDeployments.length > 0 && (
          <Text style={styles.timeText}>
            {formatTimeAgo(project.latestDeployments[0].created)}
          </Text>
        )}
      </View>

      {/* Domain Row */}
      {project.link?.url && (
        <View style={styles.domainRow}>
          <Ionicons name="globe-outline" size={12} color={colors.gray[600]} />
          <Text style={styles.domainText} numberOfLines={1}>
            {project.link.url}
          </Text>
          <TouchableOpacity 
            style={styles.openButton}
            onPress={(e) => {
              e.stopPropagation();
              // Handle open in browser
            }}
          >
            <Ionicons name="open-outline" size={12} color={colors.gray[500]} />
          </TouchableOpacity>
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
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    letterSpacing: -0.2,
    flex: 1,
  },
  frameworkBadge: {
    backgroundColor: colors.gray[900],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  frameworkText: {
    fontSize: 10,
    color: colors.gray[500],
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    color: colors.gray[400],
    letterSpacing: -0.2,
  },
  timeText: {
    fontSize: 11,
    color: colors.gray[600],
    letterSpacing: -0.2,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[900],
  },
  domainText: {
    fontSize: 11,
    color: colors.gray[500],
    flex: 1,
    fontFamily: 'monospace',
    letterSpacing: -0.2,
  },
  openButton: {
    padding: 2,
  },
});
