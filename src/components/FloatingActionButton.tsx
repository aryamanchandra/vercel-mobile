import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../theme/colors';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface FloatingActionButtonProps {
  actions: QuickAction[];
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ actions }) => {
  const [showActions, setShowActions] = useState(false);
  const [rotation] = useState(new Animated.Value(0));

  const toggleActions = () => {
    const toValue = showActions ? 0 : 1;
    
    Animated.spring(rotation, {
      toValue,
      useNativeDriver: true,
      friction: 8,
    }).start();
    
    setShowActions(!showActions);
  };

  const handleAction = (action: QuickAction) => {
    setShowActions(false);
    Animated.spring(rotation, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
    action.onPress();
  };

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      {/* Backdrop */}
      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setShowActions(false)}
        >
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionButton, { backgroundColor: action.color }]}
                onPress={() => handleAction(action)}
                activeOpacity={0.8}
              >
                <Ionicons name={action.icon as any} size={20} color={colors.foreground} />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Main FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={toggleActions}
        activeOpacity={0.9}
      >
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="add" size={28} color={colors.background} />
        </Animated.View>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 80,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.foreground,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    paddingBottom: 150,
  },
  actionsContainer: {
    paddingHorizontal: spacing.md,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
    letterSpacing: -0.2,
  },
});

