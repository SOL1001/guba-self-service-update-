import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { Colors } from '../constants/Theme';
import { apiService } from '../services/api';

const { width } = Dimensions.get('window');

interface DashboardScreenProps {
  onBack: () => void;
}

interface LatestExpense {
  status: string;
  date: string;
  expense_type: string;
  description: string;
  amount: string;
  name: string;
  total_expenses: number;
}

interface LatestSalarySlip {
  name: string;
  month_year: string;
  posting_date: string;
  amount: string;
  total_working_days: number;
}

interface DashboardData {
  notice_board: any[];
  leave_balance: any[];
  latest_leave: any;
  latest_expense: LatestExpense | null;
  latest_salary_slip: LatestSalarySlip | null;
  stop_location_validate: number;
  last_log_type: string;
  version: string;
  update_version_forcefully: number;
  company: string;
  last_log_time: string;
  check_in_with_image: number;
  check_in_with_location: number;
  quick_task: number;
  allow_odometer_reading_input: number;
  approval_requests: string;
  gender: string;
  capture_location_for_quotation: number;
  capture_location_for_sales_order: number;
  out_of_location_checkout: number;
  enable_project_and_task_in_expense_claim: number;
  notification_count: number;
  role_based_menu_visibility: number;
  enable_todo: number;
  employee_image: string | null;
  employee_name: string;
}

export default function DashboardScreen({ onBack }: DashboardScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getDashboard();

      if (response && response.data) {
        const message = response.message || '';
        const isSuccess = message.toLowerCase().includes('success') || message.toLowerCase().includes('successfully');

        if (isSuccess) {
          setDashboardData(response.data);
          setError(null);
          setLoading(false);
          return;
        }
      }

      // Treat non-success or 500 as "no data"
      setDashboardData(null);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      // Treat 500/Connection errors as "no data"
      setDashboardData(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('/')) {
      const baseUrl = apiService.getBaseUrl();
      if (baseUrl) {
        return `${baseUrl}${imagePath}`;
      }
    }
    return imagePath;
  };

  if (loading && !dashboardData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.secondary }]}>Preparing your workspace...</Text>
      </View>
    );
  }

  if (error || !dashboardData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Dashboard</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color={theme.error} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>Oops!</Text>
          <Text style={[styles.errorSubtitle, { color: theme.secondary }]}>{error || 'Something went wrong while loading your dashboard.'}</Text>
          <TouchableOpacity
            onPress={fetchDashboard}
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const imageUrl = getImageUrl(dashboardData.employee_image);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Dynamic Header */}
      <View
        style={[styles.header, { borderBottomColor: theme.border }]}
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Dashboard Overview</Text>
          <Text style={[styles.headerSubtitle, { color: theme.secondary }]}>Welcome back, {dashboardData.employee_name.split(' ')[0]}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={theme.icon} />
          {dashboardData.notification_count > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.error }]}>
              <Text style={styles.badgeText}>{dashboardData.notification_count}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <View
          style={[styles.profileCard, { backgroundColor: theme.card, shadowColor: isDark ? '#000' : theme.primary }]}
        >
          <View style={styles.profileRow}>
            <View style={styles.imageContainer}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary + '15' }]}>
                  <Ionicons name="person" size={36} color={theme.primary} />
                </View>
              )}
              <View style={[styles.statusIndicator, { backgroundColor: theme.success }]} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: theme.text }]}>{dashboardData.employee_name}</Text>
              <Text style={[styles.userCompany, { color: theme.secondary }]}>{dashboardData.company}</Text>
              <View style={styles.genderTag}>
                <Ionicons name={dashboardData.gender === 'Female' ? 'woman' : 'man'} size={14} color={theme.primary} />
                <Text style={[styles.genderText, { color: theme.primary }]}>{dashboardData.gender}</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.primary + '10' }]}>
              <Ionicons name="settings-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Bento Dashboard */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activities</Text>
        </View>

        <View style={styles.bentoGrid}>
          {/* Latest Expense */}
          {dashboardData.latest_expense && (
            <View
              style={[styles.expenseCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: '#F59E0B20' }]}>
                  <Ionicons name="receipt-outline" size={22} color="#F59E0B" />
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#F59E0B15' }]}>
                  <Text style={[styles.statusBadgeText, { color: '#F59E0B' }]}>{dashboardData.latest_expense.status}</Text>
                </View>
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Latest Expense</Text>
              <Text style={[styles.cardValue, { color: theme.primary }]}>{dashboardData.latest_expense.amount}</Text>
              <Text style={[styles.cardLabel, { color: theme.secondary }]} numberOfLines={1}>
                {dashboardData.latest_expense.expense_type}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardDate, { color: theme.secondary }]}>{dashboardData.latest_expense.date}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.secondary} />
              </View>
            </View>
          )}

          {/* Latest Salary */}
          {dashboardData.latest_salary_slip && (
            <View
              style={[styles.salaryCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: '#10B98120' }]}>
                  <Ionicons name="wallet-outline" size={22} color="#10B981" />
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Salary Slip</Text>
              <Text style={[styles.cardValue, { color: theme.text }]}>{dashboardData.latest_salary_slip.amount}</Text>
              <Text style={[styles.cardLabel, { color: theme.secondary }]}>{dashboardData.latest_salary_slip.month_year}</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardDate, { color: theme.secondary }]}>{dashboardData.latest_salary_slip.posting_date}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.secondary} />
              </View>
            </View>
          )}
        </View>

        {/* System & Stats Section */}
        <View
          style={[styles.infoSection, { backgroundColor: theme.card }]}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitleSmall, { color: theme.text }]}>System Performance</Text>
            <View style={styles.versionBadge}>
              <Text style={[styles.versionText, { color: theme.secondary }]}>v{dashboardData.version}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={[styles.infoLabel, { color: theme.secondary }]}>Last Log</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{dashboardData.last_log_type || 'None'}</Text>
              <Text style={[styles.infoSubtext, { color: theme.secondary }]}>{dashboardData.last_log_time || '--:--'}</Text>
            </View>
            <View style={[styles.infoBox, { borderLeftWidth: 1, borderLeftColor: theme.border }]}>
              <Text style={[styles.infoLabel, { color: theme.secondary }]}>Approvals</Text>
              <Text style={[styles.infoValue, { color: theme.primary }]}>{dashboardData.approval_requests}</Text>
              <Text style={[styles.infoSubtext, { color: theme.secondary }]}>Pending tasks</Text>
            </View>
          </View>
        </View>

        {/* Feature Switches */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Service Preferences</Text>
        </View>

        <View
          style={[styles.featuresCard, { backgroundColor: theme.card }]}
        >
          {[
            { label: 'Todo List', enabled: !!dashboardData.enable_todo, icon: 'list-circle' },
            { label: 'Quick Task Entry', enabled: !!dashboardData.quick_task, icon: 'flash' },
            { label: 'Bio-Metric Check-in', enabled: !!dashboardData.check_in_with_image, icon: 'camera' },
            { label: 'GPS Location Tracking', enabled: !!dashboardData.check_in_with_location, icon: 'location' }
          ].map((item, index) => (
            <View
              key={index}
              style={[
                styles.featureRow,
                { borderBottomColor: theme.border, borderBottomWidth: index === 3 ? 0 : 1 }
              ]}
            >
              <View style={styles.featureLeft}>
                <View style={[styles.featureIcon, { backgroundColor: item.enabled ? theme.primary + '10' : theme.secondary + '10' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.enabled ? theme.primary : theme.secondary} />
                </View>
                <Text style={[styles.featureLabel, { color: theme.text }]}>{item.label}</Text>
              </View>
              <View style={[styles.toggleIndicator, { backgroundColor: item.enabled ? theme.success : theme.border }]}>
                <View style={[styles.toggleCircle, { marginLeft: item.enabled ? 16 : 2 }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  header: {
    height: Platform.OS === 'ios' ? 110 : 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  profileCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userCompany: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  genderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  genderText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
    textTransform: 'uppercase',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  bentoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  expenseCard: {
    width: (width - 50) / 2,
    padding: 16,
    borderRadius: 20,
    elevation: 2,
  },
  salaryCard: {
    width: (width - 50) / 2,
    padding: 16,
    borderRadius: 20,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '800',
    marginVertical: 4,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 10,
  },
  cardDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  infoSection: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleSmall: {
    fontSize: 15,
    fontWeight: '700',
  },
  versionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  versionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    paddingTop: 5,
  },
  infoBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoSubtext: {
    fontSize: 11,
    fontWeight: '500',
  },
  featuresCard: {
    padding: 10,
    borderRadius: 24,
    marginBottom: 30,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 10,
  },
  featureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleIndicator: {
    width: 36,
    height: 18,
    borderRadius: 10,
    justifyContent: 'center',
  },
  toggleCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
  },
  footerSpacer: {
    height: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 20,
  },
  errorSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

