import { Colors } from '../constants/Theme';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  StatusBar,
  TextInput,
  useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';

interface Customer {
  name: string;
  customer_name: string;
  phone: string | null;
}

interface CustomerListResponse {
  message: string;
  data: Customer[];
}

interface CustomerListScreenProps {
  onBack: () => void;
}

export default function CustomerListScreen({ onBack }: CustomerListScreenProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCustomerList() as CustomerListResponse;
      
      console.log('Customer List API Response:', JSON.stringify(response, null, 2));
      
      const message = response.message || '';
      const isSuccess = message.toLowerCase().includes('success') || message.toLowerCase().includes('successfully');
      
      if (isSuccess && response.data && Array.isArray(response.data)) {
        setCustomers(response.data);
      } else {
        setError(response.message || 'Failed to fetch customers');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.customer_name.toLowerCase().includes(query) ||
      (customer.phone && customer.phone.toLowerCase().includes(query))
    );
  });

  const renderCustomer = ({ item }: { item: Customer }) => (
    <View style={{'backgroundColor': theme.background, 'borderRadius': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2, 'padding': 16, 'marginBottom': 12, 'borderWidth': 1}}>
      <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
        <View style={{'width': 48, 'height': 48, 'borderRadius': 9999, 'alignItems': 'center', 'justifyContent': 'center', 'marginRight': 16}}>
          <Ionicons name="business" size={24} color="#10B981" />
        </View>
        <View style={{'flex': 1}}>
          <Text style={{'fontSize': 16, 'fontWeight': '600', 'color': theme.text, 'marginBottom': 4}}>
            {item.customer_name}
          </Text>
          <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
            <Text style={{'fontSize': 14, 'color': theme.secondary, 'marginRight': 12}}>
              {item.name}
            </Text>
            {item.phone && (
              <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
                <Ionicons name="call-outline" size={14} color="#6B7280" />
                <Text style={{'fontSize': 14, 'color': theme.secondary, 'marginLeft': 4}}>
                  {item.phone}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{'flex': 1, 'backgroundColor': theme.card}}>
        <StatusBar barStyle="dark-content" />
        {/* Header */}
        <View style={{'backgroundColor': theme.background, 'borderBottomWidth': 1, 'borderColor': theme.border, 'paddingTop': 48, 'paddingBottom': 16, 'paddingHorizontal': 16}}>
          <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
            <TouchableOpacity
              onPress={onBack}
              style={{'marginRight': 16, 'padding': 8}}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={{'fontSize': 24, 'fontWeight': 'bold', 'color': theme.text}}>Customers</Text>
          </View>
        </View>

        <View style={{'flex': 1, 'alignItems': 'center', 'justifyContent': 'center'}}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={{'color': theme.secondary, 'marginTop': 16}}>Loading customers...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{'flex': 1, 'backgroundColor': theme.card}}>
        <StatusBar barStyle="dark-content" />
        {/* Header */}
        <View style={{'backgroundColor': theme.background, 'borderBottomWidth': 1, 'borderColor': theme.border, 'paddingTop': 48, 'paddingBottom': 16, 'paddingHorizontal': 16}}>
          <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
            <TouchableOpacity
              onPress={onBack}
              style={{'marginRight': 16, 'padding': 8}}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={{'fontSize': 24, 'fontWeight': 'bold', 'color': theme.text}}>Customers</Text>
          </View>
        </View>

        <View style={{'flex': 1, 'alignItems': 'center', 'justifyContent': 'center', 'paddingHorizontal': 16}}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={{'fontSize': 18, 'fontWeight': '600', 'color': theme.text, 'marginTop': 16, 'textAlign': 'center'}}>
            Error Loading Customers
          </Text>
          <Text style={{'color': theme.secondary, 'marginTop': 8, 'textAlign': 'center'}}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchCustomers}
            style={{'paddingHorizontal': 24, 'paddingVertical': 12, 'borderRadius': 12, 'marginTop': 24}}
            activeOpacity={0.8}
          >
            <Text style={{'color': '#fff', 'fontWeight': '600'}}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{'flex': 1, 'backgroundColor': theme.card}}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={{'backgroundColor': theme.background, 'borderBottomWidth': 1, 'borderColor': theme.border, 'paddingTop': 48, 'paddingBottom': 16, 'paddingHorizontal': 16}}>
        <View style={{'flexDirection': 'row', 'alignItems': 'center', 'marginBottom': 16}}>
          <TouchableOpacity
            onPress={onBack}
            style={{'marginRight': 16, 'padding': 8}}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={{'fontSize': 24, 'fontWeight': 'bold', 'color': theme.text}}>Customers</Text>
        </View>

        {/* Search Bar */}
        <View style={{'flexDirection': 'row', 'alignItems': 'center', 'backgroundColor': theme.card, 'borderRadius': 12, 'paddingHorizontal': 16, 'paddingVertical': 12}}>
          <Ionicons name="search" size={20} color="#6B7280" style={{ marginRight: 12 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search customers..."
            placeholderTextColor="#9CA3AF"
            style={{'flex': 1, 'fontSize': 16}}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={{'marginLeft': 8}}
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Customer List */}
      <View style={{'flex': 1, 'paddingHorizontal': 16, 'paddingTop': 16}}>
        {filteredCustomers.length === 0 ? (
          <View style={{'flex': 1, 'alignItems': 'center', 'justifyContent': 'center'}}>
            <Ionicons name="business-outline" size={64} color="#9CA3AF" />
            <Text style={{'fontSize': 18, 'fontWeight': '600', 'color': theme.text, 'marginTop': 16}}>
              {searchQuery ? 'No customers found' : 'No customers'}
            </Text>
            <Text style={{'color': theme.secondary, 'marginTop': 8, 'textAlign': 'center'}}>
              {searchQuery
                ? 'Try adjusting your search query'
                : 'No customers available at the moment'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredCustomers}
            renderItem={renderCustomer}
            keyExtractor={(item) => item.name}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListHeaderComponent={
              <View style={{'marginBottom': 8}}>
                <Text style={{'fontSize': 14, 'color': theme.secondary}}>
                  {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}






