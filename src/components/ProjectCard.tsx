import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/colors';
import type { VercelProject } from '../types';

interface ProjectCardProps {
  project: VercelProject;
  onPress: () => void;
  tags?: string[];
  onRedeploy?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress, tags = [], onRedeploy }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isLive, setIsLive] = useState<boolean | null>(null);
  const [imageError, setImageError] = useState(false);

  // Get project URL from multiple sources
  const getProjectUrl = () => {
    // Try production target first
    if (project.targets?.production?.url) {
      return project.targets.production.url;
    }
    // Try latest deployment
    if (project.latestDeployments && project.latestDeployments.length > 0) {
      return project.latestDeployments[0].url;
    }
    return null;
  };

  const projectUrl = getProjectUrl();

  // Get favicon/logo URL from the project domain
  const getProjectLogo = () => {
    if (!projectUrl) return null;
    // Use Google's favicon service or the actual favicon
    return `https://www.google.com/s2/favicons?domain=${projectUrl}&sz=128`;
  };

  const logoUrl = getProjectLogo();

  useEffect(() => {
    // Check if site is live
    checkSiteStatus();
  }, [projectUrl]);

  const checkSiteStatus = async () => {
    // Check deployment state from Vercel instead of HEAD request
    // HEAD requests can fail due to CORS, timeout, etc. even if site is live
    if (!project.latestDeployments || project.latestDeployments.length === 0) {
      setIsLive(null);
      return;
    }

    const latestDeployment = project.latestDeployments[0];
    // If deployment state is READY and has a URL, it's live
    setIsLive(latestDeployment.state === 'READY' && !!projectUrl);
  };

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
    if (!timestamp || isNaN(timestamp)) return 'recently';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (diff < 0) return 'just now';
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 30) return `${days}d`;
    if (days < 365) return `${Math.floor(days / 30)}mo`;
    return `${Math.floor(days / 365)}y`;
  };

  const getProjectColor = () => {
    const hash = project.name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const colors_list = ['#0070f3', '#7928ca', '#ff0080', '#50e3c2', '#f5a623', '#8b5cf6'];
    return colors_list[Math.abs(hash) % colors_list.length];
  };

  const handleOpenWebsite = (e: any) => {
    e.stopPropagation();
    if (projectUrl) {
      Linking.openURL(`https://${projectUrl}`);
    }
  };

  const handleRedeploy = (e: any) => {
    e.stopPropagation();
    if (onRedeploy) {
      onRedeploy();
    }
  };

  const lastDeployment = project.latestDeployments?.[0];
  const lastCommit = lastDeployment?.meta?.githubCommitMessage;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={styles.card} 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Top Row: Icon, Name, Live Status */}
        <View style={styles.topRow}>
          <View style={[styles.icon, { backgroundColor: getProjectColor() + '20', borderColor: getProjectColor() + '40' }]}>
            {logoUrl && !imageError ? (
              <Image 
                source={{ uri: logoUrl }}
                style={styles.iconImage}
                onError={() => setImageError(true)}
              />
            ) : (
              <Text style={[styles.iconText, { color: getProjectColor() }]}>
                {project.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
              {isLive !== null && (
                <View style={[styles.liveBadge, { backgroundColor: isLive ? colors.successBg : colors.errorBg }]}>
                  <View style={[styles.liveDot, { backgroundColor: isLive ? colors.success : colors.error }]} />
                  <Text style={[styles.liveText, { color: isLive ? colors.success : colors.error }]}>
                    {isLive ? 'LIVE' : 'DOWN'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tagsRow}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Status Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.infoText}>{getStatusText()}</Text>
          </View>
          
          {lastDeployment && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={12} color={colors.gray[600]} />
              <Text style={styles.infoText}>
                Deployed {formatTimeAgo(lastDeployment.created)}
              </Text>
            </View>
          )}
        </View>

        {/* Last Commit */}
        {lastCommit && (
          <View style={styles.commitRow}>
            <Ionicons name="git-commit-outline" size={12} color={colors.gray[600]} />
            <Text style={styles.commitText} numberOfLines={1}>
              {lastCommit}
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, !projectUrl && styles.actionButtonDisabled]}
            onPress={handleOpenWebsite}
            disabled={!projectUrl}
          >
            <Ionicons name="open-outline" size={16} color={projectUrl ? colors.foreground : colors.gray[600]} />
            <Text style={[styles.actionText, !projectUrl && styles.actionTextDisabled]}>Open</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleRedeploy}
          >
            <Ionicons name="reload-outline" size={16} color={colors.foreground} />
            <Text style={styles.actionText}>Redeploy</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onPress();
            }}
          >
            <Ionicons name="settings-outline" size={16} color={colors.foreground} />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    borderWidth: 0.5,
    borderColor: colors.gray[800],
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
  },
  iconText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
  },
  nameSection: {
    flex: 1,
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.normal,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  frameworkBadge: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignSelf: 'flex-start',
  },
  frameworkText: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.accent.blue + '20',
    borderWidth: 1,
    borderColor: colors.accent.blue + '40',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  tagText: {
    fontSize: typography.sizes.xs,
    color: colors.accent.blue,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  infoSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.foregroundMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  commitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  commitText: {
    fontSize: typography.sizes.sm,
    color: colors.foregroundMuted,
    letterSpacing: typography.letterSpacing.normal,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionText: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  actionTextDisabled: {
    color: colors.gray[600],
  },
});
