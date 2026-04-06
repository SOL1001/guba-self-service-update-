import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, apiService } from '../services/api';
import { StorageService } from '../services/storage';

interface AuthContextType {
    userProfile: UserProfile | null;
    isLoading: boolean;
    login: (profile: UserProfile) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkStoredUserData();
    }, []);

    const checkStoredUserData = async () => {
        try {
            const storedData = await StorageService.getStoredUserData();

            if (storedData && storedData.isLoggedIn && storedData.userProfile) {
                apiService.setBaseUrl(storedData.baseUrl);
                apiService.setCredentials(storedData.apiKey, storedData.apiSecret);

                try {
                    const storedProfile = await StorageService.getEmployeeProfile();
                    if (storedProfile?.employee_image) {
                        storedData.userProfile.employee_image = storedProfile.employee_image;
                    }
                } catch (e) {
                    console.error("Error reading employee profile", e);
                }

                setUserProfile(storedData.userProfile);
            }
        } catch (error) {
            console.error('Error checking stored user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = (profile: UserProfile) => {
        setUserProfile(profile);
    };

    const logout = async () => {
        try {
            await StorageService.clearUserData();
            apiService.setCredentials('', '');
            setUserProfile(null);
        } catch (error) {
            console.error('Error during logout:', error);
            setUserProfile(null);
        }
    };

    return (
        <AuthContext.Provider value={{ userProfile, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
