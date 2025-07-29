import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/ProjectCard';
import { EmptyState } from '../components/EmptyState';
import { GlobalSearch } from '../components/GlobalSearch';
import { SkeletonList } from '../components/SkeletonLoader';
import { VercelProject } from '../types';

// Mock tags data - in real app, this would come from API or storage
const PROJECT_TAGS: { [key: string]: string[] } = {
  // Add your project IDs and tags here
  // 'project-id-1': ['personal', 'production'],
  // 'project-id-2': ['client', 'staging'],
};

export const ProjectsScreen = ({ navigation }: any) => {
  const { api } = useAuth();
  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<VercelProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = async (isRefreshing = false) => {
    if (!api) return;

    try {
      if (!isRefreshing) setLoading(true);
      setError(null);
      
      const response = await api.getProjects(100);
      setProjects(response.projects);
      setFilteredProjects(response.projects);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
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
    Alert.alert(
      'Create New Deployment',
      'This would open a screen to create a new deployment. Feature coming soon!',
      [{ text: 'OK' }]
    );
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
});
