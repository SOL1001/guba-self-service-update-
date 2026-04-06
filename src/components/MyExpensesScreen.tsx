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
import { apiService, Expense } from '../services/api';

interface MyExpensesScreenProps {
  onBack: () => void;
  onExpensePress?: (expense: Expense) => void;
  onNavigateToNewExpense?: () => void;
}

export default function MyExpensesScreen({ onBack, onExpensePress, onNavigateToNewExpense }: MyExpensesScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const response = await apiService.getExpenseClaims();

      if (response && response.message?.toLowerCase().includes('success')) {
        const allExpenses: Expense[] = [];
        if (response.data && typeof response.data === 'object') {
          Object.values(response.data).forEach((monthExpenses: any) => {
            if (Array.isArray(monthExpenses)) {
              allExpenses.push(...monthExpenses);
            }
          });
        }
        setExpenses(allExpenses);
      } else {
        // Treat 500/Connection errors as "no data"
        setExpenses([]);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      // Treat 500/Connection errors as "no data"
      setExpenses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  const getStatusConfig = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('approved')) return { color: '#10B981', bg: '#10B98115', icon: 'checkmark-circle-outline' };
    if (s.includes('pending')) return { color: '#F59E0B', bg: '#F59E0B15', icon: 'time-outline' };
    if (s.includes('rejected') || s.includes('cancelled')) return { color: '#EF4444', bg: '#EF444415', icon: 'close-circle-outline' };
    return { color: theme.secondary, bg: theme.border + '30', icon: 'document-outline' };
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

  const parseAmount = (amountString: string) => {
    if (!amountString) return 0;
    const cleanAmount = amountString.replace(/Br|ETB|[^0-9.]/g, '');
    return parseFloat(cleanAmount) || 0;
  };

  const totalClaimed = expenses.reduce((sum, expense) => sum + parseAmount(expense.total_claimed_amount), 0);

  const renderExpenseCard = ({ item, index }: { item: Expense, index: number }) => {
    const status = item.approval_status || item.status || 'Draft';
    const statusConfig = getStatusConfig(status);

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={() => onExpensePress?.(item)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: theme.primary + '10' }]}>
              <Ionicons name="receipt-outline" size={22} color={theme.primary} />
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
              <Text style={[styles.statusLabel, { color: statusConfig.color }]}>{status}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={[styles.expenseName, { color: theme.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={theme.secondary} />
                <Text style={[styles.metaText, { color: theme.secondary }]}>{formatDate(item.posting_date)}</Text>
              </View>
              <View style={[styles.dot, { backgroundColor: theme.border }]} />
              <View style={styles.metaItem}>
                <Ionicons name="pricetag-outline" size={14} color={theme.secondary} />
                <Text style={[styles.metaText, { color: theme.secondary }]} numberOfLines={1}>{item.expense_type}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.cardFooter, { borderTopColor: theme.border + '20' }]}>
            <View>
              <Text style={[styles.amountLabel, { color: theme.secondary }]}>TOTAL CLAIMED</Text>
              <Text style={[styles.amountValue, { color: theme.text }]}>{item.total_claimed_amount}</Text>
            </View>
            <View style={styles.itemsBadge}>
              <Text style={[styles.itemsCount, { color: theme.secondary }]}>{item.total_expenses || 1} items</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.secondary} />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerArea}>
      <SafeAreaView>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.titleArea}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>My Expenses</Text>
            <Text style={[styles.headerSubtitle, { color: theme.secondary }]}>Claim tracking & records</Text>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.heroSection}>
        <View style={[styles.bentoSummary, { backgroundColor: theme.primary }]}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>Total Claimed</Text>
              <Text style={styles.summaryValue}>ETB {totalClaimed.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryCount}>{expenses.length}</Text>
              <Text style={styles.summaryCountLabel}>Claims</Text>
            </View>
          </View>
          <View style={styles.summaryFooter}>
            <Ionicons name="shield-checkmark-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.summarySubtext}>Accumulated total from all claim records</Text>
          </View>
        </View>
      </View>

      <View style={styles.listSubhead}>
        <Text style={[styles.listTitle, { color: theme.text }]}>Recent Claims</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <FlatList
        data={expenses}
        renderItem={renderExpenseCard}
        keyExtractor={(item) => item.name}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
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
            <Animated.View entering={FadeIn} style={styles.emptyWrap}>
              <View style={[styles.emptyIconBox, { backgroundColor: theme.card }]}>
                <Ionicons name="receipt-outline" size={64} color={theme.border} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No records found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
                Your expense claims will appear here once submitted.
              </Text>
            </Animated.View>
          ) : (
            <View style={styles.centerLoader}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.secondary }]}>Syncing claims...</Text>
            </View>
          )
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={onNavigateToNewExpense}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
    marginLeft: 8,
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
  heroSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  bentoSummary: {
    padding: 24,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -1,
  },
  summaryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 60,
  },
  summaryCount: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  summaryCountLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  summarySubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginLeft: 8,
    fontWeight: '500',
  },
  listSubhead: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  listContent: {
    paddingBottom: 120,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardBody: {
    marginBottom: 20,
  },
  expenseName: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  itemsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemsCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyIconBox: {
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
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
  },
});
