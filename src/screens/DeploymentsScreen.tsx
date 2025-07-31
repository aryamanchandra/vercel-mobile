import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { DeploymentCard } from '../components/DeploymentCard';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { VercelDeployment, VercelProject } from '../types';

export const DeploymentsScreen = ({ navigation }: any) => {
  const { api } = useAuth();
  const [deployments, setDeployments] = useState<VercelDeployment[]>([]);
  const [filteredDeployments, setFilteredDeployments] = useState<VercelDeployment[]>([]);
  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const fetchDeployments = async (isRefreshing = false) => {
    if (!api) return;

    try {
      if (!isRefreshing) setLoading(true);
      setError(null);
      
      const [deploymentsResponse, projectsResponse] = await Promise.all([
        api.getDeployments(50),
        api.getProjects(100),
      ]);
      
      setDeployments(deploymentsResponse.deployments);
      setProjects(projectsResponse.projects);
      setFilteredDeployments(deploymentsResponse.deployments);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch deployments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, [api]);

  useEffect(() => {
    applyFilters();
  }, [selectedProject, selectedState, selectedTarget, deployments]);

  const applyFilters = () => {
    let filtered = [...deployments];

    if (selectedProject) {
      filtered = filtered.filter(d => d.name === selectedProject);
    }

    if (selectedState) {
      filtered = filtered.filter(d => d.state === selectedState);
    }

    if (selectedTarget) {
      filtered = filtered.filter(d => d.target === selectedTarget);
    }

    setFilteredDeployments(filtered);
  };

  const clearFilters = () => {
    setSelectedProject(null);
    setSelectedState(null);
    setSelectedTarget(null);
    setFilterModalVisible(false);
  };

  const activeFiltersCount = [selectedProject, selectedState, selectedTarget].filter(Boolean).length;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDeployments(true);
  }, [api]);

  const handleDeploymentPress = (deployment: VercelDeployment) => {
    navigation.navigate('DeploymentDetail', { deployment });
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
          title="Error Loading Deployments"
          message={error}
        />
      </View>
    );
  }

  const states = ['READY', 'BUILDING', 'ERROR', 'QUEUED', 'INITIALIZING', 'CANCELED'];
  const targets = ['production', 'preview', 'development'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Deployments</Text>
          <Text style={styles.count}>{filteredDeployments.length} of {deployments.length}</Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterButtonText}>
            🔍 Filter{activeFiltersCount > 0 && ` (${activeFiltersCount})`}
          </Text>
        </TouchableOpacity>
      </View>
      
      {filteredDeployments.length === 0 && deployments.length > 0 ? (
        <EmptyState
          icon="search-outline"
          title="No Results"
          message="No deployments match your filters. Try adjusting them."
        />
      ) : filteredDeployments.length === 0 ? (
        <EmptyState
          icon="rocket-outline"
          title="No Deployments"
          message="Your deployments will appear here once you start deploying."
        />
      ) : (
        <FlatList
          data={filteredDeployments}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <DeploymentCard deployment={item} onPress={() => handleDeploymentPress(item)} />
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

      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Filter Deployments</Text>

              <Text style={styles.filterLabel}>Project</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[styles.filterOption, !selectedProject && styles.filterOptionActive]}
                  onPress={() => setSelectedProject(null)}
                >
                  <Text style={[styles.filterOptionText, !selectedProject && styles.filterOptionTextActive]}>
                    All Projects
                  </Text>
                </TouchableOpacity>
                {projects.slice(0, 10).map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={[styles.filterOption, selectedProject === project.name && styles.filterOptionActive]}
                    onPress={() => setSelectedProject(project.name)}
                  >
                    <Text style={[styles.filterOptionText, selectedProject === project.name && styles.filterOptionTextActive]}>
                      {project.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[styles.filterOption, !selectedState && styles.filterOptionActive]}
                  onPress={() => setSelectedState(null)}
                >
                  <Text style={[styles.filterOptionText, !selectedState && styles.filterOptionTextActive]}>
                    All Statuses
                  </Text>
                </TouchableOpacity>
                {states.map((state) => (
                  <TouchableOpacity
                    key={state}
                    style={[styles.filterOption, selectedState === state && styles.filterOptionActive]}
                    onPress={() => setSelectedState(state)}
                  >
                    <Text style={[styles.filterOptionText, selectedState === state && styles.filterOptionTextActive]}>
                      {state}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Target Environment</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[styles.filterOption, !selectedTarget && styles.filterOptionActive]}
                  onPress={() => setSelectedTarget(null)}
                >
                  <Text style={[styles.filterOptionText, !selectedTarget && styles.filterOptionTextActive]}>
                    All Environments
                  </Text>
                </TouchableOpacity>
                {targets.map((target) => (
                  <TouchableOpacity
                    key={target}
                    style={[styles.filterOption, selectedTarget === target && styles.filterOptionActive]}
                    onPress={() => setSelectedTarget(target)}
                  >
                    <Text style={[styles.filterOptionText, selectedTarget === target && styles.filterOptionTextActive]}>
                      {target}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="Clear All"
                  onPress={clearFilters}
                  variant="secondary"
                  style={styles.modalButton}
                />
                <Button
                  title="Apply"
                  onPress={() => setFilterModalVisible(false)}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  title: {
    fontSize: typography.sizes.xxxxl,
    fontWeight: typography.weights.bold,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.tight,
  },
  count: {
    fontSize: typography.sizes.base,
    color: colors.foregroundMuted,
    letterSpacing: typography.letterSpacing.normal,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  filterButton: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.normal,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundElevated,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.foreground,
    marginBottom: spacing.xl,
    letterSpacing: typography.letterSpacing.tight,
  },
  filterLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.foreground,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    letterSpacing: typography.letterSpacing.tight,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterOption: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterOptionActive: {
    backgroundColor: colors.accent.blue,
    borderColor: colors.accent.blue,
  },
  filterOptionText: {
    fontSize: typography.sizes.sm,
    color: colors.foregroundMuted,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.normal,
  },
  filterOptionTextActive: {
    color: colors.foreground,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  modalButton: {
    flex: 1,
  },
});

