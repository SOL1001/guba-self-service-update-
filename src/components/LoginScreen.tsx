import { Colors } from '../constants/Theme';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService, UserProfile } from '../services/api';
import { StorageService } from '../services/storage';

interface LoginScreenProps {
  onLoginSuccess: (userProfile: UserProfile) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [inputType, setInputType] = useState<'workplace' | 'erp'>('workplace');
  const [workplaceUrl, setWorkplaceUrl] = useState('https://');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStoredBaseUrl, setHasStoredBaseUrl] = useState(false);

  // Load stored base URL on mount
  useEffect(() => {
    loadStoredBaseUrl();
  }, []);

  const loadStoredBaseUrl = async () => {
    try {
      const storedBaseUrl = await StorageService.getBaseUrl();
      if (storedBaseUrl) {
        setWorkplaceUrl(storedBaseUrl);
        setHasStoredBaseUrl(true);
        // Set the base URL in API service
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

    // Use stored base URL if available, otherwise require workplace URL input
    const baseUrlToUse = hasStoredBaseUrl ? workplaceUrl : (inputType === 'workplace' ? workplaceUrl : null);
    
    if (!baseUrlToUse || !baseUrlToUse.trim() || baseUrlToUse === 'https://') {
      Alert.alert('Error', 'Please enter workplace URL');
      return;
    }

    setIsLoading(true);
    
    try {
      // Set the base URL for API calls
      apiService.setBaseUrl(baseUrlToUse);
      
      // Store the base URL for future logins
      await StorageService.storeBaseUrl(baseUrlToUse);

      // Perform login
      const response = await apiService.login({
        usr: username,
        pwd: password,
      });

      // Create user profile from response
      const userProfile: UserProfile = {
        full_name: response.full_name,
        user: response.user,
        employee_id: response.employee_id,
        gender: response.gender,
        api_key: response.key_details.api_key,
        api_secret: response.key_details.api_secret,
      };

      // Store user data in AsyncStorage (base URL is already stored above)
      await StorageService.storeUserData({
        userProfile,
        baseUrl: baseUrlToUse,
        apiKey: response.key_details.api_key,
        apiSecret: response.key_details.api_secret,
      });

      // Set API credentials for future requests
      apiService.setCredentials(response.key_details.api_key, response.key_details.api_secret);

      // Fetch profile to get employee image
      try {
        const profileResponse = await apiService.getProfile();
        if (profileResponse.message === 'Profile get successfully' && profileResponse.data) {
          // Add employee image to user profile
          userProfile.employee_image = profileResponse.data.employee_image || null;
          // Update stored user data with image
          await StorageService.storeUserData({
            userProfile,
            baseUrl: baseUrlToUse,
            apiKey: response.key_details.api_key,
            apiSecret: response.key_details.api_secret,
          });
        }
      } catch (profileError) {
        console.error('Error fetching profile after login:', profileError);
        // Continue with login even if profile fetch fails
      }

      // Call success callback
      onLoginSuccess(userProfile);
      
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
    <View style={{'flex': 1, 'backgroundColor': theme.background}}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent /> */}
      
      <KeyboardAvoidingView 
        style={{'flex': 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          style={{'flex': 1}} 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ 
            paddingTop: 50,
            paddingBottom: 300,
            flexGrow: 1
          }}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          automaticallyAdjustKeyboardInsets={true}
          enableOnAndroid={true}
        >
        {/* Header */}
        <View style={{'alignItems': 'center', 'marginTop': 48, 'marginBottom': 24}}>
          <Text style={{'fontWeight': 'bold', 'color': theme.primary, 'marginBottom': 4}} style={{ letterSpacing: 1 }}>
            ESS
          </Text>
          <Text style={{'fontSize': 18, 'color': theme.primary, 'fontWeight': '500'}}>by Guba</Text>
        </View>

        {/* Login Prompt */}
        <View style={{'alignItems': 'center', 'marginBottom': 40}}>
          <Text style={{'fontSize': 24, 'fontWeight': 'bold', 'color': theme.primary, 'marginBottom': 12}}>
            Let's sign you in
          </Text>
          <Text style={{'color': theme.secondary, 'textAlign': 'center', 'paddingHorizontal': 32, 'fontSize': 16}}>
            Enter below details to continue..
          </Text>
        </View>

        {/* Input Type Toggle */}
        {/* <View style={{'flexDirection': 'row', 'justifyContent': 'center', 'alignItems': 'center', 'marginBottom': 40, 'paddingHorizontal': 32}}>
          <TouchableOpacity
            onPress={() => setInputType('workplace')}
            
          >
            <Text style={{'fontSize': 16, 'fontWeight': '600'}}>Workplace URL</Text>
          </TouchableOpacity>
          
          <View style={{'marginHorizontal': 24}}>
            <TouchableOpacity
              onPress={() => setInputType(inputType === 'workplace' ? 'erp' : 'workplace')}
              
              style={{ justifyContent: 'center' }}
            >
              <View
                style={{'width': 24, 'height': 24, 'backgroundColor': theme.background, 'borderRadius': 9999}}
                style={{
                  position: 'absolute',
                  top: 2,
                  left: inputType === 'workplace' ? 2 : 26,
                }}
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            onPress={() => setInputType('erp')}
            
          >
            <Text style={{'fontSize': 16, 'fontWeight': '600'}}>ERP Code</Text>
          </TouchableOpacity>
        </View> */}

        {/* Input Fields */}
        <View style={{'paddingHorizontal': 32}}>
          {/* Workplace URL / ERP Code Field - Only show if no stored base URL */}
          {!hasStoredBaseUrl && (
            <View>
              <Text style={{'fontSize': 14, 'color': theme.secondary, 'marginBottom': 8, 'marginLeft': 4, 'fontWeight': '500'}}>
                {inputType === 'workplace' ? 'Enter workplace url' : 'Enter ERP code'}
              </Text>
              <View style={{'flexDirection': 'row', 'alignItems': 'center', 'backgroundColor': theme.background, 'borderWidth': 1, 'borderColor': theme.border, 'borderRadius': 12, 'paddingHorizontal': 16, 'paddingVertical': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 2}, 'shadowOpacity': 0.1, 'shadowRadius': 4, 'elevation': 4}}>
                <Ionicons 
                  name={inputType === 'workplace' ? 'globe-outline' : 'business-outline'} 
                  size={22} 
                  color="#6B7280" 
                  style={{ marginRight: 12 }}
                />
                <TextInput
                  value={inputType === 'workplace' ? workplaceUrl : ''}
                  onChangeText={inputType === 'workplace' ? setWorkplaceUrl : undefined}
                  placeholder={inputType === 'workplace' ? '' : 'Enter ERP code'}
                  placeholderTextColor="#9CA3AF"
                  style={{'flex': 1, 'fontSize': 16}}
                  keyboardType={inputType === 'workplace' ? 'url' : 'default'}
                  autoCapitalize="none"
                  style={{ fontSize: 16, color: '#1F2937' }}
                />
              </View>
            </View>
          )}

          {/* Username Field */}
          <View style={{'flexDirection': 'row', 'alignItems': 'center', 'backgroundColor': theme.background, 'borderWidth': 1, 'borderColor': theme.border, 'borderRadius': 12, 'paddingHorizontal': 16, 'paddingVertical': 16, 'marginTop': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 2}, 'shadowOpacity': 0.1, 'shadowRadius': 4, 'elevation': 4}}>
            <Ionicons name="person-outline" size={22} color="#6B7280" style={{ marginRight: 12 }} />
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              style={{'flex': 1, 'fontSize': 16}}
              autoCapitalize="none"
              style={{ fontSize: 16, color: '#1F2937' }}
            />
          </View>

          {/* Password Field */}
          <View style={{'flexDirection': 'row', 'alignItems': 'center', 'backgroundColor': theme.background, 'borderWidth': 1, 'borderColor': theme.border, 'borderRadius': 12, 'paddingHorizontal': 16, 'paddingVertical': 16, 'marginTop': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 2}, 'shadowOpacity': 0.1, 'shadowRadius': 4, 'elevation': 4}}>
            <Ionicons name="lock-closed-outline" size={22} color="#6B7280" style={{ marginRight: 12 }} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              style={{'flex': 1, 'fontSize': 16}}
              style={{ fontSize: 16, color: '#1F2937' }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{'padding': 4}}>
              <Ionicons 
                name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                size={22} 
                color="#6B7280" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{'paddingHorizontal': 32, 'marginTop': 40}}>
          {/* Login Button */}
          <TouchableOpacity 
            style={{'borderRadius': 12, 'paddingVertical': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2}}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={{'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'center'}}>
                <ActivityIndicator color="white" size="small" />
                <Text style={{'color': '#fff', 'textAlign': 'center', 'fontSize': 18, 'fontWeight': 'bold', 'marginLeft': 8}}>
                  Logging in...
                </Text>
              </View>
            ) : (
              <Text style={{'color': '#fff', 'textAlign': 'center', 'fontSize': 18, 'fontWeight': 'bold'}}>
                Login
              </Text>
            )}
          </TouchableOpacity>

          
        </View>

        {/* Bottom spacing */}
        <View style={{'height': 32}} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
