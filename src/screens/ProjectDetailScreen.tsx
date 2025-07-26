import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { DeploymentCard } from '../components/DeploymentCard';
import { VercelProject, VercelDeployment, VercelDomain } from '../types';

type TabId = 'overview' | 'envvars' | 'activity';

export const ProjectDetailScreen = ({ route, navigation }: any) => {
  const { project } = route.params as { project: VercelProject };
  const { api } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(false);
  const [deployments, setDeployments] = useState<VercelDeployment[]>([]);
  const [domains, setDomains] = useState<VercelDomain[]>([]);

  useEffect(() => {
    navigation.setOptions({
      title: project.name,
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
    { id: 'envvars' as TabId, label: 'Env Vars', icon: 'key-outline' },
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
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.projectInfo}>
            <Text style={styles.projectName}>{project.name}</Text>
            {project.framework && (
              <View style={styles.frameworkBadge}>
                <Text style={styles.frameworkText}>{project.framework}</Text>
              </View>
            )}
          </View>
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
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Deployments</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('DeploymentsTab')}>
                      <Text style={styles.viewAll}>View All →</Text>
                    </TouchableOpacity>
                  </View>

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
                    {project.framework && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Framework</Text>
                        <Text style={styles.infoValue}>{project.framework}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'envvars' && (
              <View style={styles.tabContent}>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Environment Variables</Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('EnvVariables', { project })}
                    >
                      <Ionicons name="add-circle-outline" size={24} color={colors.accent.blue} />
                    </TouchableOpacity>
                  </View>
                  <Button
                    title="Manage Environment Variables"
                    onPress={() => navigation.navigate('EnvVariables', { project })}
                    variant="secondary"
                  />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    gap: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  projectInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  projectName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  frameworkBadge: {
    backgroundColor: colors.gray[900],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  frameworkText: {
    fontSize: 11,
    color: colors.gray[500],
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  domain: {
    fontSize: 13,
    color: colors.gray[500],
    letterSpacing: -0.2,
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
    paddingHorizontal: spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.foreground,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[500],
    letterSpacing: -0.2,
  },
  tabTextActive: {
    color: colors.foreground,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: spacing.md,
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
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.gray[950],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.gray[500],
    letterSpacing: -0.2,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  viewAll: {
    fontSize: 13,
    color: colors.accent.blue,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  domainCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray[950],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  domainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  domainText: {
    fontSize: 13,
    color: colors.foreground,
    letterSpacing: -0.2,
    fontFamily: 'monospace',
  },
  infoCard: {
    backgroundColor: colors.gray[950],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: colors.gray[500],
    letterSpacing: -0.2,
  },
  infoValue: {
    fontSize: 13,
    color: colors.foreground,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  emptyCard: {
    backgroundColor: colors.gray[950],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.gray[500],
    letterSpacing: -0.2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gray[950],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activityInfo: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  activityMeta: {
    fontSize: 12,
    color: colors.gray[500],
    letterSpacing: -0.2,
  },
  activityTime: {
    fontSize: 11,
    color: colors.gray[600],
    letterSpacing: -0.2,
  },
});
