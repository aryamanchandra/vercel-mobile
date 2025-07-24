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
} from 'react-native';
import { Rocket, Search, AlertCircle } from 'lucide-react-native';
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
          icon={AlertCircle}
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
          icon={Search}
          title="No Results"
          message="No deployments match your filters. Try adjusting them."
        />
      ) : filteredDeployments.length === 0 ? (
        <EmptyState
          icon={Rocket}
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
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  count: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  filterButton: {
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    marginTop: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterOptionActive: {
    backgroundColor: '#0070f3',
    borderColor: '#0070f3',
  },
  filterOptionText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
  },
});

