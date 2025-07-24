import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Globe, AlertCircle } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/EmptyState';
import { VercelDomain } from '../types';

export const DomainsScreen = ({ navigation }: any) => {
  const { api } = useAuth();
  const [domains, setDomains] = useState<VercelDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDomains = async (isRefreshing = false) => {
    if (!api) return;

    try {
      if (!isRefreshing) setLoading(true);
      setError(null);
      
      const response = await api.getDomains(100);
      setDomains(response.domains);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch domains');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, [api]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDomains(true);
  }, [api]);

  const renderDomain = ({ item }: { item: VercelDomain }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => Linking.openURL(`https://${item.name}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.domainName}>{item.name}</Text>
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.cardFooter}>
        <View style={{ flexDirection: 'row', gap: 8, flex: 1 }}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.serviceType}</Text>
          </View>
          {item.cdnEnabled && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>CDN Enabled</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.dnsButton}
          onPress={() => navigation.navigate('DNSRecords', { domain: item.name })}
        >
          <Text style={styles.dnsButtonText}>DNS →</Text>
        </TouchableOpacity>
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

  if (error) {
    return (
      <View style={styles.centered}>
        <EmptyState
          icon={AlertCircle}
          title="Error Loading Domains"
          message={error}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Domains</Text>
        <Text style={styles.count}>{domains.length} total</Text>
      </View>
      
      {domains.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No Domains"
          message="You don't have any domains configured yet."
        />
      ) : (
        <FlatList
          data={domains}
          keyExtractor={(item) => item.id}
          renderItem={renderDomain}
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
    marginBottom: 12,
  },
  domainName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: '#0070f3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  badgeText: {
    fontSize: 11,
    color: '#888',
  },
  dnsButton: {
    backgroundColor: '#0070f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  dnsButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});

