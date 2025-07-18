import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { DeploymentCard } from '../components/DeploymentCard';
import { VercelProject, VercelDeployment } from '../types';

export const ProjectDetailScreen = ({ route, navigation }: any) => {
  const { project }: { project: VercelProject } = route.params;
  const { api } = useAuth();
  const [deployments, setDeployments] = useState<VercelDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDeployments();
  }, []);

  const fetchDeployments = async () => {
    if (!api) return;

    try {
      setLoading(true);
      const response = await api.getDeployments(10, undefined, project.id);
      setDeployments(response.deployments);
    } catch (err) {
      console.error('Error fetching deployments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!api) return;

    try {
      setDeleting(true);
      await api.deleteProject(project.id);
      Alert.alert('Success', 'Project deleted successfully');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const openUrl = (url: string) => {
    Linking.openURL(`https://${url}`);
  };

  const productionUrl = project.targets?.production?.url;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{project.name}</Text>
        {productionUrl && (
          <TouchableOpacity onPress={() => openUrl(productionUrl)}>
            <Text style={styles.url}>{productionUrl} →</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Framework</Text>
          <Text style={styles.detailValue}>{project.framework || 'Not specified'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Build Command</Text>
          <Text style={styles.detailValue}>{project.buildCommand || 'Default'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Output Directory</Text>
          <Text style={styles.detailValue}>{project.outputDirectory || 'Default'}</Text>
        </View>
        {project.link && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Git Repository</Text>
            <Text style={styles.detailValue}>{project.link.repo}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Deployments</Text>
        {loading ? (
          <ActivityIndicator color="#fff" style={styles.loader} />
        ) : deployments.length > 0 ? (
          deployments.map((deployment) => (
            <DeploymentCard
              key={deployment.uid}
              deployment={deployment}
              onPress={() => navigation.navigate('DeploymentDetail', { deployment })}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No deployments yet</Text>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          title="Environment Variables"
          onPress={() => navigation.navigate('EnvVariables', { 
            projectId: project.id,
            projectName: project.name 
          })}
          variant="secondary"
          style={styles.actionButton}
        />
        <Button
          title="View on Vercel"
          onPress={() => Linking.openURL(`https://vercel.com/${project.name}`)}
          variant="secondary"
          style={styles.actionButton}
        />
        <Button
          title="Delete Project"
          onPress={handleDelete}
          variant="danger"
          loading={deleting}
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  url: {
    fontSize: 14,
    color: '#0070f3',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  actions: {
    padding: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
});

