import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, EmployeeProfile } from './api';

const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  BASE_URL: 'base_url',
  API_KEY: 'api_key',
  API_SECRET: 'api_secret',
  IS_LOGGED_IN: 'is_logged_in',
  EMPLOYEE_PROFILE: 'employee_profile',
};

export interface StoredUserData {
  userProfile: UserProfile;
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  isLoggedIn: boolean;
}

export class StorageService {
  // Store user login data
  static async storeUserData(data: {
    userProfile: UserProfile;
    baseUrl: string;
    apiKey: string;
    apiSecret: string;
  }): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.userProfile)],
        [STORAGE_KEYS.BASE_URL, data.baseUrl],
        [STORAGE_KEYS.API_KEY, data.apiKey],
        [STORAGE_KEYS.API_SECRET, data.apiSecret],
        [STORAGE_KEYS.IS_LOGGED_IN, 'true'],
      ]);
    } catch (error) {
      console.error('Error storing user data:', error);
      throw new Error('Failed to store user data');
    }
  }

  // Get stored user data
  static async getStoredUserData(): Promise<StoredUserData | null> {
    try {
      const values = await AsyncStorage.multiGet([
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.BASE_URL,
        STORAGE_KEYS.API_KEY,
        STORAGE_KEYS.API_SECRET,
        STORAGE_KEYS.IS_LOGGED_IN,
      ]);

      const [userProfile, baseUrl, apiKey, apiSecret, isLoggedIn] = values.map(([_, value]) => value);

      if (!userProfile || !baseUrl || !apiKey || !apiSecret || isLoggedIn !== 'true') {
        return null;
      }

      return {
        userProfile: JSON.parse(userProfile),
        baseUrl,
        apiKey,
        apiSecret,
        isLoggedIn: isLoggedIn === 'true',
      };
    } catch (error) {
      console.error('Error retrieving stored user data:', error);
      return null;
    }
  }

  // Check if user is logged in
  static async isLoggedIn(): Promise<boolean> {
    try {
      const isLoggedIn = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      return isLoggedIn === 'true';
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  // Clear all stored data (logout) - but keep BASE_URL
  static async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_PROFILE,
        // Don't remove BASE_URL - keep it for next login
        STORAGE_KEYS.API_KEY,
        STORAGE_KEYS.API_SECRET,
        STORAGE_KEYS.IS_LOGGED_IN,
        STORAGE_KEYS.EMPLOYEE_PROFILE,
      ]);
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw new Error('Failed to clear user data');
    }
  }

  // Store base URL only
  static async storeBaseUrl(baseUrl: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BASE_URL, baseUrl);
    } catch (error) {
      console.error('Error storing base URL:', error);
      throw new Error('Failed to store base URL');
    }
  }

  // Get stored base URL
  static async getBaseUrl(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.BASE_URL);
    } catch (error) {
      console.error('Error retrieving base URL:', error);
      return null;
    }
  }

  // Store employee profile data
  static async storeEmployeeProfile(profile: EmployeeProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEE_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error storing employee profile:', error);
      throw new Error('Failed to store employee profile');
    }
  }

  // Get stored employee profile data
  static async getEmployeeProfile(): Promise<EmployeeProfile | null> {
    try {
      const profile = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEE_PROFILE);
      if (!profile) {
        return null;
      }
      return JSON.parse(profile);
    } catch (error) {
      console.error('Error retrieving employee profile:', error);
      return null;
    }
  }

  // Clear employee profile data
  static async clearEmployeeProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.EMPLOYEE_PROFILE);
    } catch (error) {
      console.error('Error clearing employee profile:', error);
    }
  }
}







