import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { VercelEnvVariable } from '../types';

export const EnvVariablesScreen = ({ route }: any) => {
  const { projectId, projectName } = route.params;
  const { api } = useAuth();
  const [envVars, setEnvVars] = useState<VercelEnvVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [selectedTargets, setSelectedTargets] = useState<('production' | 'preview' | 'development')[]>(['production']);
  const [creating, setCreating] = useState(false);

  const fetchEnvVars = async (isRefreshing = false) => {
    if (!api) return;

    try {
      if (!isRefreshing) setLoading(true);
      const response = await api.getEnvVariables(projectId);
      setEnvVars(response.envs);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch environment variables');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEnvVars();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEnvVars(true);
  }, []);

  const handleDelete = (envVar: VercelEnvVariable) => {
    Alert.alert(
      'Delete Variable',
      `Are you sure you want to delete "${envVar.key}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(envVar.id),
        },
      ]
    );
  };

  const confirmDelete = async (envId: string) => {
    if (!api) return;

    try {
      await api.deleteEnvVariable(projectId, envId);
      Alert.alert('Success', 'Variable deleted');
      fetchEnvVars();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete variable');
    }
  };

  const toggleTarget = (target: 'production' | 'preview' | 'development') => {
    if (selectedTargets.includes(target)) {
      setSelectedTargets(selectedTargets.filter(t => t !== target));
    } else {
      setSelectedTargets([...selectedTargets, target]);
    }
  };

  const handleCreate = async () => {
    if (!newKey.trim() || !newValue.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (selectedTargets.length === 0) {
      Alert.alert('Error', 'Please select at least one target');
      return;
    }

    if (!api) return;

    try {
      setCreating(true);
      await api.createEnvVariable(projectId, newKey, newValue, selectedTargets, 'encrypted');
      Alert.alert('Success', 'Variable created');
      setModalVisible(false);
      setNewKey('');
      setNewValue('');
      setSelectedTargets(['production']);
      fetchEnvVars();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create variable');
    } finally {
      setCreating(false);
    }
  };

  const renderEnvVar = ({ item }: { item: VercelEnvVariable }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.key}>{item.key}</Text>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.value} numberOfLines={1}>
        {item.type === 'encrypted' || item.type === 'secret' ? '••••••••••••' : item.value}
      </Text>
      
      <View style={styles.targetsRow}>
        {item.target.map((target) => (
          <View key={target} style={styles.targetBadge}>
            <Text style={styles.targetText}>{target}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{projectName}</Text>
          <Text style={styles.subtitle}>Environment Variables</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      
      {envVars.length === 0 ? (
        <EmptyState
          icon="lock-closed-outline"
          title="No Environment Variables"
          message="Add environment variables to configure your deployments."
        />
      ) : (
        <FlatList
          data={envVars}
          keyExtractor={(item) => item.id}
          renderItem={renderEnvVar}
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
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Add Environment Variable</Text>
              
              <Text style={styles.label}>Key</Text>
              <TextInput
                style={styles.input}
                placeholder="VARIABLE_NAME"
                placeholderTextColor="#666"
                value={newKey}
                onChangeText={setNewKey}
                autoCapitalize="characters"
              />

              <Text style={styles.label}>Value</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="variable value"
                placeholderTextColor="#666"
                value={newValue}
                onChangeText={setNewValue}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Target Environments</Text>
              <View style={styles.targetsSelection}>
                {(['production', 'preview', 'development'] as const).map((target) => (
                  <TouchableOpacity
                    key={target}
                    style={[
                      styles.targetOption,
                      selectedTargets.includes(target) && styles.targetOptionActive,
                    ]}
                    onPress={() => toggleTarget(target)}
                  >
                    <Text style={[
                      styles.targetOptionText,
                      selectedTargets.includes(target) && styles.targetOptionTextActive,
                    ]}>
                      {target}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title="Create Variable"
                onPress={handleCreate}
                loading={creating}
                style={styles.createButton}
              />
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="secondary"
              />
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
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  key: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  deleteText: {
    fontSize: 14,
    color: '#ff0000',
  },
  value: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  targetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  targetBadge: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  targetText: {
    fontSize: 11,
    color: '#888',
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#fff',
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  targetsSelection: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  targetOption: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  targetOptionActive: {
    backgroundColor: '#0070f3',
    borderColor: '#0070f3',
  },
  targetOptionText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  targetOptionTextActive: {
    color: '#fff',
  },
  createButton: {
    marginBottom: 12,
  },
});

