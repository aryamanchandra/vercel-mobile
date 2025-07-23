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

  const getDeploymentStateColor = (state: string) => {
    const colors: { [key: string]: string } = {
      READY: '#0070f3',
      BUILDING: '#f5a623',
      ERROR: '#ff0000',
      QUEUED: '#888',
    };
    return colors[state] || '#888';
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          {teamId ? 'Team Account' : 'Personal Account'}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('ProjectsTab')}
        >
          <Text style={styles.statNumber}>{stats.totalProjects}</Text>
          <Text style={styles.statLabel}>Projects</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('DeploymentsTab')}
        >
          <Text style={styles.statNumber}>{stats.totalDeployments}</Text>
          <Text style={styles.statLabel}>Deployments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('DomainsTab')}
        >
          <Text style={styles.statNumber}>{stats.totalDomains}</Text>
          <Text style={styles.statLabel}>Domains</Text>
        </TouchableOpacity>
      </View>

      {/* Deployment Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deployment Status</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusCard}>
            <View style={[styles.statusDot, { backgroundColor: '#0070f3' }]} />
            <Text style={styles.statusNumber}>{stats.readyDeployments}</Text>
            <Text style={styles.statusLabel}>Ready</Text>
          </View>
          <View style={styles.statusCard}>
            <View style={[styles.statusDot, { backgroundColor: '#f5a623' }]} />
            <Text style={styles.statusNumber}>{stats.buildingDeployments}</Text>
            <Text style={styles.statusLabel}>Building</Text>
          </View>
          <View style={styles.statusCard}>
            <View style={[styles.statusDot, { backgroundColor: '#ff0000' }]} />
            <Text style={styles.statusNumber}>{stats.errorDeployments}</Text>
            <Text style={styles.statusLabel}>Errors</Text>
          </View>
        </View>
      </View>

      {/* Recent Projects */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProjectsTab')}>
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>
        {recentProjects.map((project) => (
          <TouchableOpacity
            key={project.id}
            style={styles.projectCard}
            onPress={() => navigation.navigate('ProjectDetail', { project })}
          >
            <View style={styles.projectIcon}>
              <Text style={styles.projectIconText}>
                {project.framework?.charAt(0) || '◆'}
              </Text>
            </View>
            <View style={styles.projectInfo}>
              <Text style={styles.projectName}>{project.name}</Text>
              <Text style={styles.projectMeta}>
                {project.framework || 'No framework'} • {formatTimeAgo(project.createdAt)}
              </Text>
            </View>
            <Text style={styles.projectArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Deployments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Deployments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DeploymentsTab')}>
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>
        {recentDeployments.map((deployment) => (
          <TouchableOpacity
            key={deployment.uid}
            style={styles.deploymentCard}
            onPress={() => navigation.navigate('DeploymentDetail', { deployment })}
          >
            <View style={[styles.deploymentDot, { backgroundColor: getDeploymentStateColor(deployment.state) }]} />
            <View style={styles.deploymentInfo}>
              <Text style={styles.deploymentName}>{deployment.name}</Text>
              <Text style={styles.deploymentMeta}>
                {deployment.state} • {formatTimeAgo(deployment.created)}
              </Text>
            </View>
            <Text style={styles.deploymentArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('DeploymentsTab')}
          >
            <Text style={styles.quickActionIcon}>🚀</Text>
            <Text style={styles.quickActionText}>View Deployments</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('DomainsTab')}
          >
            <Text style={styles.quickActionIcon}>🌐</Text>
            <Text style={styles.quickActionText}>Manage Domains</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('SettingsTab')}
          >
            <Text style={styles.quickActionIcon}>⚙️</Text>
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#111',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  viewAllText: {
    fontSize: 14,
    color: '#0070f3',
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  statusNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statusLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 8,
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectIconText: {
    fontSize: 18,
    color: '#fff',
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  projectMeta: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  projectArrow: {
    fontSize: 16,
    color: '#666',
  },
  deploymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 8,
  },
  deploymentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  deploymentInfo: {
    flex: 1,
  },
  deploymentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  deploymentMeta: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  deploymentArrow: {
    fontSize: 16,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
});

