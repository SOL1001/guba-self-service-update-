import { Colors } from '../constants/Theme';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';

interface ChangePasswordScreenProps {
  onBack: () => void;
}

export default function ChangePasswordScreen({ onBack }: ChangePasswordScreenProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        data: {
          current_password: currentPassword,
          new_password: newPassword,
        },
      };

      const response = await apiService.changePassword(payload);
      
      console.log('Change Password API Response:', JSON.stringify(response, null, 2));
      
      const message = response?.message || '';
      const isSuccess = message.toLowerCase().includes('success') || message.toLowerCase().includes('successfully');
      
      if (isSuccess) {
        Alert.alert(
          'Success',
          'Password changed successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear form
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                // Navigate back
                onBack();
              },
            },
          ]
        );
      } else {
        const errorMessage = response?.message || 'Failed to change password';
        Alert.alert('Error', errorMessage);
      }
    } catch (err) {
      console.error('Error changing password:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password. Please check your connection.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{'flex': 1, 'backgroundColor': theme.card}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{'backgroundColor': theme.background, 'paddingHorizontal': 16, 'paddingVertical': 20, 'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'space-between', 'borderBottomWidth': 1, 'borderColor': theme.border, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2}}>
        <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
          <TouchableOpacity 
            onPress={onBack} 
            style={{'marginRight': 12, 'width': 40, 'height': 40, 'alignItems': 'center', 'justifyContent': 'center'}}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#2563EB" />
          </TouchableOpacity>
          <View>
            <Text style={{'fontSize': 24, 'fontWeight': 'bold'}}>Change Password</Text>
            <Text style={{'fontSize': 12, 'color': theme.secondary}}>Update your account password</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={{'flex': 1}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={{'paddingHorizontal': 16, 'paddingTop': 24}}>
          {/* Current Password */}
          <View style={{'marginBottom': 20}}>
            <Text style={{'fontSize': 14, 'fontWeight': '600', 'marginBottom': 8}}>Current Password *</Text>
            <View style={{'flexDirection': 'row', 'alignItems': 'center', 'backgroundColor': theme.background, 'borderColor': theme.border, 'borderRadius': 12, 'paddingHorizontal': 16, 'paddingVertical': 16}}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showCurrentPassword}
                style={{'flex': 1, 'fontSize': 16}}
                style={{ fontSize: 16, color: '#1F2937' }}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={{'padding': 4}}>
                <Ionicons 
                  name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={{'marginBottom': 20}}>
            <Text style={{'fontSize': 14, 'fontWeight': '600', 'marginBottom': 8}}>New Password *</Text>
            <View style={{'flexDirection': 'row', 'alignItems': 'center', 'backgroundColor': theme.background, 'borderColor': theme.border, 'borderRadius': 12, 'paddingHorizontal': 16, 'paddingVertical': 16}}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showNewPassword}
                style={{'flex': 1, 'fontSize': 16}}
                style={{ fontSize: 16, color: '#1F2937' }}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={{'padding': 4}}>
                <Ionicons 
                  name={showNewPassword ? 'eye-outline' : 'eye-off-outline'} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>
            <Text style={{'fontSize': 12, 'color': theme.secondary, 'marginTop': 8}}>Password must be at least 6 characters long</Text>
          </View>

          {/* Confirm Password */}
          <View style={{'marginBottom': 24}}>
            <Text style={{'fontSize': 14, 'fontWeight': '600', 'marginBottom': 8}}>Confirm New Password *</Text>
            <View style={{'flexDirection': 'row', 'alignItems': 'center', 'backgroundColor': theme.background, 'borderColor': theme.border, 'borderRadius': 12, 'paddingHorizontal': 16, 'paddingVertical': 16}}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                style={{'flex': 1, 'fontSize': 16}}
                style={{ fontSize: 16, color: '#1F2937' }}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{'padding': 4}}>
                <Ionicons 
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={{'borderRadius': 12, 'paddingVertical': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2}}
            onPress={handleChangePassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={{'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'center'}}>
                <ActivityIndicator color="white" size="small" />
                <Text style={{'color': '#fff', 'textAlign': 'center', 'fontSize': 18, 'fontWeight': 'bold', 'marginLeft': 8}}>
                  Changing Password...
                </Text>
              </View>
            ) : (
              <Text style={{'color': '#fff', 'textAlign': 'center', 'fontSize': 18, 'fontWeight': 'bold'}}>
                Change Password
              </Text>
            )}
          </TouchableOpacity>

          {/* Info Card */}
          <View style={{'borderRadius': 12, 'padding': 16, 'marginTop': 24, 'borderWidth': 1}}>
            <View style={{'flexDirection': 'row'}}>
              <Ionicons name="information-circle" size={20} color="#2563EB" style={{ marginRight: 8, marginTop: 2 }} />
              <View style={{'flex': 1}}>
                <Text style={{'fontSize': 14, 'fontWeight': '600', 'marginBottom': 4}}>Password Requirements</Text>
                <Text style={{'fontSize': 12}}>
                  • Minimum 6 characters{'\n'}
                  • Must be different from current password{'\n'}
                  • Use a combination of letters and numbers for better security
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}





