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
import { apiService } from '../services/api';

interface PettyExpense {
  expense_account: string;
  payment_account: string;
  docstatus: number;
  description: string | null;
  name: string;
  amended_from: string | null;
  journal_entry: string | null;
  creation: string;
  supplier_name: string | null;
  idx: number;
  company: string;
  cost_center: string;
  supplier: string | null;
  date: string;
  amount: number;
  modified_by: string;
  owner: string;
  modified: string;
  mode_of_payment: string;
  amount_in_currency: string;
}

interface PettyExpenseScreenProps {
  onBack: () => void;
}

export default function PettyExpenseScreen({ onBack }: PettyExpenseScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pettyExpenses, setPettyExpenses] = useState<PettyExpense[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPettyExpenses();
  }, []);

  const fetchPettyExpenses = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const response = await apiService.getPettyExpenseList();

      if (response && response.data && Array.isArray(response.data)) {
        const message = response.message || '';
        const isSuccess = message.toLowerCase().includes('success') || message.toLowerCase().includes('successfully');

        if (isSuccess) {
          setPettyExpenses(response.data);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      // Treat non-success or 500 as "no data"
      setPettyExpenses([]);
    } catch (err) {
      console.error('Error fetching petty expenses:', err);
      // Treat 500/Connection errors as "no data"
      setPettyExpenses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPettyExpenses();
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

  const getStatusConfig = (docstatus: number) => {
    switch (docstatus) {
      case 0: return { label: 'Draft', color: '#F59E0B', bg: '#F59E0B15', icon: 'pencil-outline' };
      case 1: return { label: 'Submitted', color: '#10B981', bg: '#10B98115', icon: 'checkmark-circle-outline' };
      case 2: return { label: 'Cancelled', color: '#EF4444', bg: '#EF444415', icon: 'close-circle-outline' };
      default: return { label: 'Unknown', color: theme.secondary, bg: theme.border + '30', icon: 'help-circle-outline' };
    }
  };

  const renderPettyExpenseCard = ({ item, index }: { item: PettyExpense, index: number }) => {
    const status = getStatusConfig(item.docstatus);

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <View style={styles.titleWrapper}>
              <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.cardSubtitle, { color: theme.secondary }]} numberOfLines={1}>{item.company}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Ionicons name={status.icon as any} size={12} color={status.color} />
              <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <View style={[styles.heroRow, { backgroundColor: theme.background }]}>
            <View style={styles.heroItem}>
              <Text style={[styles.heroLabel, { color: theme.secondary }]}>AMOUNT</Text>
              <View style={styles.heroValueRow}>
                <Ionicons name="cash-outline" size={18} color={theme.primary} />
                <Text style={[styles.heroValue, { color: theme.text }]}>{item.amount_in_currency}</Text>
              </View>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: theme.border + '30' }]} />
            <View style={styles.heroItem}>
              <Text style={[styles.heroLabel, { color: theme.secondary }]}>DATE</Text>
              <View style={styles.heroValueRow}>
                <Ionicons name="calendar-outline" size={18} color={theme.secondary} />
                <Text style={[styles.heroValue, { color: theme.text }]}>{formatDate(item.date)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <View style={[styles.miniIcon, { backgroundColor: theme.background }]}>
                <Ionicons name="card-outline" size={14} color={theme.secondary} />
              </View>
              <Text style={[styles.metaText, { color: theme.secondary }]}>{item.mode_of_payment}</Text>
            </View>
            <View style={styles.metaItem}>
              <View style={[styles.miniIcon, { backgroundColor: theme.background }]}>
                <Ionicons name="business-outline" size={14} color={theme.secondary} />
              </View>
              <Text style={[styles.metaText, { color: theme.secondary }]} numberOfLines={1}>{item.cost_center}</Text>
            </View>
          </View>

          {item.description && (
            <View style={[styles.descriptionBox, { backgroundColor: theme.background + '50' }]}>
              <Ionicons name="document-text-outline" size={14} color={theme.secondary} />
              <Text style={[styles.descriptionText, { color: theme.secondary }]} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          )}

          <View style={[styles.cardFooter, { borderTopColor: theme.border + '20' }]}>
            <View style={styles.footerCol}>
              <Text style={[styles.footerLabel, { color: theme.secondary }]}>EXPENSE ACCOUNT</Text>
              <Text style={[styles.footerValue, { color: theme.text }]} numberOfLines={1}>{item.expense_account}</Text>
            </View>
            <View style={styles.footerCol}>
              <Text style={[styles.footerLabel, { color: theme.secondary }]}>PAYMENT ACCOUNT</Text>
              <Text style={[styles.footerValue, { color: theme.text }]} numberOfLines={1}>{item.payment_account}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerArea}>
      <SafeAreaView>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.titleArea}>
            <Text style={[styles.navTitle, { color: theme.text }]}>Petty Expense</Text>
            <Text style={[styles.navSubtitle, { color: theme.secondary }]}>Corporate petty logs</Text>
          </View>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={22} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.summaryArea}>
        <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <View style={[styles.summaryIconBox, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="receipt-outline" size={28} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.summaryCount, { color: theme.text }]}>{pettyExpenses.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.secondary }]}>Total Entries Recorded</Text>
          </View>
        </View>
      </View>

      <View style={styles.listHeaderArea}>
        <Text style={[styles.listTitle, { color: theme.text }]}>Expense Log</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <FlatList
        data={pettyExpenses}
        renderItem={renderPettyExpenseCard}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
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
                <Ionicons name="receipt-outline" size={64} color={theme.border} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No records found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
                We couldn't find any petty expense entries at the moment.
              </Text>
            </Animated.View>
          ) : (
            <View style={styles.centerSection}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.secondary }]}>Syncing petty logs...</Text>
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
  },
  headerArea: {
    paddingBottom: 8,
  },
  navHeader: {
    paddingHorizontal: 16,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
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
  navTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  navSubtitle: {
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
  summaryArea: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  summaryIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryCount: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listHeaderArea: {
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
    paddingBottom: 100,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 24,
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
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  titleWrapper: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '600',
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
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },
  heroItem: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroValue: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroDivider: {
    width: 1,
    height: 36,
    marginHorizontal: 16,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  miniIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  descriptionBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  descriptionText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 20,
    gap: 16,
  },
  footerCol: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  footerValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  centerSection: {
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
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 100,
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
});
