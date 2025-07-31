import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { VercelDeployment } from '../types';

export const DeploymentDetailScreen = ({ route, navigation }: any) => {
  const { deployment }: { deployment: VercelDeployment } = route.params;
  const { api } = useAuth();
  const [canceling, setCanceling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [redeploying, setRedeploying] = useState(false);

  const handleCancel = () => {
    if (deployment.state !== 'BUILDING' && deployment.state !== 'QUEUED') {
      Alert.alert('Error', 'Only building or queued deployments can be canceled');
      return;
    }

    Alert.alert(
      'Cancel Deployment',
      'Are you sure you want to cancel this deployment?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: confirmCancel },
      ]
    );
  };

  const confirmCancel = async () => {
    if (!api) return;

    try {
      setCanceling(true);
      await api.cancelDeployment(deployment.uid);
      Alert.alert('Success', 'Deployment canceled');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to cancel deployment');
    } finally {
      setCanceling(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Deployment',
      'Are you sure you want to delete this deployment?',
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
      await api.deleteDeployment(deployment.uid);
      Alert.alert('Success', 'Deployment deleted');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete deployment');
    } finally {
      setDeleting(false);
    }
  };

  const handlePromote = () => {
    if (deployment.state !== 'READY') {
      Alert.alert('Error', 'Only ready deployments can be promoted to production');
      return;
    }

    Alert.alert(
      'Promote to Production',
      `Promote ${deployment.url} to your production domain?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Promote', onPress: confirmPromote },
      ]
    );
  };

  const confirmPromote = async () => {
    if (!api) return;

    try {
      setPromoting(true);
      // Assuming the main production domain is the deployment name
      const productionDomain = `${deployment.name}.vercel.app`;
      await api.promoteToProduction(deployment.uid, productionDomain);
      Alert.alert('Success', 'Deployment promoted to production!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to promote deployment');
    } finally {
      setPromoting(false);
    }
  };

  const handleRedeploy = () => {
    Alert.alert(
      'Redeploy',
      'Create a new deployment with the same source?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Redeploy', onPress: confirmRedeploy },
      ]
    );
  };

  const confirmRedeploy = async () => {
    if (!api) return;

    try {
      setRedeploying(true);
      await api.redeployDeployment(deployment.uid, deployment.name, deployment.target || undefined);
      Alert.alert('Success', 'Deployment queued! Check your deployments list.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to redeploy');
    } finally {
      setRedeploying(false);
    }
  };

  const getStateColor = (state: string) => {
    const stateColors: { [key: string]: string } = {
      READY: colors.success,
      BUILDING: colors.warning,
      ERROR: colors.error,
      QUEUED: colors.gray[600],
      INITIALIZING: colors.gray[600],
      CANCELED: colors.gray[700],
    };
    return stateColors[state] || colors.gray[600];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: getStateColor(deployment.state) }]} />
            <Text style={styles.status}>{deployment.state}</Text>
          </View>
          <Text style={styles.url}>{deployment.url}</Text>
        </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Deployment ID</Text>
          <Text style={styles.detailValue} numberOfLines={1}>{deployment.uid}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created</Text>
          <Text style={styles.detailValue}>{formatDate(deployment.created)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Creator</Text>
          <Text style={styles.detailValue}>
            {deployment.creator.username || deployment.creator.email || 'Unknown'}
          </Text>
        </View>

        {deployment.target && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Target</Text>
            <Text style={styles.detailValue}>{deployment.target}</Text>
          </View>
        )}
      </View>

      {deployment.meta && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Git Information</Text>
          
          {deployment.meta.githubCommitMessage && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Commit Message</Text>
              <Text style={styles.detailValue}>{deployment.meta.githubCommitMessage}</Text>
            </View>
          )}

          {deployment.meta.githubCommitRef && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Branch</Text>
              <Text style={styles.detailValue}>{deployment.meta.githubCommitRef}</Text>
            </View>
          )}

          {deployment.meta.githubCommitSha && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Commit SHA</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {deployment.meta.githubCommitSha.substring(0, 7)}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title="Open Deployment"
          onPress={() => Linking.openURL(`https://${deployment.url}`)}
          variant="primary"
          style={styles.actionButton}
        />

        <Button
          title="View Runtime Logs"
          onPress={() => navigation.navigate('RuntimeLogs', {
            projectId: deployment.name,
            deploymentId: deployment.uid,
            deploymentUrl: deployment.url,
          })}
          variant="secondary"
          style={styles.actionButton}
        />

        {deployment.state === 'READY' && deployment.target !== 'production' && (
          <Button
            title="Promote to Production"
            onPress={handlePromote}
            variant="primary"
            loading={promoting}
            style={styles.actionButton}
          />
        )}

        <Button
          title="Redeploy"
          onPress={handleRedeploy}
          variant="secondary"
          loading={redeploying}
          style={styles.actionButton}
        />

        {(deployment.state === 'BUILDING' || deployment.state === 'QUEUED') && (
          <Button
            title="Cancel Deployment"
            onPress={handleCancel}
            variant="secondary"
            loading={canceling}
            style={styles.actionButton}
          />
        )}

        <Button
          title="Delete Deployment"
          onPress={handleDelete}
          variant="danger"
          loading={deleting}
          style={styles.actionButton}
        />

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => Linking.openURL(`https://vercel.com/${deployment.name}/${deployment.uid}`)}
        >
          <Text style={styles.linkText}>View on Vercel</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.accent.blue} />
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  status: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.tight,
  },
  url: {
    fontSize: typography.sizes.base,
    color: colors.foregroundMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.foreground,
    marginBottom: spacing.md,
    letterSpacing: typography.letterSpacing.tight,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.sizes.base,
    color: colors.foregroundMuted,
    width: 120,
    letterSpacing: typography.letterSpacing.normal,
  },
  detailValue: {
    fontSize: typography.sizes.base,
    color: colors.foreground,
    flex: 1,
    textAlign: 'right',
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  actionButton: {
    marginBottom: spacing.md,
  },
  linkButton: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  linkText: {
    fontSize: typography.sizes.base,
    color: colors.accent.blue,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
});

