import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { VercelProject, VercelDeployment } from '../types';

export const DashboardScreen = ({ navigation }: any) => {
  const { api, teamId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalDeployments: 0,
    totalDomains: 0,
    readyDeployments: 0,
    buildingDeployments: 0,
    errorDeployments: 0,
  });
  const [recentProjects, setRecentProjects] = useState<VercelProject[]>([]);
  const [recentDeployments, setRecentDeployments] = useState<VercelDeployment[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [api, teamId]);

  const fetchDashboardData = async (isRefreshing = false) => {
    if (!api) return;

    try {
      if (!isRefreshing) setLoading(true);

      const [projectsResponse, deploymentsResponse, domainsResponse] = await Promise.all([
        api.getProjects(100),
        api.getDeployments(50),
        api.getDomains(100),
      ]);

      const deployments = deploymentsResponse.deployments;
      
      setStats({
        totalProjects: projectsResponse.projects.length,
        totalDeployments: deployments.length,
        totalDomains: domainsResponse.domains.length,
        readyDeployments: deployments.filter(d => d.state === 'READY').length,
        buildingDeployments: deployments.filter(d => d.state === 'BUILDING').length,
        errorDeployments: deployments.filter(d => d.state === 'ERROR').length,
      });

      setRecentProjects(projectsResponse.projects.slice(0, 3));
      setRecentDeployments(deployments.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData(true);
  }, [api, teamId]);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return 'today';
    if (days === 1) return '1d ago';
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.foreground} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.foreground} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.accountType}>{teamId ? 'Team Account' : 'Personal Account'}</Text>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <TouchableOpacity
          style={styles.kpiCard}
          onPress={() => navigation.navigate('ProjectsTab')}
          activeOpacity={0.7}
        >
          <Text style={styles.kpiValue}>{stats.totalProjects}</Text>
          <Text style={styles.kpiLabel}>Projects</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.kpiCard}
          onPress={() => navigation.navigate('DeploymentsTab')}
          activeOpacity={0.7}
        >
          <Text style={styles.kpiValue}>{stats.totalDeployments}</Text>
          <Text style={styles.kpiLabel}>Deployments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.kpiCard}
          onPress={() => navigation.navigate('DomainsTab')}
          activeOpacity={0.7}
        >
          <Text style={styles.kpiValue}>{stats.totalDomains}</Text>
          <Text style={styles.kpiLabel}>Domains</Text>
        </TouchableOpacity>
      </View>

      {/* Deployment Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deployment Status</Text>
        <View style={styles.statusGrid}>
          <TouchableOpacity style={styles.statusCard} activeOpacity={0.7}>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <Text style={styles.statusValue}>{stats.readyDeployments}</Text>
            <Text style={styles.statusLabel}>Ready</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statusCard} activeOpacity={0.7}>
            <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.statusValue}>{stats.buildingDeployments}</Text>
            <Text style={styles.statusLabel}>Building</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statusCard} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DeploymentsTab')}
          >
            <View style={[styles.statusDot, { backgroundColor: colors.error }]} />
            <Text style={styles.statusValue}>{stats.errorDeployments}</Text>
            <Text style={styles.statusLabel}>Errors</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Projects */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProjectsTab')}>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>

        {recentProjects.map((project) => (
          <TouchableOpacity
            key={project.id}
            style={styles.projectRow}
            onPress={() => navigation.navigate('ProjectDetail', { project })}
            activeOpacity={0.7}
          >
            <View style={styles.projectIcon}>
              <Text style={styles.projectIconText}>
                {project.name.charAt(0).toLowerCase()}
              </Text>
            </View>
            <View style={styles.projectInfo}>
              <Text style={styles.projectName} numberOfLines={1}>
                {project.name}
              </Text>
              <Text style={styles.projectMeta}>
                {project.framework || 'nextjs'} · {formatTimeAgo(project.createdAt)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.gray[600]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Deployments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Deployments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DeploymentsTab')}>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>

        {recentDeployments.map((deployment) => (
          <TouchableOpacity
            key={deployment.uid}
            style={styles.deploymentRow}
            onPress={() => navigation.navigate('DeploymentDetail', { deployment })}
            activeOpacity={0.7}
          >
            <View style={[
              styles.deploymentDot,
              { backgroundColor: deployment.state === 'READY' ? colors.success : deployment.state === 'BUILDING' ? colors.warning : colors.error }
            ]} />
            <View style={styles.deploymentInfo}>
              <Text style={styles.deploymentName} numberOfLines={1}>
                {deployment.name}
              </Text>
              <Text style={styles.deploymentMeta}>
                {deployment.state} · {formatTimeAgo(deployment.created)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.gray[600]} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.8,
    marginBottom: spacing.xs,
  },
  accountType: {
    fontSize: 13,
    color: colors.gray[500],
    letterSpacing: -0.2,
  },
  kpiGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: 12,
    marginBottom: spacing.lg,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.gray[950],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -1,
    marginBottom: spacing.xs,
  },
  kpiLabel: {
    fontSize: 13,
    color: colors.gray[500],
    letterSpacing: -0.2,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  viewAll: {
    fontSize: 14,
    color: colors.accent.blue,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: colors.gray[950],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  statusValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.8,
    marginBottom: 2,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.gray[500],
    letterSpacing: -0.2,
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[950],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: 12,
    marginBottom: 8,
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  projectIconText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  projectMeta: {
    fontSize: 12,
    color: colors.gray[500],
    letterSpacing: -0.2,
  },
  deploymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[950],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: 12,
    marginBottom: 8,
  },
  deploymentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  deploymentInfo: {
    flex: 1,
  },
  deploymentName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  deploymentMeta: {
    fontSize: 12,
    color: colors.gray[500],
    letterSpacing: -0.2,
  },
});
