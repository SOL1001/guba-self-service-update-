import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, StatusBar , useColorScheme } from 'react-native';
import { Colors } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

interface LeaveDetailsScreenProps {
  leave: {
    name: string;
    leave_type: string;
    from_date: string;
    to_date: string;
    total_leave_days: number;
    description: string;
    status: string;
    posting_date: string;
    half_day: number;
    half_day_date: string | null;
  };
  onBack: () => void;
}

export default function LeaveDetailsScreen({ leave, onBack }: LeaveDetailsScreenProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const getStatusColor = (status: string) => {

    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'open':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={{'flex': 1, 'backgroundColor': theme.card}}>
      {/* Status Bar Spacer */}
      {/* <View style={{ 
        height: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
        backgroundColor: 'white' 
      }} /> */}
      
      {/* Header */}
      <View style={{'backgroundColor': theme.background, 'paddingHorizontal': 16, 'paddingVertical': 16, 'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'space-between', 'borderBottomWidth': 1, 'borderColor': theme.border}}>
        <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
          <TouchableOpacity onPress={onBack} style={{'marginRight': 12}}>
            <Ionicons name="arrow-back" size={24} color="#2563EB" />
          </TouchableOpacity>
          <Text style={{'fontSize': 20, 'fontWeight': 'bold'}}>Leave Details</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={{'flex': 1, 'paddingHorizontal': 16, 'paddingVertical': 16}}>
        {/* Leave ID Card */}
        <View style={{'backgroundColor': theme.background, 'borderRadius': 8, 'padding': 16, 'marginBottom': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2}}>
          <View style={{'flexDirection': 'row', 'justifyContent': 'space-between', 'marginBottom': 12}}>
            <View style={{'flex': 1}}>
              <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'marginBottom': 4}}>{leave.name}</Text>
              <Text style={{'fontSize': 14, 'color': theme.secondary}}>
                Applied: {formatDate(leave.posting_date)}
              </Text>
            </View>
            <View >
              <Ionicons 
                name={getStatusIcon(leave.status)} 
                size={16} 
                color={leave.status.toLowerCase() === 'approved' ? '#10B981' : 
                       leave.status.toLowerCase() === 'rejected' ? '#EF4444' : '#F59E0B'} 
                style={{'marginRight': 8}} 
              />
              <Text style={{'fontSize': 14, 'fontWeight': '500'}}>{leave.status}</Text>
            </View>
          </View>
        </View>

        {/* Leave Information Card */}
        <View style={{'backgroundColor': theme.background, 'borderRadius': 8, 'padding': 16, 'marginBottom': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2}}>
          <Text style={{'fontSize': 18, 'fontWeight': '600', 'marginBottom': 16}}>Leave Information</Text>
          
          <View >
            <View style={{'flexDirection': 'row', 'justifyContent': 'space-between', 'alignItems': 'center', 'paddingVertical': 8, 'borderBottomWidth': 1}}>
              <Text style={{'color': theme.secondary}}>Leave Type</Text>
              <Text style={{'fontWeight': '500'}}>{leave.leave_type}</Text>
            </View>
            
            <View style={{'flexDirection': 'row', 'justifyContent': 'space-between', 'alignItems': 'center', 'paddingVertical': 8, 'borderBottomWidth': 1}}>
              <Text style={{'color': theme.secondary}}>From Date</Text>
              <Text style={{'fontWeight': '500'}}>{formatDate(leave.from_date)}</Text>
            </View>
            
            <View style={{'flexDirection': 'row', 'justifyContent': 'space-between', 'alignItems': 'center', 'paddingVertical': 8, 'borderBottomWidth': 1}}>
              <Text style={{'color': theme.secondary}}>To Date</Text>
              <Text style={{'fontWeight': '500'}}>{formatDate(leave.to_date)}</Text>
            </View>
            
            <View style={{'flexDirection': 'row', 'justifyContent': 'space-between', 'alignItems': 'center', 'paddingVertical': 8, 'borderBottomWidth': 1}}>
              <Text style={{'color': theme.secondary}}>Total Days</Text>
              <Text style={{'fontWeight': '500'}}>{leave.total_leave_days} days</Text>
            </View>
            
            {leave.half_day === 1 && (
              <View style={{'flexDirection': 'row', 'justifyContent': 'space-between', 'alignItems': 'center', 'paddingVertical': 8, 'borderBottomWidth': 1}}>
                <Text style={{'color': theme.secondary}}>Half Day Date</Text>
                <Text style={{'fontWeight': '500'}}>
                  {leave.half_day_date ? formatDate(leave.half_day_date) : 'N/A'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Description Card */}
        {leave.description && (
          <View style={{'backgroundColor': theme.background, 'borderRadius': 8, 'padding': 16, 'marginBottom': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2}}>
            <Text style={{'fontSize': 18, 'fontWeight': '600', 'marginBottom': 12}}>Description</Text>
            <Text >{leave.description}</Text>
          </View>
        )}

        {/* Status Information Card */}
        <View style={{'backgroundColor': theme.background, 'borderRadius': 8, 'padding': 16, 'marginBottom': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2}}>
          <Text style={{'fontSize': 18, 'fontWeight': '600', 'marginBottom': 12}}>Status Information</Text>
          
          <View style={{'flexDirection': 'row', 'alignItems': 'center', 'marginBottom': 12}}>
            <Ionicons 
              name={getStatusIcon(leave.status)} 
              size={24} 
              color={leave.status.toLowerCase() === 'approved' ? '#10B981' : 
                     leave.status.toLowerCase() === 'rejected' ? '#EF4444' : '#F59E0B'} 
              style={{'marginRight': 12}} 
            />
            <View>
              <Text style={{'fontWeight': '500'}}>{leave.status}</Text>
              <Text style={{'fontSize': 14, 'color': theme.secondary}}>
                {leave.status.toLowerCase() === 'approved' ? 'Your leave has been approved' :
                 leave.status.toLowerCase() === 'rejected' ? 'Your leave has been rejected' :
                 'Your leave is pending approval'}
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}























