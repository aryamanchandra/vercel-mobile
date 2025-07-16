import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { VercelDeployment } from '../types';

interface DeploymentCardProps {
  deployment: VercelDeployment;
  onPress: () => void;
}

const { width } = Dimensions.get('window');

export const DeploymentCard: React.FC<DeploymentCardProps> = ({ deployment, onPress }) => {
  const getStateColor = (state: string) => {
    const colors: { [key: string]: string } = {
      READY: '#0070f3',
      BUILDING: '#f5a623',
      ERROR: '#ff0000',
      QUEUED: '#888',
      INITIALIZING: '#888',
      CANCELED: '#666',
    };
    return colors[state] || '#888';
  };

  const getStateIcon = (state: string) => {
    const icons: { [key: string]: string } = {
      READY: '✓',
      BUILDING: '⟳',
      ERROR: '✕',
      QUEUED: '○',
      INITIALIZING: '◐',
      CANCELED: '⊘',
    };
    return icons[state] || '○';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const commitMessage = deployment.meta?.githubCommitMessage || '';
  const branch = deployment.meta?.githubCommitRef || deployment.target || 'main';

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={[styles.statusDot, { backgroundColor: getStateColor(deployment.state) }]}>
          <Text style={styles.statusIcon}>{getStateIcon(deployment.state)}</Text>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.topRow}>
            <Text style={styles.url} numberOfLines={1}>
              {deployment.url}
            </Text>
            <Text style={styles.time}>{formatDate(deployment.created)}</Text>
          </View>
          
          {commitMessage ? (
            <Text style={styles.commit} numberOfLines={1}>
              {commitMessage}
            </Text>
          ) : null}
          
          <View style={styles.bottomRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{branch}</Text>
            </View>
            <Text style={styles.state}>{deployment.state}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
    marginBottom: 12,
    width: width - 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusIcon: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  url: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 11,
    color: '#666',
  },
  commit: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  state: {
    fontSize: 11,
    color: '#666',
    textTransform: 'capitalize',
  },
});

