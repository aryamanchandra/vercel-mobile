import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { colors, borderRadius, spacing } from '../theme/colors';

export const LoginScreen = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!token.trim()) {
      return;
    }

    setLoading(true);
    try {
      await login(token.trim());
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>▲</Text>
          </View>
          <Text style={styles.title}>Vercel Mobile</Text>
          <Text style={styles.subtitle}>
            Develop. Preview. Ship. — From anywhere.
          </Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardDescription}>
              Enter your Vercel access token to continue
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Access Token</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="key-outline"
                  size={16}
                  color={colors.gray[600]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your token..."
                  placeholderTextColor={colors.gray[600]}
                  value={token}
                  onChangeText={setToken}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>
            </View>

            <Button
              title={loading ? 'Signing In...' : 'Sign In'}
              onPress={handleLogin}
              loading={loading}
              disabled={!token.trim()}
              fullWidth
            />

            <TouchableOpacity
              style={styles.helpLink}
              onPress={() => Linking.openURL('https://vercel.com/account/tokens')}
            >
              <Ionicons name="help-circle-outline" size={14} color={colors.accent.blue} />
              <Text style={styles.helpText}>How to get an access token?</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Ionicons name="cube-outline" size={16} color={colors.accent.blue} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Manage Projects</Text>
              <Text style={styles.featureDescription}>
                View and manage all your Vercel projects
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Ionicons name="rocket-outline" size={16} color={colors.accent.purple} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Monitor Deployments</Text>
              <Text style={styles.featureDescription}>
                Track deployments in real-time
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Ionicons name="settings-outline" size={16} color={colors.accent.cyan} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Configure Settings</Text>
              <Text style={styles.featureDescription}>
                Manage environment variables and domains
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <TouchableOpacity
          style={styles.footer}
          onPress={() => Linking.openURL('https://vercel.com')}
        >
          <Text style={styles.footerText}>
            Powered by Vercel
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    backgroundColor: colors.foreground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 32,
    color: colors.background,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  cardHeader: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.gray[500],
    letterSpacing: -0.2,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[300],
    letterSpacing: -0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
  },
  inputIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  helpText: {
    fontSize: 12,
    color: colors.accent.blue,
    letterSpacing: -0.2,
  },
  features: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  feature: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  featureDescription: {
    fontSize: 12,
    color: colors.gray[500],
    letterSpacing: -0.2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  footerText: {
    fontSize: 12,
    color: colors.gray[600],
    letterSpacing: -0.2,
  },
});
