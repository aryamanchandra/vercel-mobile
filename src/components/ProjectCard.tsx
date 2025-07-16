import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { VercelProject } from '../types';

interface ProjectCardProps {
  project: VercelProject;
  onPress: () => void;
}

const { width } = Dimensions.get('window');

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
  const getFrameworkIcon = (framework: string | null) => {
    const icons: { [key: string]: string } = {
      nextjs: '▲',
      react: '⚛',
      vue: 'V',
      angular: 'A',
      svelte: 'S',
    };
    return framework ? icons[framework.toLowerCase()] || '◆' : '◆';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const productionUrl = project.targets?.production?.url || project.latestDeployments?.[0]?.url;

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getFrameworkIcon(project.framework)}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {project.name}
          </Text>
          {productionUrl && (
            <Text style={styles.url} numberOfLines={1}>
              {productionUrl}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.infoRow}>
          {project.framework && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{project.framework}</Text>
            </View>
          )}
          {project.link && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🔗 Git</Text>
            </View>
          )}
        </View>
        <Text style={styles.date}>{formatDate(project.createdAt)}</Text>
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
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  icon: {
    fontSize: 20,
    color: '#fff',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  url: {
    fontSize: 12,
    color: '#888',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
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
  date: {
    fontSize: 12,
    color: '#666',
  },
});

