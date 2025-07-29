import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/ProjectCard';
import { EmptyState } from '../components/EmptyState';
import { GlobalSearch } from '../components/GlobalSearch';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { SkeletonList } from '../components/SkeletonLoader';
import { VercelProject } from '../types';

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

    const filtered = projects.filter(project =>
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      project.framework?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProjects(filtered);
  };

  const quickActions = [
    {
      id: 'new-project',
      label: 'New Project',
      icon: 'cube-outline',
      color: colors.accent.blue,
      onPress: () => {
        // Navigate to create project or open Vercel
      },
    },
    {
      id: 'trigger-deploy',
      label: 'Trigger Deploy',
      icon: 'rocket-outline',
      color: colors.accent.purple,
      onPress: () => {
        // Open deploy trigger
      },
    },
  ];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects(true);
  }, [api]);

  const handleProjectPress = (project: VercelProject) => {
    navigation.navigate('ProjectDetail', { project });
  };

  if (loading) {
    return (
      <View style={styles.container}>
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
        />
        <SkeletonList count={5} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <EmptyState
          icon="alert-circle-outline"
          title="Error Loading Projects"
          message={error}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
            <ProjectCard project={item} onPress={() => handleProjectPress(item)} />
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

      <FloatingActionButton actions={quickActions} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
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

