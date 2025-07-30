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
    // Check if there's a production URL - if yes, it's live
    // Vercel only assigns production URLs to successfully deployed, live sites
    if (project.targets?.production?.url) {
      setIsLive(true);
      return;
    }

    // Otherwise check latest deployment state
    if (!project.latestDeployments || project.latestDeployments.length === 0) {
      setIsLive(null);
      return;
    }

    // Find production deployment
    const productionDeployment = project.latestDeployments.find(d => d.target === 'production');
    if (productionDeployment) {
      setIsLive(productionDeployment.state === 'READY');
      return;
    }

    // Fallback: check if any deployment is ready
    const hasReadyDeployment = project.latestDeployments.some(d => d.state === 'READY');
    setIsLive(hasReadyDeployment ? true : null);
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
    if (!timestamp || isNaN(timestamp)) {
      console.log('Invalid timestamp:', timestamp);
      return 'recently';
    }
    
    const now = Date.now();
    const diff = now - timestamp;
    
    // Log for debugging
    console.log('Timestamp:', timestamp, 'Now:', now, 'Diff:', diff);
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (diff < 0) return 'just now';
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
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

        {/* Metadata Row */}
        <View style={styles.metadataRow}>
          {lastDeployment && (
            <Text style={styles.metadataText}>
              Deployed {formatTimeAgo(lastDeployment.created)}
            </Text>
          )}
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Last Commit */}
        {lastCommit && (
          <Text style={styles.commitText} numberOfLines={1}>
            {lastCommit}
          </Text>
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
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconImage: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
  },
  iconText: {
    fontSize: typography.sizes.lg,
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
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.tight,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  liveText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metadataText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
    letterSpacing: typography.letterSpacing.normal,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.gray[900],
    borderWidth: 0.5,
    borderColor: colors.gray[800],
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  tagText: {
    fontSize: typography.sizes.xs,
    color: colors.gray[400],
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  commitText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    letterSpacing: typography.letterSpacing.normal,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    minHeight: 32,
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionText: {
    fontSize: typography.sizes.xs,
    color: colors.foreground,
    fontWeight: typography.weights.medium,
    letterSpacing: 0.3,
  },
  actionTextDisabled: {
    color: colors.gray[600],
  },
});
