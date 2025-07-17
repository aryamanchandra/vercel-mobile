import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DeploymentCard } from '../components/DeploymentCard';
import { EmptyState } from '../components/EmptyState';
import { VercelDeployment } from '../types';

export const DeploymentsScreen = ({ navigation }: any) => {
  const { api } = useAuth();
  const [deployments, setDeployments] = useState<VercelDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeployments = async (isRefreshing = false) => {
    if (!api) return;

    try {
      if (!isRefreshing) setLoading(true);
      setError(null);
      
      const response = await api.getDeployments(50);
      setDeployments(response.deployments);
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
          icon="⚠️"
          title="Error Loading Deployments"
          message={error}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deployments</Text>
        <Text style={styles.count}>{deployments.length} recent</Text>
      </View>
      
      {deployments.length === 0 ? (
        <EmptyState
          icon="🚀"
          title="No Deployments"
          message="Your deployments will appear here once you start deploying."
        />
      ) : (
        <FlatList
          data={deployments}
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
});

