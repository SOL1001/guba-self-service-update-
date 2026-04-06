import { Colors } from '../constants/Theme';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService, Notification } from '../services/api';

interface NotificationScreenProps {
  onBack: () => void;
}

export default function NotificationScreen({ onBack }: NotificationScreenProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getNotificationList();
      
      if (response.message === 'Notification list get successfully') {
        setNotifications(response.data || []);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string) => {

    if (!imagePath) return null;
    // If the path starts with http:// or https://, it's already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // If the path starts with /, it's a relative path from the base URL
    if (imagePath.startsWith('/')) {
      const baseUrl = apiService.getBaseUrl();
      if (baseUrl) {
        return `${baseUrl}${imagePath}`;
      }
    }
    return imagePath;
  };

  const renderNotificationCard = ({ item }: { item: Notification }) => {
    const imageUrl = getImageUrl(item.user_image);
    
    return (
      <TouchableOpacity style={{'backgroundColor': theme.background, 'borderRadius': 12, 'padding': 16, 'marginBottom': 12, 'marginHorizontal': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2, 'borderWidth': 1}}>
        <View style={{'flexDirection': 'row'}}>
          {/* User Image */}
          <View style={{'width': 48, 'height': 48, 'borderRadius': 9999, 'alignItems': 'center', 'justifyContent': 'center', 'marginRight': 12, 'overflow': 'hidden'}}>
            {imageUrl ? (
              <Image 
                source={{ uri: imageUrl }} 
                
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={24} color="#9CA3AF" />
            )}
          </View>

          {/* Content */}
          <View style={{'flex': 1}}>
            <Text style={{'fontSize': 16, 'fontWeight': '600', 'color': theme.text, 'marginBottom': 4}}>
              {item.title}
            </Text>
            {item.message && (
              <Text style={{'fontSize': 14, 'color': theme.secondary, 'marginBottom': 8}} numberOfLines={3}>
                {item.message}
              </Text>
            )}
            <View style={{'flexDirection': 'row', 'alignItems': 'center', 'marginTop': 4}}>
              <Ionicons name="time-outline" size={14} color="#9CA3AF" />
              <Text style={{'fontSize': 12, 'color': theme.secondary, 'marginLeft': 4}}>
                {item.creation}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={{'backgroundColor': theme.background, 'paddingBottom': 16}}>
      {/* Header */}
      <View style={{'flexDirection': 'row', 'alignItems': 'center', 'paddingHorizontal': 16, 'paddingTop': 16, 'paddingBottom': 12}} >
        <TouchableOpacity onPress={onBack} style={{'marginRight': 16}}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{'fontSize': 24, 'fontWeight': 'bold', 'color': theme.text, 'flex': 1}}>Notifications</Text>
        <TouchableOpacity onPress={fetchNotifications} style={{'padding': 8}}>
          <Ionicons name="refresh" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      {notifications.length > 0 && (
        <View style={{'paddingHorizontal': 16}}>
          <Text style={{'fontSize': 14, 'color': theme.secondary}}>
            {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={{'flex': 1, 'backgroundColor': theme.card}}>
        {renderHeader()}
        <View style={{'flex': 1, 'alignItems': 'center', 'justifyContent': 'center'}}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{'color': theme.secondary, 'marginTop': 16}}>Loading notifications...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{'flex': 1, 'backgroundColor': theme.card}}>
        {renderHeader()}
        <View style={{'flex': 1, 'alignItems': 'center', 'justifyContent': 'center', 'paddingHorizontal': 16}}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={{'fontSize': 18, 'fontWeight': '600', 'marginTop': 16, 'textAlign': 'center'}}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchNotifications}
            style={{'marginTop': 16, 'paddingHorizontal': 24, 'paddingVertical': 12, 'borderRadius': 12}}
          >
            <Text style={{'color': '#fff', 'fontWeight': '600'}}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={{'flex': 1, 'backgroundColor': theme.card}}>
        {renderHeader()}
        <View style={{'flex': 1, 'alignItems': 'center', 'justifyContent': 'center', 'paddingHorizontal': 16}}>
          <Ionicons name="notifications-off-outline" size={64} color="#9CA3AF" />
          <Text style={{'color': theme.secondary, 'fontSize': 18, 'fontWeight': '600', 'marginTop': 16, 'textAlign': 'center'}}>
            No notifications found
          </Text>
          <Text style={{'fontSize': 14, 'marginTop': 8, 'textAlign': 'center'}}>
            You're all caught up!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{'flex': 1, 'backgroundColor': theme.card}}>
      <FlatList
        data={notifications}
        renderItem={renderNotificationCard}
        keyExtractor={(item, index) => `${item.title}-${item.creation}-${index}`}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

