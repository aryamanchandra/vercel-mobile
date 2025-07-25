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
  const getFrameworkIcon = (framework?: string) => {
    const icons: { [key: string]: string } = {
      nextjs: 'logo-react',
      react: 'logo-react',
      vue: 'logo-vue',
      angular: 'logo-angular',
      svelte: 'logo-web-component',
      gatsby: 'logo-react',
      nuxt: 'logo-vue',
      default: 'code-outline',
    };
    return icons[framework?.toLowerCase() || 'default'] || icons.default;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getFrameworkIcon(project.framework) as any} 
            size={20} 
            color={colors.foreground}
          />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.name} numberOfLines={1}>
            {project.name}
          </Text>
          <View style={styles.meta}>
            {project.framework && (
              <>
                <Text style={styles.metaText}>{project.framework}</Text>
                <View style={styles.dot} />
              </>
            )}
            <Text style={styles.metaText}>{formatDate(project.createdAt)}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.gray[600]} />
      </View>

      {project.latestDeployments && project.latestDeployments.length > 0 && (
        <View style={styles.footer}>
          <View style={[
            styles.statusDot,
            { backgroundColor: project.latestDeployments[0].state === 'READY' ? colors.success : colors.warning }
          ]} />
          <Text style={styles.footerText}>
            {project.latestDeployments[0].state === 'READY' ? 'Production' : project.latestDeployments[0].state}
          </Text>
          {project.link?.url && (
            <>
              <View style={styles.dot} />
              <Text style={styles.footerLink} numberOfLines={1}>
                {project.link.url}
              </Text>
            </>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: colors.gray[500],
    letterSpacing: -0.2,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.gray[700],
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
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  footerText: {
    fontSize: 12,
    color: colors.gray[400],
    letterSpacing: -0.2,
  },
  footerLink: {
    fontSize: 12,
    color: colors.gray[500],
    flex: 1,
    letterSpacing: -0.2,
  },
});
