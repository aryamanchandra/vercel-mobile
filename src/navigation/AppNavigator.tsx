import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { ProjectsScreen } from '../screens/ProjectsScreen';
import { DeploymentsScreen } from '../screens/DeploymentsScreen';
import { DomainsScreen } from '../screens/DomainsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProjectDetailScreen } from '../screens/ProjectDetailScreen';
import { DeploymentDetailScreen } from '../screens/DeploymentDetailScreen';
import { EnvVariablesScreen } from '../screens/EnvVariablesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
          borderBottomWidth: 1,
          borderBottomColor: '#222',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
        },
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopWidth: 1,
          borderTopColor: '#222',
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectsScreen}
        options={{
          title: 'Projects',
          tabBarLabel: 'Projects',
          tabBarIcon: () => '📦',
        }}
      />
      <Tab.Screen
        name="DeploymentsTab"
        component={DeploymentsScreen}
        options={{
          title: 'Deployments',
          tabBarLabel: 'Deployments',
          tabBarIcon: () => '🚀',
        }}
      />
      <Tab.Screen
        name="DomainsTab"
        component={DomainsScreen}
        options={{
          title: 'Domains',
          tabBarLabel: 'Domains',
          tabBarIcon: () => '🌐',
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: () => '⚙️',
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: '#000',
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

