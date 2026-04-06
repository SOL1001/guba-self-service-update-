import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Colors } from '../constants/Theme';
import { apiService } from '../services/api';

interface Employee {
  name: string;
  employee_name: string;
}

interface EmployeeListResponse {
  message: string;
  data: Employee[];
}

interface EmployeeListScreenProps {
  onBack: () => void;
}

export default function EmployeeListScreen({ onBack }: EmployeeListScreenProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const isDark = colorScheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);

      const response = await apiService.getEmployeeList() as EmployeeListResponse;
      const message = response.message || '';
      const isSuccess = message.toLowerCase().includes('success') || message.toLowerCase().includes('successfully');

      if (isSuccess && response.data && Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        setEmployees([]); // Treat 500/Connection error as empty state
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]); // Treat error as empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEmployees();
  };

  const filteredEmployees = employees.filter(employee => {
    const query = searchQuery.toLowerCase();
    return (
      (employee.name && employee.name.toLowerCase().includes(query)) ||
      (employee.employee_name && employee.employee_name.toLowerCase().includes(query))
    );
  });

  const renderEmployee = ({ item, index }: { item: Employee, index: number }) => {
    // Generate a consistent color based on the employee's name
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];
    const charCode = item.employee_name ? item.employee_name.charCodeAt(0) : 0;
    const avatarColor = colors[charCode % colors.length];
    const initials = item.employee_name
      ? item.employee_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : '?';

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <TouchableOpacity
          style={[styles.employeeCard, { backgroundColor: theme.card }]}
          activeOpacity={0.8}
        >
          <View style={[styles.avatarBox, { backgroundColor: avatarColor + '15' }]}>
            <Text style={[styles.avatarText, { color: avatarColor }]}>{initials}</Text>
          </View>

          <View style={styles.cardInfo}>
            <Text style={[styles.employeeName, { color: theme.text }]} numberOfLines={1}>
              {item.employee_name || 'Unknown Name'}
            </Text>
            <View style={styles.idRow}>
              <Ionicons name="id-card-outline" size={14} color={theme.secondary} />
              <Text style={[styles.employeeId, { color: theme.secondary }]}>
                ID: {item.name}
              </Text>
            </View>
          </View>

          <View style={[styles.actionBtn, { backgroundColor: theme.background }]}>
            <Ionicons name="chevron-forward" size={20} color={theme.primary} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <SafeAreaView style={{ backgroundColor: theme.card }}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleArea}>
            <Text style={[styles.headerSubtitle, { color: theme.secondary }]}>DIRECTORY</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Employees</Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: theme.primary + '15' }]}>
            <Text style={[styles.countText, { color: theme.primary }]}>{employees.length}</Text>
          </View>
        </View>

        <View style={[styles.searchWrapper, { backgroundColor: theme.background }]}>
          <Ionicons name="search" size={20} color={theme.secondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search by name or ID..."
            placeholderTextColor={theme.secondary + '80'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={theme.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <FlatList
        data={filteredEmployees}
        renderItem={renderEmployee}
        keyExtractor={(item, index) => item.name ? item.name : `emp-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <Animated.View entering={FadeIn} style={styles.emptyContainer}>
              <View style={[styles.emptyIconWrapper, { backgroundColor: theme.card }]}>
                <Ionicons name={searchQuery ? "search-outline" : "people-outline"} size={64} color={theme.border} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {searchQuery ? 'No match found' : 'No employees'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
                {searchQuery
                  ? `We couldn't find anyone matching "${searchQuery}".`
                  : 'The planetary directory is currently empty or syncing.'}
              </Text>
            </Animated.View>
          ) : (
            <View style={styles.centerSection}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.secondary }]}>Fetching directory...</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  headerContainer: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  } as ViewStyle,
  navHeader: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 0 : 10,
  } as ViewStyle,
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  headerTitleArea: {
    flex: 1,
    marginLeft: 12,
  } as ViewStyle,
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  } as TextStyle,
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: -2,
  } as TextStyle,
  countBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  } as ViewStyle,
  countText: {
    fontSize: 14,
    fontWeight: '900',
  } as TextStyle,
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    gap: 12,
  } as ViewStyle,
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    padding: 0,
  } as TextStyle,
  listContent: {
    paddingBottom: 100,
  } as ViewStyle,
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  } as ViewStyle,
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  } as ViewStyle,
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  } as TextStyle,
  cardInfo: {
    flex: 1,
    gap: 4,
  } as ViewStyle,
  employeeName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
  } as TextStyle,
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as ViewStyle,
  employeeId: {
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  } as ViewStyle,
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 100,
  } as ViewStyle,
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  } as ViewStyle,
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
  } as TextStyle,
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  } as TextStyle,
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
  } as ViewStyle,
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
  } as TextStyle,
});
