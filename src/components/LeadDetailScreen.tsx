import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar , useColorScheme } from 'react-native';
import { Colors } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { Lead } from '../services/api';

interface LeadDetailScreenProps {
    lead: Lead;
    onBack: () => void;
}

export default function LeadDetailScreen({ lead, onBack }: LeadDetailScreenProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const getStatusColor = (status: string) => {

        switch (status?.toLowerCase()) {
            case 'lead':
                return 'bg-blue-100 text-blue-600';
            case 'interested':
                return 'bg-green-100 text-green-600';
            case 'converted':
                return 'bg-purple-100 text-purple-600';
            case 'do not contact':
                return 'bg-red-100 text-red-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const renderDetailRow = (icon: keyof typeof Ionicons.glyphMap, label: string, value?: string, isHighlighted: boolean = false) => {
        if (!value) return null;
        return (
            <View style={{'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'space-between', 'paddingVertical': 16, 'borderBottomWidth': 1}}>
                <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
                    <View >
                        <Ionicons name={icon} size={16} color={isHighlighted ? "#2563EB" : "#6B7280"} />
                    </View>
                    <Text style={{'color': theme.secondary, 'fontWeight': '500', 'fontSize': 16}}>{label}</Text>
                </View>
                <Text >{value}</Text>
            </View>
        );
    };

    const fullName = lead.lead_name || `${lead.salutation || ''} ${lead.first_name || ''} ${lead.middle_name || ''} ${lead.last_name || ''}`.replace(/\s+/g, ' ').trim();

    return (
        <View style={{'flex': 1}}>
            {/* Header */}
            <View style={{'backgroundColor': theme.background, 'paddingBottom': 24, 'paddingHorizontal': 24, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2, 'borderBottomWidth': 1}}>
                <View style={{'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'space-between'}}>
                    <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
                        <TouchableOpacity onPress={onBack} style={{'marginRight': 16, 'padding': 8, 'backgroundColor': theme.card, 'borderRadius': 9999}}>
                            <Ionicons name="arrow-back" size={20} color="#1F2937" />
                        </TouchableOpacity>
                        <View>
                            <Text style={{'fontSize': 14, 'fontWeight': '600', 'color': theme.secondary, 'marginBottom': 4}}>Lead Details</Text>
                            <Text style={{'fontSize': 24, 'fontWeight': 'bold'}}>{lead.name}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView style={{'flex': 1}} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                {/* Main Identity Card */}
                <View style={{'backgroundColor': theme.background, 'borderRadius': 24, 'padding': 24, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2, 'borderWidth': 1, 'marginBottom': 24}}>
                    <View style={{'alignItems': 'center', 'marginBottom': 24}}>
                        <View style={{'width': 80, 'height': 80, 'borderRadius': 9999, 'alignItems': 'center', 'justifyContent': 'center', 'marginBottom': 16}}>
                            <Text style={{'fontSize': 30, 'fontWeight': 'bold', 'color': theme.primary}}>
                                {lead.first_name?.charAt(0) || lead.lead_name?.charAt(0) || 'L'}
                            </Text>
                        </View>
                        <Text style={{'fontSize': 24, 'fontWeight': 'bold', 'textAlign': 'center'}}>{fullName}</Text>
                        <Text style={{'color': theme.primary, 'fontWeight': '600', 'marginTop': 4}}>{lead.job_title || lead.customer || 'No Job Title Provided'}</Text>
                        <View >
                            <Text style={{'fontSize': 12, 'fontWeight': 'bold'}}>{lead.status || 'Unknown Status'}</Text>
                        </View>
                    </View>
                </View>

                {/* Lead Specifications */}
                <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'marginBottom': 16, 'paddingHorizontal': 8}}>Lead Information</Text>
                <View style={{'backgroundColor': theme.background, 'borderRadius': 24, 'padding': 24, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2, 'borderWidth': 1, 'marginBottom': 24}}>
                    {renderDetailRow("person-outline", "Owner", lead.lead_owner, true)}
                    {renderDetailRow("male-female-outline", "Gender", lead.gender)}
                    {renderDetailRow("megaphone-outline", "Source", lead.source)}
                    {renderDetailRow("business-outline", "Customer", lead.customer)}
                </View>

                {/* Requirements / Type Information */}
                {(lead.type || lead.request_type) && (
                    <>
                        <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'marginBottom': 16, 'paddingHorizontal': 8}}>Requirements</Text>
                        <View style={{'backgroundColor': theme.background, 'borderRadius': 24, 'padding': 24, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2, 'borderWidth': 1, 'marginBottom': 24}}>
                            {renderDetailRow("briefcase-outline", "Type", lead.type)}
                            {renderDetailRow("document-text-outline", "Request Type", lead.request_type)}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}
