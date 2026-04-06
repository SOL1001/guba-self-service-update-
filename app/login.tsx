import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService, UserProfile } from '../src/services/api';
import { StorageService } from '../src/services/storage';
import { useAuth } from '../src/context/AuthContext';
import { Colors } from '../src/constants/Theme';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const [inputType, setInputType] = useState<'workplace' | 'erp'>('workplace');
    const [workplaceUrl, setWorkplaceUrl] = useState('https://');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasStoredBaseUrl, setHasStoredBaseUrl] = useState(false);

    const { login } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    useEffect(() => {
        loadStoredBaseUrl();
    }, []);

    const loadStoredBaseUrl = async () => {
        try {
            const storedBaseUrl = await StorageService.getBaseUrl();
            if (storedBaseUrl) {
                setWorkplaceUrl(storedBaseUrl);
                setHasStoredBaseUrl(true);
                apiService.setBaseUrl(storedBaseUrl);
            }
        } catch (error) {
            console.error('Error loading stored base URL:', error);
        }
    };

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both username and password');
            return;
        }

        const baseUrlToUse = hasStoredBaseUrl ? workplaceUrl : (inputType === 'workplace' ? workplaceUrl : null);

        if (!baseUrlToUse || !baseUrlToUse.trim() || baseUrlToUse === 'https://') {
            Alert.alert('Error', 'Please enter workplace URL');
            return;
        }

        setIsLoading(true);

        try {
            apiService.setBaseUrl(baseUrlToUse);
            await StorageService.storeBaseUrl(baseUrlToUse);

            const response = await apiService.login({
                usr: username,
                pwd: password,
            });

            const userProfile: UserProfile = {
                full_name: response.full_name,
                user: response.user,
                employee_id: response.employee_id,
                gender: response.gender,
                api_key: response.key_details.api_key,
                api_secret: response.key_details.api_secret,
            };

            await StorageService.storeUserData({
                userProfile,
                baseUrl: baseUrlToUse,
                apiKey: response.key_details.api_key,
                apiSecret: response.key_details.api_secret,
            });

            apiService.setCredentials(response.key_details.api_key, response.key_details.api_secret);

            try {
                const profileResponse = await apiService.getProfile();
                if (profileResponse.message === 'Profile get successfully' && profileResponse.data) {
                    userProfile.employee_image = profileResponse.data.employee_image || null;
                    await StorageService.storeUserData({
                        userProfile,
                        baseUrl: baseUrlToUse,
                        apiKey: response.key_details.api_key,
                        apiSecret: response.key_details.api_secret,
                    });
                }
            } catch (profileError) {
                console.error('Error fetching profile after login:', profileError);
            }

            login(userProfile);
            router.replace('/(app)');

        } catch (error) {
            Alert.alert(
                'Login Failed',
                error instanceof Error ? error.message : 'An unknown error occurred'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    style={styles.container}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <Text style={[styles.headerTitle, { color: theme.primary }]}>
                            ESS
                        </Text>
                        <Text style={[styles.headerSubtitle, { color: theme.primary }]}>by Guba</Text>
                    </View>

                    {/* Login Prompt */}
                    <View style={styles.promptContainer}>
                        <Text style={[styles.promptTitle, { color: theme.primary }]}>
                            Let's sign you in
                        </Text>
                        <Text style={[styles.promptSubtitle, { color: theme.secondary }]}>
                            Enter below details to continue..
                        </Text>
                    </View>

                    {/* Input Fields */}
                    <View style={styles.inputGroup}>
                        {!hasStoredBaseUrl && (
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.inputLabel, { color: theme.secondary }]}>
                                    {inputType === 'workplace' ? 'Enter workplace url' : 'Enter ERP code'}
                                </Text>
                                <View style={[styles.inputFieldContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                    <Ionicons
                                        name={inputType === 'workplace' ? 'globe-outline' : 'business-outline'}
                                        size={22}
                                        color={theme.icon}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        value={inputType === 'workplace' ? workplaceUrl : ''}
                                        onChangeText={inputType === 'workplace' ? setWorkplaceUrl : undefined}
                                        placeholder={inputType === 'workplace' ? '' : 'Enter ERP code'}
                                        placeholderTextColor={theme.secondary}
                                        style={[styles.inputField, { color: theme.text }]}
                                        keyboardType={inputType === 'workplace' ? 'url' : 'default'}
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>
                        )}

                        <View style={styles.inputWrapper}>
                            <View style={[styles.inputFieldContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Ionicons name="person-outline" size={22} color={theme.icon} style={styles.inputIcon} />
                                <TextInput
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Username"
                                    placeholderTextColor={theme.secondary}
                                    style={[styles.inputField, { color: theme.text }]}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputWrapper}>
                            <View style={[styles.inputFieldContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Ionicons name="lock-closed-outline" size={22} color={theme.icon} style={styles.inputIcon} />
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Password"
                                    placeholderTextColor={theme.secondary}
                                    secureTextEntry={!showPassword}
                                    style={[styles.inputField, { color: theme.text }]}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                                    <Ionicons
                                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={22}
                                        color={theme.icon}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionGroup}>
                        <TouchableOpacity
                            style={[styles.loginButton, { backgroundColor: theme.primary }]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator color="#ffffff" size="small" />
                                    <Text style={styles.loginButtonText}>
                                        Logging in...
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.loginButtonText}>
                                    Login
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 50,
        paddingBottom: 300,
        flexGrow: 1,
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: 48,
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 4,
        letterSpacing: 1,
    },
    headerSubtitle: {
        fontSize: 18,
        fontWeight: '500',
    },
    promptContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    promptTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    promptSubtitle: {
        textAlign: 'center',
        paddingHorizontal: 32,
        fontSize: 16,
    },
    inputGroup: {
        paddingHorizontal: 32,
    },
    inputWrapper: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        marginBottom: 8,
        marginLeft: 4,
        fontWeight: '500',
    },
    inputFieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    inputIcon: {
        marginRight: 12,
    },
    inputField: {
        flex: 1,
        fontSize: 16,
    },
    passwordToggle: {
        padding: 4,
    },
    actionGroup: {
        paddingHorizontal: 32,
        marginTop: 40,
    },
    loginButton: {
        borderRadius: 12,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    bottomSpacer: {
        height: 32,
    },
});
