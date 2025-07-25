import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/ProjectCard';
import { EmptyState } from '../components/EmptyState';
import { VercelProject } from '../types';

export const ProjectsScreen = ({ navigation }: any) => {
  const { api } = useAuth();
  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async (isRefreshing = false) => {
    if (!api) return;

    try {
      if (!isRefreshing) setLoading(true);
      setError(null);
      
      const response = await api.getProjects(100);
      setProjects(response.projects);
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects(true);
  }, [api]);

  const handleProjectPress = (project: VercelProject) => {
    navigation.navigate('ProjectDetail', { project });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
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
          <Text style={styles.count}>{projects.length} {projects.length === 1 ? 'project' : 'projects'}</Text>
        </View>
      </View>
      
      {projects.length === 0 ? (
        <EmptyState
          icon="cube-outline"
          title="No Projects"
          message="You don't have any projects yet. Create one on Vercel to get started."
        />
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProjectCard project={item} onPress={() => handleProjectPress(item)} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  count: {
    fontSize: 13,
    color: colors.gray[500],
    letterSpacing: -0.2,
  },
  listContent: {
    padding: spacing.md,
  },
});

