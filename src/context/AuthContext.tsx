import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VercelAPI } from '../api/vercel';

interface AuthContextType {
  token: string | null;
  teamId: string | null;
  api: VercelAPI | null;
  isLoading: boolean;
  setToken: (token: string) => Promise<void>;
  setTeamId: (teamId: string | null) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@vercel_token';
const TEAM_ID_KEY = '@vercel_team_id';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [teamId, setTeamIdState] = useState<string | null>(null);
  const [api, setApi] = useState<VercelAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredCredentials();
  }, []);

  useEffect(() => {
    if (token) {
      setApi(new VercelAPI(token, teamId || undefined));
    } else {
      setApi(null);
    }
  }, [token, teamId]);

  const loadStoredCredentials = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      const storedTeamId = await AsyncStorage.getItem(TEAM_ID_KEY);
      
      if (storedToken) {
        setTokenState(storedToken);
        setTeamIdState(storedTeamId);
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setToken = async (newToken: string) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      setTokenState(newToken);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  };

  const setTeamId = async (newTeamId: string | null) => {
    try {
      if (newTeamId) {
        await AsyncStorage.setItem(TEAM_ID_KEY, newTeamId);
      } else {
        await AsyncStorage.removeItem(TEAM_ID_KEY);
      }
      setTeamIdState(newTeamId);
    } catch (error) {
      console.error('Error saving team ID:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, TEAM_ID_KEY]);
      setTokenState(null);
      setTeamIdState(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        teamId,
        api,
        isLoading,
        setToken,
        setTeamId,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

