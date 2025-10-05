import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { CacheManager, CacheKeys, CacheDurations } from '../utils/cache';

export const SettingsScreen = () => {
  const { logout, api, teamId, setTeamId } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (!api) return;

    try {
      setLoading(true);
      
      // Try to get cached data first
      const [cachedUser, cachedTeams] = await Promise.all([
        CacheManager.get<any>(CacheKeys.USER, CacheDurations.LONG),
        CacheManager.get<any[]>(CacheKeys.TEAMS, CacheDurations.LONG),
      ]);
      
      if (cachedUser && cachedTeams) {
        setUser(cachedUser);
        setTeams(cachedTeams);
        setLoading(false);
      }
      
      const [userData, teamsData] = await Promise.all([
        api.getCurrentUser(),
        api.getTeams(),
      ]);
      
      setUser(userData.user);
      setTeams(teamsData.teams || []);
      
      // Cache the fresh data
      await Promise.all([
        CacheManager.set(CacheKeys.USER, userData.user),
        CacheManager.set(CacheKeys.TEAMS, teamsData.teams || []),
      ]);
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleTeamSwitch = (newTeamId: string | null) => {
    Alert.alert(
      'Switch Context',
      newTeamId 
        ? `Switch to team context?` 
        : 'Switch to personal account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: async () => {
            await setTeamId(newTeamId);
            Alert.alert('Success', 'Context switched. Pull to refresh on other tabs.');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name?.charAt(0) || user.username?.charAt(0) || user.email?.charAt(0) || '?'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name || user.username || 'User'}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Context</Text>
        <Text style={styles.sectionDescription}>
          Switch between your personal account and teams
        </Text>
        
        <TouchableOpacity
          style={[styles.contextItem, !teamId && styles.contextItemActive]}
          onPress={() => handleTeamSwitch(null)}
        >
          <View>
            <Text style={styles.contextName}>Personal Account</Text>
            <Text style={styles.contextEmail}>{user?.email}</Text>
          </View>
          {!teamId && <Text style={styles.activeIndicator}>✓</Text>}
        </TouchableOpacity>

        {teams.map((team) => (
          <TouchableOpacity
            key={team.id}
            style={[styles.contextItem, teamId === team.id && styles.contextItemActive]}
            onPress={() => handleTeamSwitch(team.id)}
          >
            <View>
              <Text style={styles.contextName}>{team.name}</Text>
              <Text style={styles.contextEmail}>{team.slug}</Text>
            </View>
            {teamId === team.id && <Text style={styles.activeIndicator}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>API Version</Text>
          <Text style={styles.infoValue}>Vercel REST API</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
        />
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
    paddingBottom: spacing.xl * 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
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
    marginBottom: spacing.sm,
    letterSpacing: typography.letterSpacing.tight,
  },
  sectionDescription: {
    fontSize: typography.sizes.base,
    color: colors.foregroundMuted,
    marginBottom: spacing.lg,
    letterSpacing: typography.letterSpacing.normal,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.foreground,
    textTransform: 'uppercase',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.foreground,
    marginBottom: spacing.xs,
    letterSpacing: typography.letterSpacing.tight,
  },
  userEmail: {
    fontSize: typography.sizes.base,
    color: colors.foregroundMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  contextItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.md,
    minHeight: 44,
  },
  contextItemActive: {
    borderColor: colors.accent.blue,
  },
  contextName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.foreground,
    marginBottom: spacing.xs,
    letterSpacing: typography.letterSpacing.tight,
  },
  contextEmail: {
    fontSize: typography.sizes.sm,
    color: colors.foregroundMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  activeIndicator: {
    fontSize: typography.sizes.xl,
    color: colors.accent.blue,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.sizes.base,
    color: colors.foregroundMuted,
    letterSpacing: typography.letterSpacing.normal,
  },
  infoValue: {
    fontSize: typography.sizes.base,
    color: colors.foreground,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.normal,
  },
});

