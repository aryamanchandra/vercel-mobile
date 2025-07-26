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
import { colors, borderRadius, spacing } from '../theme/colors';

interface GlobalSearchProps {
  placeholder?: string;
  onSearch: (query: string, filter: SearchFilter) => void;
  showFilters?: boolean;
}

export type SearchFilter = 'all' | 'projects' | 'deployments' | 'domains' | 'envvars';

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  placeholder = 'Search...',
  onSearch,
  showFilters = true,
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
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={colors.gray[500]} style={styles.searchIcon} />
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
            <Ionicons name="close-circle" size={16} color={colors.gray[500]} />
          </TouchableOpacity>
        )}
        {showFilters && (
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            style={styles.filterButton}
          >
            <Ionicons name="options-outline" size={18} color={colors.gray[400]} />
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
                color={activeFilter === filter.id ? colors.foreground : colors.gray[500]}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[950],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
  filterButton: {
    padding: 4,
  },
  filterTabs: {
    marginTop: spacing.sm,
  },
  filterTabsContent: {
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[500],
    letterSpacing: -0.2,
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
    backgroundColor: colors.gray[950],
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    letterSpacing: -0.3,
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
    gap: 12,
  },
  filterOptionText: {
    fontSize: 15,
    color: colors.foreground,
    letterSpacing: -0.2,
  },
});

