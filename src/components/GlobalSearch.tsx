import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../theme/colors';

interface GlobalSearchProps {
  placeholder?: string;
  onSearch: (query: string, filter: SearchFilter) => void;
  showFilters?: boolean;
  onAddPress?: () => void;
  showAddButton?: boolean;
}

export type SearchFilter = 'all' | 'projects' | 'deployments' | 'domains' | 'envvars';

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  placeholder = 'Search...',
  onSearch,
  showFilters = true,
  onAddPress,
  showAddButton = false,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const filters: { id: SearchFilter; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'search-outline' },
    { id: 'projects', label: 'Projects', icon: 'cube-outline' },
    { id: 'deployments', label: 'Deployments', icon: 'rocket-outline' },
    { id: 'domains', label: 'Domains', icon: 'globe-outline' },
    { id: 'envvars', label: 'Env Vars', icon: 'key-outline' },
  ];

  const handleSearch = (text: string) => {
    setQuery(text);
    onSearch(text, activeFilter);
  };

  const handleFilterChange = (filter: SearchFilter) => {
    setActiveFilter(filter);
    onSearch(query, filter);
    if (showFilterModal) {
      setShowFilterModal(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.gray[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.gray[600]}
            value={query}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={18} color={colors.gray[500]} />
            </TouchableOpacity>
          )}
        </View>

        {showAddButton && onAddPress && (
          <TouchableOpacity
            onPress={onAddPress}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color={colors.background} />
          </TouchableOpacity>
        )}
      </View>

      {showFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterTabs}
          contentContainerStyle={styles.filterTabsContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                activeFilter === filter.id && styles.filterTabActive,
              ]}
              onPress={() => handleFilterChange(filter.id)}
            >
              <Ionicons
                name={filter.icon as any}
                size={14}
                color={activeFilter === filter.id ? colors.background : colors.gray[500]}
              />
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === filter.id && styles.filterTabTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search In</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={styles.filterOption}
                onPress={() => handleFilterChange(filter.id)}
              >
                <View style={styles.filterOptionLeft}>
                  <Ionicons name={filter.icon as any} size={20} color={colors.foreground} />
                  <Text style={styles.filterOptionText}>{filter.label}</Text>
                </View>
                {activeFilter === filter.id && (
                  <Ionicons name="checkmark" size={20} color={colors.accent.blue} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.normal,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.foreground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabs: {
    marginTop: spacing.sm,
  },
  filterTabsContent: {
    gap: spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  filterTabActive: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  filterTabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.gray[500],
    letterSpacing: typography.letterSpacing.normal,
  },
  filterTabTextActive: {
    color: colors.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundElevated,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.tight,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  filterOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  filterOptionText: {
    fontSize: typography.sizes.md + 1,
    color: colors.foreground,
    letterSpacing: typography.letterSpacing.normal,
  },
});
