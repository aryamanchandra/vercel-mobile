import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@vercel_cache_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class CacheManager {
  /**
   * Store data in cache with timestamp
   */
  static async set<T>(key: string, data: T): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error(`Failed to cache data for key ${key}:`, error);
    }
  }

  /**
   * Get data from cache if not expired
   */
  static async get<T>(key: string, maxAge: number = CACHE_DURATION): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const age = Date.now() - entry.timestamp;

      // Check if cache is expired
      if (age > maxAge) {
        await this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error(`Failed to retrieve cached data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove specific cache entry
   */
  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error(`Failed to remove cache for key ${key}:`, error);
    }
  }

  /**
   * Clear all cache entries
   */
  static async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }

  /**
   * Check if cache exists and is valid
   */
  static async isValid(key: string, maxAge: number = CACHE_DURATION): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return false;

      const entry: CacheEntry<any> = JSON.parse(cached);
      const age = Date.now() - entry.timestamp;

      return age <= maxAge;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cache age in milliseconds
   */
  static async getAge(key: string): Promise<number | null> {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const entry: CacheEntry<any> = JSON.parse(cached);
      return Date.now() - entry.timestamp;
    } catch (error) {
      return null;
    }
  }
}

// Common cache keys
export const CacheKeys = {
  PROJECTS: 'projects',
  DEPLOYMENTS: 'deployments',
  DOMAINS: 'domains',
  USER: 'user',
  TEAMS: 'teams',
};

// Cache durations (in milliseconds)
export const CacheDurations = {
  SHORT: 2 * 60 * 1000,      // 2 minutes
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
};

