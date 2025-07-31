import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/EmptyState';
import { DomainCard } from '../components/DomainCard';
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
    <DomainCard
      domain={item}
      onPress={() => {
        // Could navigate to domain details screen
        console.log('Domain pressed:', item.name);
      }}
      onManageDNS={() => navigation.navigate('DNSRecords', { domain: item.name })}
    />
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
          icon="alert-circle-outline"
          title="Error Loading Domains"
          message={error}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Domains</Text>
          <Text style={styles.count}>{domains.length} {domains.length === 1 ? 'domain' : 'domains'}</Text>
        </View>
      </View>
      
      {domains.length === 0 ? (
        <EmptyState
          icon="globe-outline"
          title="No Domains"
          message="Connect a domain to your Vercel projects"
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
});

