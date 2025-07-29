import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/colors';
import type { VercelProject } from '../types';

interface ProjectCardProps {
  project: VercelProject;
  onPress: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
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

  const getStatusColor = () => {
    if (!project.latestDeployments || project.latestDeployments.length === 0) {
      return colors.gray[600];
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

  // Generate color based on project name hash
  const getProjectColor = () => {
    const hash = project.name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const colors_list = ['#0070f3', '#7928ca', '#ff0080', '#50e3c2', '#f5a623', '#8b5cf6'];
    return colors_list[Math.abs(hash) % colors_list.length];
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
        {/* Top Row: Icon, Name, and Arrow */}
        <View style={styles.row}>
          <View style={[styles.icon, { backgroundColor: getProjectColor() + '20', borderColor: getProjectColor() + '40' }]}>
            <Text style={[styles.iconText, { color: getProjectColor() }]}>
              {project.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
              {project.framework && (
                <View style={styles.frameworkBadge}>
                  <Text style={styles.frameworkText}>{project.framework}</Text>
                </View>
              )}
            </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  nameSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.normal,
    flex: 1,
  },
  frameworkBadge: {
    backgroundColor: colors.backgroundHover,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  frameworkText: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    color: colors.foregroundMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  timeText: {
    fontSize: typography.sizes.xs,
    color: colors.gray[600],
    letterSpacing: typography.letterSpacing.normal,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  domainText: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
    flex: 1,
    fontFamily: 'monospace',
    letterSpacing: typography.letterSpacing.normal,
  },
  openButton: {
    padding: spacing.xs / 2,
  },
});
