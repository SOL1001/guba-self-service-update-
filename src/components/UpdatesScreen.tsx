import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Platform, ActivityIndicator , useColorScheme } from 'react-native';
import { Colors } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';

interface UpcomingActivity {
  title: string;
  description: string;
}

interface UpcomingActivityByDate {
  [date: string]: UpcomingActivity[];
}

export default function UpdatesScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // const [updatesTab, setUpdatesTab] = useState('posts');
  const [updatesTab, setUpdatesTab] = useState('events');
  const [upcomingActivities, setUpcomingActivities] = useState<UpcomingActivityByDate>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (updatesTab === 'events') {
      fetchUpcomingActivities();
    }
  }, [updatesTab]);

  const fetchUpcomingActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      const response = await apiService.getUpcomingActivity(today);
      
      console.log('Upcoming Activity API Response:', JSON.stringify(response, null, 2));
      
      if (response.message === 'Upcoming activity details' || response.message?.toLowerCase().includes('upcoming')) {
        setUpcomingActivities(response.data || {});
      } else {
        setError(response.message || 'Failed to fetch upcoming activities');
      }
    } catch (err) {
      console.error('Error fetching upcoming activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming activities');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getAllActivities = () => {
    const allActivities: Array<{ date: string; activity: UpcomingActivity }> = [];
    Object.keys(upcomingActivities).forEach(date => {
      upcomingActivities[date].forEach(activity => {
        allActivities.push({ date, activity });
      });
    });
    // Sort by date
    return allActivities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <View style={{'flex': 1}}>
      {/* Status Bar Spacer */}
      {/* <View style={{ 
        height: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
        backgroundColor: 'white' 
      }} /> */}
      
      {/* Header */}
      <View style={{'backgroundColor': theme.background, 'paddingHorizontal': 16, 'paddingVertical': 12}}>
        <View style={{'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'space-between', 'marginBottom': 16}}>
          <Text style={{'fontSize': 24, 'fontWeight': 'bold', 'color': theme.text}}>Updates</Text>
          {/* <View style={{'width': 32, 'height': 32, 'backgroundColor': theme.card, 'borderRadius': 9999, 'alignItems': 'center', 'justifyContent': 'center'}}>
            <Ionicons name="notifications" size={16} color="#6B7280" />
          </View> */}
        </View>
        
        {/* Tabs */}
        {/* <View style={{'flexDirection': 'row'}}>
          <TouchableOpacity 
            style={{'marginRight': 24, 'paddingBottom': 8}}
            onPress={() => setUpdatesTab('posts')}
          >
            <Text >Posts</Text>
            {updatesTab === 'posts' && (
              <View style={{'marginTop': 8}} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={{'paddingBottom': 8}}
            onPress={() => setUpdatesTab('events')}
          >
            <Text >Events</Text>
            {updatesTab === 'events' && (
              <View style={{'marginTop': 8}} />
            )}
          </TouchableOpacity>
        </View> */}
      </View>

      {/* Content */}
      <ScrollView style={{'flex': 1, 'paddingHorizontal': 16, 'paddingVertical': 16, backgroundColor: theme.bodyBackgroundColor}}>
        {updatesTab === 'posts' ? (
          <>
            {/* Create Post Buttons */}
            <View style={{'flexDirection': 'row', 'marginBottom': 24}}>
              <TouchableOpacity style={{'borderRadius': 16, 'paddingHorizontal': 16, 'paddingVertical': 12, 'flexDirection': 'row', 'alignItems': 'center', 'marginRight': 12}}>
                <Ionicons name="add" size={20} color="white" />
                <Text style={{'color': '#fff', 'fontWeight': '600', 'marginLeft': 8}}>Create Post</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{'backgroundColor': theme.card, 'borderRadius': 16, 'paddingHorizontal': 16, 'paddingVertical': 12, 'flexDirection': 'row', 'alignItems': 'center'}}>
                <Ionicons name="bar-chart" size={20} color="#6B7280" />
                <Text style={{'color': theme.secondary, 'fontWeight': '600', 'marginLeft': 8}}>Create Poll</Text>
              </TouchableOpacity>
            </View>

            
            {/* Post Card 2 - Image Post */}
            <View style={{'backgroundColor': theme.background, 'borderRadius': 16, 'padding': 16, 'marginBottom': 16}}>
              {/* Post Header */}
              <View style={{'flexDirection': 'row', 'alignItems': 'center', 'marginBottom': 16}}>
                <View style={{'width': 48, 'height': 48, 'borderRadius': 9999, 'alignItems': 'center', 'justifyContent': 'center', 'marginRight': 12}}>
                  <Text style={{'color': '#fff', 'fontWeight': 'bold', 'fontSize': 14}}>SM</Text>
                </View>
                <View style={{'flex': 1}}>
                  <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'color': theme.text}}>Sarah Miller</Text>
                  <Text style={{'color': theme.secondary, 'fontSize': 14}}>5 days ago</Text>
                </View>
              </View>

              {/* Post Content */}
              <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'color': theme.text, 'marginBottom': 12}}>
                📸 Team Building Event - Amazing Day!
              </Text>
              
              <Text style={{'fontSize': 16, 'marginBottom': 16}}>
                Had an incredible team building event today! The collaboration and energy were off the charts. Here are some highlights from our day:
              </Text>

              {/* Image Content */}
              <View style={{'borderRadius': 12, 'height': 192, 'marginBottom': 16, 'alignItems': 'center', 'justifyContent': 'center'}}>
                <Ionicons name="image" size={48} color="#9CA3AF" />
                <Text style={{'color': theme.secondary, 'marginTop': 8}}>Team Building Photo</Text>
              </View>

              <Text style={{'fontSize': 16, 'marginBottom': 16}}>
                Thanks to everyone who participated! Looking forward to more team events like this. 🎉
              </Text>

              {/* Post Interactions */}
              <View style={{'flexDirection': 'row', 'alignItems': 'center', 'paddingTop': 16, 'borderTopWidth': 1}}>
                <TouchableOpacity style={{'flexDirection': 'row', 'alignItems': 'center', 'marginRight': 24}}>
                  <Ionicons name="thumbs-up" size={20} color="#6B7280" />
                  <Text style={{'color': theme.secondary, 'fontWeight': '600', 'marginLeft': 8}}>8 Likes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{'flexDirection': 'row', 'alignItems': 'center'}}>
                  <Ionicons name="chatbubble" size={20} color="#6B7280" />
                  <Text style={{'color': theme.secondary, 'fontWeight': '600', 'marginLeft': 8}}>3 Comments</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Post Card 3 - Video Post */}
            <View style={{'backgroundColor': theme.background, 'borderRadius': 16, 'padding': 16, 'marginBottom': 16}}>
              {/* Post Header */}
              <View style={{'flexDirection': 'row', 'alignItems': 'center', 'marginBottom': 16}}>
                <View style={{'width': 48, 'height': 48, 'borderRadius': 9999, 'alignItems': 'center', 'justifyContent': 'center', 'marginRight': 12}}>
                  <Text style={{'color': '#fff', 'fontWeight': 'bold', 'fontSize': 14}}>AJ</Text>
                </View>
                <View style={{'flex': 1}}>
                  <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'color': theme.text}}>Alex Johnson</Text>
                  <Text style={{'color': theme.secondary, 'fontSize': 14}}>2 days ago</Text>
                </View>
              </View>

              {/* Post Content */}
              <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'color': theme.text, 'marginBottom': 12}}>
                🎥 Product Demo - New Features Walkthrough
              </Text>
              
              <Text style={{'fontSize': 16, 'marginBottom': 16}}>
                Excited to share our latest product updates! Check out this quick demo of the new features we've been working on:
              </Text>

              {/* Video Content */}
              <View style={{'borderRadius': 12, 'height': 192, 'marginBottom': 16, 'alignItems': 'center', 'justifyContent': 'center', 'position': 'relative'}}>
                <Ionicons name="play-circle" size={64} color="white" />
                <View style={{'position': 'absolute', 'paddingHorizontal': 8, 'paddingVertical': 4, 'borderRadius': 4}}>
                  <Text style={{'color': '#fff', 'fontSize': 12}}>2:45</Text>
                </View>
              </View>

              <Text style={{'fontSize': 16, 'marginBottom': 16}}>
                Let me know what you think! Your feedback helps us improve the product. 💪
              </Text>

              {/* Post Interactions */}
              <View style={{'flexDirection': 'row', 'alignItems': 'center', 'paddingTop': 16, 'borderTopWidth': 1}}>
                <TouchableOpacity style={{'flexDirection': 'row', 'alignItems': 'center', 'marginRight': 24}}>
                  <Ionicons name="thumbs-up" size={20} color="#6B7280" />
                  <Text style={{'color': theme.secondary, 'fontWeight': '600', 'marginLeft': 8}}>12 Likes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{'flexDirection': 'row', 'alignItems': 'center'}}>
                  <Ionicons name="chatbubble" size={20} color="#6B7280" />
                  <Text style={{'color': theme.secondary, 'fontWeight': '600', 'marginLeft': 8}}>5 Comments</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Upcoming Activity Header */}
            <View style={{'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'space-between', 'marginBottom': 24}}>
              <Text style={{'fontSize': 20, 'fontWeight': 'bold', 'color': theme.text}}>Upcoming Activity</Text>
              <Ionicons name="calendar" size={20} color="#6B7280" />
            </View>

            {loading ? (
              <View style={{'alignItems': 'center', 'justifyContent': 'center', 'paddingVertical': 48}}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={{'color': theme.secondary, 'marginTop': 16}}>Loading upcoming activities...</Text>
              </View>
            ) : error ? (
              <View style={{'alignItems': 'center', 'justifyContent': 'center', 'paddingVertical': 48}}>
                <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                <Text style={{'textAlign': 'center', 'marginTop': 16, 'marginBottom': 16}}>{error}</Text>
                <TouchableOpacity 
                  style={{'paddingHorizontal': 24, 'paddingVertical': 12, 'borderRadius': 12}}
                  onPress={fetchUpcomingActivities}
                >
                  <Text style={{'color': '#fff', 'fontWeight': '600'}}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : Object.keys(upcomingActivities).length === 0 ? (
              <View style={{'alignItems': 'center', 'justifyContent': 'center', 'paddingVertical': 48}}>
                <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                <Text style={{'color': theme.secondary, 'textAlign': 'center', 'marginTop': 16}}>
                  No upcoming activities found
                </Text>
              </View>
            ) : (
              <>
                {getAllActivities().map((item, index) => (
                  <View key={`${item.date}-${index}`} style={{'marginBottom': 16}}>
                    {/* Date Header */}
                    <Text style={{'color': theme.secondary, 'fontSize': 14, 'fontWeight': '600', 'marginBottom': 8}}>
                      {formatDate(item.date)}
                    </Text>
                    
                    {/* Activity Card */}
                    <View style={{'backgroundColor': theme.background, 'borderRadius': 16, 'padding': 16, 'marginBottom': 16}}>
                      <View style={{'flexDirection': 'row'}}>
                        <View style={{'width': 48, 'height': 48, 'borderRadius': 9999, 'alignItems': 'center', 'justifyContent': 'center', 'marginRight': 16}}>
                          <Ionicons name="calendar" size={24} color="#3B82F6" />
                        </View>
                        <View style={{'flex': 1}}>
                          <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'color': theme.text, 'marginBottom': 4}}>
                            {item.activity.title}
                          </Text>
                          {item.activity.description && (
                            <Text style={{'color': theme.secondary, 'fontSize': 14}}>
                              {item.activity.description}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* Bottom spacing */}
        <View style={{'height': 96}} />
      </ScrollView>
    </View>
  );
}

