import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius } from '../theme/colors';
import type { VercelDomain } from '../types';

interface DomainCardProps {
  domain: VercelDomain;
  onPress: () => void;
  onManageDNS: () => void;
}

export const DomainCard: React.FC<DomainCardProps> = ({ domain, onPress, onManageDNS }) => {
  const handleOpenDomain = (e: any) => {
    e.stopPropagation();
    Linking.openURL(`https://${domain.name}`);
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.nameSection}>
          <Ionicons name="globe-outline" size={16} color={colors.foreground} />
          <Text style={styles.name} numberOfLines={1}>{domain.name}</Text>
        </View>
        {domain.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={colors.success} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      {/* Info Row */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Type</Text>
          <Text style={styles.infoValue}>{domain.serviceType || 'External'}</Text>
        </View>
        {domain.cdnEnabled && (
          <View style={styles.cdnBadge}>
            <Ionicons name="flash" size={10} color={colors.accent.cyan} />
            <Text style={styles.cdnText}>CDN</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleOpenDomain}>
          <Ionicons name="open-outline" size={14} color={colors.gray[400]} />
          <Text style={styles.actionText}>Open</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={(e) => {
            e.stopPropagation();
            onManageDNS();
          }}
        >
          <Ionicons name="settings-outline" size={14} color={colors.gray[400]} />
          <Text style={styles.actionText}>DNS</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    letterSpacing: -0.2,
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 112, 243, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.success,
    letterSpacing: -0.1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoItem: {
    gap: 2,
  },
  infoLabel: {
    fontSize: 10,
    color: colors.gray[600],
    letterSpacing: -0.1,
  },
  infoValue: {
    fontSize: 11,
    color: colors.gray[400],
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  cdnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(80, 227, 194, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  cdnText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.accent.cyan,
    letterSpacing: 0.3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray[900],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    color: colors.gray[400],
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.gray[900],
  },
});

