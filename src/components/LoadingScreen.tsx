import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>▲</Text>
      <ActivityIndicator size="large" color="#fff" style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  logo: {
    fontSize: 64,
    color: colors.foreground,
    marginBottom: 24,
    fontWeight: '700',
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 13,
    color: colors.gray[500],
    letterSpacing: -0.2,
  },
});

