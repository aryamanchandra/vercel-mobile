import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { DeploymentCard } from '../components/DeploymentCard';
import { VercelProject, VercelDeployment, VercelDomain } from '../types';

type TabId = 'overview' | 'activity';

export const ProjectDetailScreen = ({ route, navigation }: any) => {
  const { project } = route.params as { project: VercelProject };
  const { api } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(false);
  const [deployments, setDeployments] = useState<VercelDeployment[]>([]);
  const [domains, setDomains] = useState<VercelDomain[]>([]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleOpenProject}
          style={styles.headerButton}
        >
          <Ionicons name="open-outline" size={20} color={colors.foreground} />
        </TouchableOpacity>
      ),
    });
    fetchProjectData();
  }, [project]);

  const fetchProjectData = async () => {
    if (!api) return;
    
    try {
      setLoading(true);
      const [deploymentsRes, domainsRes] = await Promise.all([
        api.getDeployments(20),
        api.getDomains(100),
      ]);
      
      const projectDeployments = deploymentsRes.deployments
        .filter(d => d.name === project.name)
        .slice(0, 5);
      
      setDeployments(projectDeployments);
      setDomains(domainsRes.domains);
    } catch (err) {
      console.error('Error fetching project data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProject = () => {
    if (project.link?.url) {
      Linking.openURL(`https://${project.link.url}`);
    }
  };

  const handleDeploy = () => {
    // Would trigger a new deployment
    console.log('Trigger deploy for:', project.name);
  };

  const tabs = [
    { id: 'overview' as TabId, label: 'Overview', icon: 'grid-outline' },
    { id: 'activity' as TabId, label: 'Activity', icon: 'time-outline' },
  ];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = () => {
    if (!deployments.length) return colors.gray[600];
    const state = deployments[0].state;
    if (state === 'READY') return colors.success;
    if (state === 'BUILDING') return colors.warning;
    if (state === 'ERROR') return colors.error;
    return colors.gray[600];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.projectName}>{project.name}</Text>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        </View>

        {project.link?.url && (
          <Text style={styles.domain}>{project.link.url}</Text>
        )}

        <View style={styles.actionButtons}>
          <Button
            title="Deploy"
            onPress={handleDeploy}
            variant="primary"
            style={styles.actionButton}
          />
          <Button
            title="Settings"
            onPress={() => navigation.navigate('ProjectSettings', { project })}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.id ? colors.foreground : colors.gray[500]}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.foreground} />
          </View>
        ) : (
          <>
            {activeTab === 'overview' && (
              <View style={styles.tabContent}>
                {/* Project Stats */}
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{deployments.length}</Text>
                    <Text style={styles.statLabel}>Deployments</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{domains.length}</Text>
                    <Text style={styles.statLabel}>Domains</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{project.framework || 'N/A'}</Text>
                    <Text style={styles.statLabel}>Framework</Text>
                  </View>
                </View>

                {/* Recent Deployments */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recent Deployments</Text>

                  {deployments.length === 0 ? (
                    <View style={styles.emptyCard}>
                      <Text style={styles.emptyText}>No deployments yet</Text>
                    </View>
                  ) : (
                    deployments.map((deployment) => (
                      <DeploymentCard
                        key={deployment.uid}
                        deployment={deployment}
                        onPress={() => navigation.navigate('DeploymentDetail', { deployment })}
                        hideProjectName={true}
                      />
                    ))
                  )}
                </View>

                {/* Production Domain */}
                {project.link?.url && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Production Domain</Text>
                    <TouchableOpacity
                      style={styles.domainCard}
                      onPress={() => Linking.openURL(`https://${project.link?.url}`)}
                    >
                      <View style={styles.domainInfo}>
                        <Ionicons name="globe-outline" size={18} color={colors.foreground} />
                        <Text style={styles.domainText}>{project.link.url}</Text>
                      </View>
                      <Ionicons name="open-outline" size={16} color={colors.gray[500]} />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Project Info */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Project Info</Text>
                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Created</Text>
                      <Text style={styles.infoValue}>{formatDate(project.createdAt)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Last Updated</Text>
                      <Text style={styles.infoValue}>{formatDate(project.updatedAt)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'activity' && (
              <View style={styles.tabContent}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recent Activity</Text>
                  {deployments.length === 0 ? (
                    <View style={styles.emptyCard}>
                      <Text style={styles.emptyText}>No activity yet</Text>
                    </View>
                  ) : (
                    deployments.map((deployment) => (
                      <View key={deployment.uid} style={styles.activityItem}>
                        <View style={[
                          styles.activityDot,
                          { backgroundColor: deployment.state === 'READY' ? colors.success : colors.warning }
                        ]} />
                        <View style={styles.activityInfo}>
                          <Text style={styles.activityTitle}>
                            {deployment.state === 'READY' ? 'Deployed' : 'Deploying'}
                          </Text>
                          <Text style={styles.activityMeta}>
                            {deployment.meta?.githubCommitMessage || 'No commit message'}
                          </Text>
                          <Text style={styles.activityTime}>
                            {formatDate(deployment.created)}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => navigation.navigate('DeploymentDetail', { deployment })}
                        >
                          <Ionicons name="chevron-forward" size={16} color={colors.gray[600]} />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    gap: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectName: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.semibold,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.tight,
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
  },
  domain: {
    fontSize: typography.sizes.base,
    color: colors.foregroundMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  headerButton: {
    padding: spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    paddingHorizontal: spacing.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minHeight: 44,
  },
  tabActive: {
    borderBottomColor: colors.foreground,
  },
  tabText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.gray[500],
    letterSpacing: typography.letterSpacing.normal,
  },
  tabTextActive: {
    color: colors.foreground,
    fontWeight: typography.weights.semibold,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  tabContent: {
    gap: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.foregroundMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.tight,
  },
  domainCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    minHeight: 44,
  },
  domainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  domainText: {
    fontSize: typography.sizes.base,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.normal,
    fontFamily: 'monospace',
  },
  infoCard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: typography.sizes.base,
    color: colors.foregroundMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  infoValue: {
    fontSize: typography.sizes.base,
    color: colors.foreground,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  emptyCard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.foregroundMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    minHeight: 44,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  activityInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  activityTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.normal,
  },
  activityMeta: {
    fontSize: typography.sizes.sm,
    color: colors.foregroundMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  activityTime: {
    fontSize: typography.sizes.xs,
    color: colors.gray[600],
    letterSpacing: typography.letterSpacing.normal,
  },
});
