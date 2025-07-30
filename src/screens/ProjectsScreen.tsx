import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Alert,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/ProjectCard';
import { EmptyState } from '../components/EmptyState';
import { GlobalSearch } from '../components/GlobalSearch';
import { SkeletonList } from '../components/SkeletonLoader';
import { VercelProject } from '../types';

// Project tags - stored in AsyncStorage for persistence
const PROJECT_TAGS: { [key: string]: string[] } = {};

// Helper to load tags from AsyncStorage
const loadProjectTags = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const stored = await AsyncStorage.getItem('projectTags');
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.assign(PROJECT_TAGS, parsed);
    }
  } catch (error) {
    console.error('Failed to load project tags:', error);
  }
};

export const ProjectsScreen = ({ navigation }: any) => {
  const { api } = useAuth();
  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<VercelProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployingProject, setDeployingProject] = useState<string | null>(null);

  const fetchProjects = async (isRefreshing = false) => {
    if (!api) return;

    try {
      if (!isRefreshing) setLoading(true);
      setError(null);
      
      // Fetch projects
      const response = await api.getProjects(100);
      const projectsList = response.projects;
      
      // Fetch latest deployments for each project to get accurate data
      const projectsWithDeployments = await Promise.all(
        projectsList.map(async (project) => {
          try {
            // Get latest 3 deployments for this project
            const deployments = await api.getDeployments(3, undefined, project.id);
            return {
              ...project,
              latestDeployments: deployments.deployments || []
            };
          } catch (error) {
            // If fetching deployments fails, return project without them
            console.error(`Failed to fetch deployments for ${project.name}:`, error);
            return project;
          }
        })
      );
      
      setProjects(projectsWithDeployments);
      setFilteredProjects(projectsWithDeployments);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjectTags(); // Load saved tags
    fetchProjects();
  }, [api]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const filtered = projects.filter(project => {
      const matchesName = project.name.toLowerCase().includes(query.toLowerCase());
      const matchesFramework = project.framework?.toLowerCase().includes(query.toLowerCase());
      const matchesTags = PROJECT_TAGS[project.id]?.some(tag => 
        tag.toLowerCase().includes(query.toLowerCase())
      );
      return matchesName || matchesFramework || matchesTags;
    });
    setFilteredProjects(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects(true);
  }, [api]);

  const handleProjectPress = (project: VercelProject) => {
    navigation.navigate('ProjectDetail', { project });
  };

  const handleRedeploy = async (project: VercelProject) => {
    if (!api) return;

    Alert.alert(
      'Redeploy Project',
      `Are you sure you want to redeploy ${project.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeploy',
          style: 'default',
          onPress: async () => {
            try {
              // Get latest deployment
              const latestDeployment = project.latestDeployments?.[0];
              if (!latestDeployment) {
                Alert.alert('Error', 'No deployment found to redeploy');
                return;
              }

              // Trigger redeploy
              await api.redeployDeployment(latestDeployment.uid);
              Alert.alert('Success', 'Redeployment triggered successfully');
              
              // Refresh projects
              fetchProjects(true);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to redeploy');
            }
          },
        },
      ]
    );
  };

  const handleAddDeployment = () => {
    setShowDeployModal(true);
  };

  const triggerDeployment = async (projectId: string, projectName: string) => {
    if (!api) return;

    setDeployingProject(projectId);
    try {
      // Get the latest deployment to use as a base
      const project = projects.find(p => p.id === projectId);
      if (!project || !project.latestDeployments || project.latestDeployments.length === 0) {
        Alert.alert('Error', 'No previous deployments found for this project.');
        setDeployingProject(null);
        return;
      }

      const latestDeployment = project.latestDeployments[0];
      
      // Trigger a redeploy using the latest deployment UID
      await api.redeployDeployment(latestDeployment.uid);
      
      Alert.alert(
        'Success',
        `Deployment triggered for ${projectName}!`,
        [{ text: 'OK' }]
      );
      
      setShowDeployModal(false);
      fetchProjects(true); // Refresh projects to show new deployment
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create deployment');
    } finally {
      setDeployingProject(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Projects</Text>
            <Text style={styles.count}>Loading...</Text>
          </View>
        </View>
        <GlobalSearch
          placeholder="Search projects..."
          onSearch={handleSearch}
          showFilters={false}
          showAddButton={true}
          onAddPress={handleAddDeployment}
        />
        <SkeletonList count={5} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="alert-circle-outline"
          title="Error"
          message={error}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Projects</Text>
          <Text style={styles.count}>
            {searchQuery ? `${filteredProjects.length} of ${projects.length}` : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`}
          </Text>
        </View>
      </View>

      <GlobalSearch
        placeholder="Search projects..."
        onSearch={handleSearch}
        showFilters={false}
        showAddButton={true}
        onAddPress={handleAddDeployment}
      />
      
      {filteredProjects.length === 0 && projects.length > 0 ? (
        <EmptyState
          icon="search-outline"
          title="No Results"
          message="No projects match your search"
        />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon="cube-outline"
          title="No Projects"
          message="You don't have any projects yet. Create one on Vercel to get started."
        />
      ) : (
        <FlatList
          data={filteredProjects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProjectCard 
              project={item} 
              onPress={() => handleProjectPress(item)}
              tags={PROJECT_TAGS[item.id] || []}
              onRedeploy={() => handleRedeploy(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.foreground}
            />
          }
        />
      )}

      {/* Create Deployment Modal */}
      <Modal
        visible={showDeployModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeployModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Deployment</Text>
              <TouchableOpacity onPress={() => setShowDeployModal(false)}>
                <Ionicons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Select a project to deploy
            </Text>

            <ScrollView style={styles.projectList}>
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectOption}
                  onPress={() => triggerDeployment(project.id, project.name)}
                  disabled={deployingProject !== null}
                >
                  <View style={styles.projectOptionLeft}>
                    <Ionicons name="cube-outline" size={20} color={colors.foreground} />
                    <Text style={styles.projectOptionText}>{project.name}</Text>
                  </View>
                  {deployingProject === project.id ? (
                    <ActivityIndicator size="small" color={colors.foreground} />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={colors.gray[600]} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.sizes.xxxxl,
    fontWeight: typography.weights.bold,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.xs,
  },
  count: {
    fontSize: typography.sizes.base,
    color: colors.foregroundMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  listContent: {
    padding: spacing.base,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundElevated,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.tight,
  },
  modalSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.gray[500],
    marginBottom: spacing.lg,
    letterSpacing: typography.letterSpacing.normal,
  },
  projectList: {
    maxHeight: 400,
  },
  projectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  projectOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  projectOptionText: {
    fontSize: typography.sizes.md + 1,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.normal,
    flex: 1,
  },
});
