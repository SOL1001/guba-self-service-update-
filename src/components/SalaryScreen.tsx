import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Colors } from '../constants/Theme';
import { apiService, SalarySlip } from '../services/api';

interface SalaryScreenProps {
  onBack: () => void;
}

export default function SalaryScreen({ onBack }: SalaryScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([]);

  useEffect(() => {
    fetchSalarySlips();
  }, []);

  const fetchSalarySlips = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const response = await apiService.getSalarySlipList();

      if (response && response.data) {
        setSalarySlips(response.data);
      } else {
        setSalarySlips([]);
      }
    } catch (err) {
      console.error('Error fetching salary slips:', err);
      setSalarySlips([]); // Treat 500s/connection errors as no data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSalarySlips(true);
  };

  const formatCurrency = (amount: number, currency: string = 'ETB') => {
    if (amount === undefined || amount === null) return `${currency} 0.00`;
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
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

  const statusConfig: { [key: string]: { label: string; color: string; bg: string; icon: string } } = {
    submitted: { label: 'Submitted', color: '#3B82F6', bg: '#3B82F615', icon: 'send-outline' },
    paid: { label: 'Paid', color: '#10B981', bg: '#10B98115', icon: 'checkmark-circle-outline' },
    draft: { label: 'Draft', color: '#6B7280', bg: '#6B728015', icon: 'document-outline' },
    cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#EF444415', icon: 'close-circle-outline' },
    default: { label: 'Pending', color: '#F59E0B', bg: '#F59E0B15', icon: 'time-outline' }
  };

  const getStatusStyle = (status: string) => statusConfig[status.toLowerCase()] || statusConfig.default;

  const renderSalarySlipCard = ({ item, index }: { item: SalarySlip; index: number }) => {
    const { details } = item;
    const status = getStatusStyle(details.status);

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <View style={[styles.slipCard, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.monthYear, { color: theme.text }]}>{item.month_year}</Text>
              <Text style={[styles.slipId, { color: theme.secondary }]}>{item.salary_slip_id}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Ionicons name={status.icon as any} size={14} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <View style={styles.periodRow}>
            <View style={styles.dateInfo}>
              <Ionicons name="calendar-clear-outline" size={14} color={theme.secondary} />
              <Text style={[styles.periodText, { color: theme.secondary }]}>
                {formatDate(details.start_date)} - {formatDate(details.end_date)}
              </Text>
            </View>
          </View>

          <View style={[styles.financialSection, { backgroundColor: theme.background + '50' }]}>
            <View style={styles.heroAmountRow}>
              <View>
                <Text style={[styles.netPayLabel, { color: theme.secondary }]}>Net Pay</Text>
                <Text style={[styles.netPayValue, { color: theme.primary }]}>
                  {formatCurrency(details.net_pay, details.currency)}
                </Text>
              </View>
              <View style={[styles.heroIcon, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="wallet-outline" size={24} color={theme.primary} />
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border + '30' }]} />

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <View style={[styles.iconBox, { backgroundColor: '#10B98115' }]}>
                  <Ionicons name="add" size={14} color="#10B981" />
                </View>
                <View>
                  <Text style={[styles.detailLabel, { color: theme.secondary }]}>Gross Pay</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {formatCurrency(details.gross_pay, details.currency)}
                  </Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={[styles.iconBox, { backgroundColor: '#EF444415' }]}>
                  <Ionicons name="remove" size={14} color="#EF4444" />
                </View>
                <View>
                  <Text style={[styles.detailLabel, { color: theme.secondary }]}>Deductions</Text>
                  <Text style={[styles.detailValue, { color: '#EF4444' }]}>
                    {formatCurrency(details.total_deduction, details.currency)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {details.bank_name && (
            <View style={styles.bankSection}>
              <View style={[styles.bankIconWrapper, { backgroundColor: theme.background }]}>
                <Ionicons name="card-outline" size={16} color={theme.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bankLabel, { color: theme.secondary }]}>Payment Mode</Text>
                <Text style={[styles.bankText, { color: theme.text }]}>
                  {details.bank_name} • {details.bank_account_no}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderHeader = () => {
    const latestPay = salarySlips.length > 0 ? salarySlips[0].details.net_pay : 0;
    const currency = salarySlips.length > 0 ? salarySlips[0].details.currency : 'ETB';

    return (
      <View style={styles.headerArea}>
        <SafeAreaView>
          <View style={styles.navHeader}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={28} color={theme.primary} />
            </TouchableOpacity>
            <View style={styles.titleArea}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>My Salary</Text>
              <Text style={[styles.headerSubtitle, { color: theme.secondary }]}>{salarySlips.length} Payslips Available</Text>
            </View>
            <TouchableOpacity onPress={() => fetchSalarySlips()} style={styles.refreshBtn} activeOpacity={0.7}>
              <Ionicons name="refresh" size={22} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {salarySlips.length > 0 && (
            <View style={styles.heroSummary}>
              <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
                <View style={styles.summaryTop}>
                  <View style={[styles.summaryIcon, { backgroundColor: theme.primary + '15' }]}>
                    <Ionicons name="cash-outline" size={24} color={theme.primary} />
                  </View>
                  <View>
                    <Text style={[styles.summaryLabelTop, { color: theme.secondary }]}>Latest Net Pay</Text>
                    <Text style={[styles.summaryValueBig, { color: theme.text }]}>{formatCurrency(latestPay, currency)}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </SafeAreaView>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <FlatList
        data={salarySlips}
        renderItem={renderSalarySlipCard}
        keyExtractor={(item) => item.salary_slip_id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
                <Ionicons name="document-text-outline" size={64} color={theme.border} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No records found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
                Your salary slips will appear here once generated.
              </Text>
            </Animated.View>
          ) : null
        }
      />
      {loading && !refreshing && (
        <View style={styles.loaderArea}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loaderText, { color: theme.secondary }]}>Syncing payslips...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerArea: {
    paddingBottom: 8,
  },
  navHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleArea: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: -2,
  },
  refreshBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSummary: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  summaryCard: {
    padding: 24,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabelTop: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValueBig: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -1,
  },
  listContent: {
    paddingBottom: 40,
  },
  slipCard: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  monthYear: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  slipId: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  periodRow: {
    marginBottom: 20,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
  },
  financialSection: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  heroAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  netPayLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  netPayValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  bankSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
  },
  bankIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  bankText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  loaderArea: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
});

