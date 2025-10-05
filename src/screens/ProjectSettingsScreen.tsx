import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export const ProjectSettingsScreen = ({ route, navigation }: any) => {
  const { api } = useAuth();
  const { project } = route.params as { project: any };

  const handleManageEnv = () => {
    navigation.navigate('EnvVariables', { project });
  };

  const handleOpenDomains = () => {
    // Take user to Domains tab for now
    navigation.navigate('Main', { screen: 'DomainsTab' });
  };

  const handleDeleteProject = () => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project?.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!api) return;
              // If delete endpoint exists in api client, wire up here.
              Alert.alert('Not Implemented', 'Project deletion is not implemented yet.');
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.card}>
            <View style={styles.row}> 
              <Text style={styles.label}>Project Name</Text>
              <Text style={styles.value} numberOfLines={1}>{project?.name}</Text>
            </View>
            <View style={styles.row}> 
              <Text style={styles.label}>Project ID</Text>
              <Text style={styles.value} numberOfLines={1}>{project?.id || '—'}</Text>
            </View>
            <View style={styles.row}> 
              <Text style={styles.label}>Created</Text>
              <Text style={styles.value}>{new Date(project?.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleManageEnv}>
              <Text style={styles.actionText}>Manage Environment Variables</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleOpenDomains}>
              <Text style={styles.actionText}>Manage Domains & DNS</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <TouchableOpacity style={[styles.actionButton, styles.danger]} onPress={handleDeleteProject}>
            <Text style={[styles.actionText, styles.dangerText]}>Delete Project</Text>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 4,
  },
  section: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.tight,
  },
  card: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: typography.sizes.base,
    color: colors.foregroundMuted,
  },
  value: {
    fontSize: typography.sizes.base,
    color: colors.foreground,
    fontWeight: typography.weights.medium,
    maxWidth: '60%',
    textAlign: 'right',
  },
  actions: {
    gap: spacing.md,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: typography.sizes.base,
    color: colors.foreground,
    fontWeight: typography.weights.semibold,
  },
  danger: {
    backgroundColor: 'transparent',
    borderColor: colors.error,
  },
  dangerText: {
    color: colors.error,
  },
});


