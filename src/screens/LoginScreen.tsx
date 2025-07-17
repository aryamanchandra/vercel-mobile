import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

export const LoginScreen = () => {
  const [token, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuth();

  const handleLogin = async () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Please enter your Vercel token');
      return;
    }

    setLoading(true);
    try {
      await setToken(token.trim());
    } catch (error) {
      Alert.alert('Error', 'Failed to save token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openTokenPage = () => {
    Linking.openURL('https://vercel.com/account/tokens');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>▲</Text>
            <Text style={styles.title}>Vercel Mobile</Text>
            <Text style={styles.subtitle}>
              Manage your Vercel projects and deployments on the go
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Access Token</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Vercel access token"
              placeholderTextColor="#666"
              value={token}
              onChangeText={setTokenInput}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            
            <Text style={styles.hint}>
              You can create a token from your Vercel account settings
            </Text>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            <Button
              title="Get Token from Vercel"
              onPress={openTokenPage}
              variant="secondary"
              style={styles.getTokenButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              To create an access token:
            </Text>
            <Text style={styles.footerText}>
              1. Go to Settings → Tokens in your Vercel dashboard
            </Text>
            <Text style={styles.footerText}>
              2. Click "Create Token"
            </Text>
            <Text style={styles.footerText}>
              3. Give it a name and select expiration
            </Text>
            <Text style={styles.footerText}>
              4. Copy and paste it here
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    color: '#fff',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 24,
  },
  loginButton: {
    marginBottom: 12,
  },
  getTokenButton: {
    marginTop: 4,
  },
  footer: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
});

