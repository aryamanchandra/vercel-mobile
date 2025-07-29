import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProjectsScreen } from '../screens/ProjectsScreen';
import { DeploymentsScreen } from '../screens/DeploymentsScreen';
import { DomainsScreen } from '../screens/DomainsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProjectDetailScreen } from '../screens/ProjectDetailScreen';
import { DeploymentDetailScreen } from '../screens/DeploymentDetailScreen';
import { EnvVariablesScreen } from '../screens/EnvVariablesScreen';
import { DNSRecordsScreen } from '../screens/DNSRecordsScreen';
import { RuntimeLogsScreen } from '../screens/RuntimeLogsScreen';
import { LoadingScreen } from '../components/LoadingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.default,
        },
        headerTintColor: colors.foreground,
        headerTitleStyle: {
          fontWeight: typography.weights.bold,
          fontSize: typography.sizes.lg + 1,
          letterSpacing: typography.letterSpacing.tight,
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border.default,
          height: 60,
          paddingBottom: spacing.sm,
          paddingTop: spacing.sm,
        },
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.gray[600],
        tabBarLabelStyle: {
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.medium,
          letterSpacing: typography.letterSpacing.normal,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectsScreen}
        options={{
          title: 'Projects',
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="DeploymentsTab"
        component={DeploymentsScreen}
        options={{
          title: 'Deployments',
          tabBarLabel: 'Deployments',
          tabBarIcon: ({ color, size }) => <Ionicons name="rocket-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="DomainsTab"
        component={DomainsScreen}
        options={{
          title: 'Domains',
          tabBarLabel: 'Domains',
          tabBarIcon: ({ color, size }) => <Ionicons name="globe-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Initializing..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.default,
          },
          headerTintColor: colors.foreground,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 17,
            letterSpacing: -0.3,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProjectDetail"
              component={ProjectDetailScreen}
              options={{ title: 'Project Details' }}
            />
            <Stack.Screen
              name="DeploymentDetail"
              component={DeploymentDetailScreen}
              options={{ title: 'Deployment Details' }}
            />
            <Stack.Screen
              name="EnvVariables"
              component={EnvVariablesScreen}
              options={{ title: 'Environment Variables' }}
            />
            <Stack.Screen
              name="DNSRecords"
              component={DNSRecordsScreen}
              options={{ title: 'DNS Records' }}
            />
            <Stack.Screen
              name="RuntimeLogs"
              component={RuntimeLogsScreen}
              options={{ title: 'Runtime Logs' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

