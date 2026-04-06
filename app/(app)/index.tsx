import React from 'react';
import MainApp from '../../src/components/MainApp';
import { useAuth } from '../../src/context/AuthContext';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/Theme';

export default function AppIndex() {
    const { userProfile, logout } = useAuth();

    if (!userProfile) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <MainApp userProfile={userProfile} onLogout={logout} />
        </SafeAreaView>
    );
}
