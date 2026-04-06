import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Colors } from '../constants/Theme';
import { apiService } from '../services/api';

interface PaymentEntry {
  name: string;
  posting_date: string;
  mode_of_payment: string | null;
  party: string;
  party_name: string;
  paid_amount: number;
  payment_type: string;
  status: string;
  paid_amount_in_currency: string;
}

interface Party {
  name: string;
  party_name: string;
  phone: string | null;
}

interface PaymentScreenProps {
  onBack: () => void;
  onPaymentPress?: (payment: PaymentEntry) => void;
}

export default function PaymentScreen({ onBack, onPaymentPress }: PaymentScreenProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const isDark = colorScheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterParty, setFilterParty] = useState<string>('');
  const [parties, setParties] = useState<Party[]>([]);
  const [loadingParties, setLoadingParties] = useState(true);

  const statusOptions = ['Submitted', 'Draft', 'Cancelled', ''];

  useEffect(() => {
    fetchPayments();
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      setLoadingParties(true);
      const response = await apiService.getPaymentParties();
      if (response && response.data && Array.isArray(response.data)) {
        const isSuccess = (response.message || '').toLowerCase().includes('success');
        if (isSuccess) setParties(response.data);
      }
    } catch (err) {
      console.error('Error fetching parties:', err);
    } finally {
      setLoadingParties(false);
    }
  };

  const fetchPayments = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);

      const filters: { status?: string; party?: string } = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterParty.trim()) filters.party = filterParty.trim();

      const payload = { start: 0, page_length: 20, filters: filters };
      const response = await apiService.getPaymentEntryList(payload);

      if (response && response.data && Array.isArray(response.data)) {
        const isSuccess = (response.message || '').toLowerCase().includes('success');
        if (isSuccess) {
          setPayments(response.data);
        } else {
          setPayments([]); // Treat 500/Connection error as "no data"
        }
      } else {
        setPayments([]); // Treat 500/Connection error as "no data"
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setPayments([]); // Treat 500/Connection error as "no data"
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);
    fetchPayments();
  };

  const handleClearFilters = () => {
    setFilterStatus('');
    setFilterParty('');
    setShowFilterModal(false);
    fetchPayments();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    let config = { icon: 'checkmark-circle' as any, color: '#10B981' };

    if (s === 'draft') config = { icon: 'document-text', color: '#F59E0B' };
    if (s === 'cancelled') config = { icon: 'close-circle', color: '#EF4444' };

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color + '15' }]}>
        <Ionicons name={config.icon} size={12} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>{status}</Text>
      </View>
    );
  };

  const renderPaymentCard = ({ item, index }: { item: PaymentEntry, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <TouchableOpacity
        style={[styles.paymentCard, { backgroundColor: theme.card }]}
        onPress={() => onPaymentPress?.(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeIconBox, { backgroundColor: item.payment_type === 'Receive' ? '#10B98115' : '#EF444415' }]}>
            <Ionicons
              name={item.payment_type === 'Receive' ? 'arrow-down-circle' : 'arrow-up-circle'}
              size={24}
              color={item.payment_type === 'Receive' ? '#10B981' : '#EF4444'}
            />
          </View>
          <View style={styles.headerMain}>
            <Text style={[styles.paymentId, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.partyName, { color: theme.secondary }]} numberOfLines={1}>
              {item.party_name || item.party}
            </Text>
          </View>
          {getStatusBadge(item.status)}
        </View>

        <View style={[styles.metadataContainer, { backgroundColor: theme.background }]}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <View style={[styles.metaIcon, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="calendar-outline" size={14} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.metaLabel, { color: theme.secondary }]}>POSTING DATE</Text>
                <Text style={[styles.metaValue, { color: theme.text }]}>{formatDate(item.posting_date)}</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <View style={[styles.metaIcon, { backgroundColor: '#3B82F615' }]}>
                <Ionicons name="card-outline" size={14} color="#3B82F6" />
              </View>
              <View>
                <Text style={[styles.metaLabel, { color: theme.secondary }]}>PAYMENT MODE</Text>
                <Text style={[styles.metaValue, { color: theme.text }]} numberOfLines={1}>
                  {item.mode_of_payment || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.amountRow, { borderTopColor: theme.border + '15' }]}>
            <View style={styles.amountBox}>
              <Text style={[styles.amountLabel, { color: theme.secondary }]}>LOCAL AMOUNT</Text>
              <Text style={[styles.amountValue, { color: theme.text }]}>ETB {item.paid_amount.toFixed(2)}</Text>
            </View>
            <View style={[styles.amountBox, { alignItems: 'flex-end' }]}>
              <Text style={[styles.amountLabel, { color: theme.secondary }]}>TOTAL IN CURRENCY</Text>
              <Text style={[styles.heroAmount, { color: theme.primary }]}>{item.paid_amount_in_currency}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: theme.border + '15' }]}>
          <Text style={[styles.footerText, { color: theme.secondary }]}>Referenced Party: <Text style={{ color: theme.text, fontWeight: '700' }}>{item.party}</Text></Text>
          <Ionicons name="chevron-forward" size={16} color={theme.secondary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <SafeAreaView>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleArea}>
            <Text style={[styles.headerSubtitle, { color: theme.secondary }]}>FINANCIALS</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Payment Explorer</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            style={[styles.filterBtn, { backgroundColor: theme.card }]}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={22} color={theme.primary} />
            {(filterStatus || filterParty) && <View style={[styles.filterDot, { backgroundColor: theme.primary }]} />}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.bentoStats}>
        <View style={[styles.statCard, { backgroundColor: theme.card, flex: 1 }]}>
          <View style={[styles.statIconBox, { backgroundColor: '#10B98115' }]}>
            <Ionicons name="receipt-outline" size={22} color="#10B981" />
          </View>
          <View>
            <Text style={[styles.statValue, { color: theme.text }]}>{payments.length}</Text>
            <Text style={[styles.statLabel, { color: theme.secondary }]}>Transactions</Text>
          </View>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card, flex: 1.2 }]}>
          <View style={[styles.statIconBox, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="analytics-outline" size={22} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.statValue, { color: theme.text }]}>Active</Text>
            <Text style={[styles.statLabel, { color: theme.secondary }]}>Filter: {filterStatus || 'All'}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <FlatList
        data={payments}
        renderItem={renderPaymentCard}
        keyExtractor={(item) => item.name}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
                <Ionicons name="wallet-outline" size={64} color={theme.border} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No payments found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
                Try adjusting your filters or sync your records.
              </Text>
              <TouchableOpacity
                onPress={handleClearFilters}
                style={[styles.clearBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.clearBtnText}>Reset All Filters</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View style={styles.centerSection}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.secondary }]}>Analyzing ledger...</Text>
            </View>
          )
        }
      />

      {/* Modern Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <Animated.View entering={FadeInDown} style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Filter Ledger</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close-circle" size={28} color={theme.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.filterSection}>
                <Text style={[styles.sectionLabel, { color: theme.secondary }]}>TRANSACTION STATUS</Text>
                <View style={styles.chipRow}>
                  {statusOptions.map((status) => (
                    <TouchableOpacity
                      key={status || 'All'}
                      onPress={() => setFilterStatus(status)}
                      style={[
                        styles.filterChip,
                        { backgroundColor: theme.background },
                        filterStatus === status && { backgroundColor: theme.primary }
                      ]}
                    >
                      <Text style={[
                        styles.chipText,
                        { color: theme.secondary },
                        filterStatus === status && { color: 'white' }
                      ]}>
                        {status || 'All Statuses'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={[styles.sectionLabel, { color: theme.secondary }]}>SEARCH PARTY</Text>
                <View style={[styles.searchWrapper, { backgroundColor: theme.background }]}>
                  <Ionicons name="search" size={20} color={theme.secondary} />
                  <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Enter party name..."
                    placeholderTextColor={theme.secondary + '80'}
                    value={filterParty}
                    onChangeText={setFilterParty}
                  />
                  {filterParty.length > 0 && (
                    <TouchableOpacity onPress={() => setFilterParty('')}>
                      <Ionicons name="close-circle" size={18} color={theme.secondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {parties.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={[styles.sectionLabel, { color: theme.secondary }]}>SUGGESTED PARTIES</Text>
                  <View style={styles.chipRow}>
                    {parties.slice(0, 10).map((party) => (
                      <TouchableOpacity
                        key={party.name}
                        onPress={() => setFilterParty(party.name)}
                        style={[
                          styles.filterChip,
                          { backgroundColor: theme.background },
                          filterParty === party.name && { backgroundColor: theme.primary }
                        ]}
                      >
                        <Text style={[
                          styles.chipText,
                          { color: theme.secondary },
                          filterParty === party.name && { color: 'white' }
                        ]}>
                          {party.party_name || party.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={handleClearFilters}
                style={[styles.modalSecondaryBtn, { borderColor: theme.border }]}
              >
                <Text style={[styles.btnText, { color: theme.secondary }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApplyFilters}
                style={[styles.modalPrimaryBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={[styles.btnText, { color: 'white' }]}>Apply Changes</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingBottom: 8,
  },
  navHeader: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 0 : 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleArea: {
    flex: 1,
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: -2,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filterDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  bentoStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  statCard: {
    padding: 20,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: -2,
  },
  listContent: {
    paddingBottom: 100,
  },
  paymentCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 24,
    borderRadius: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  typeIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerMain: {
    flex: 1,
  },
  paymentId: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  partyName: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metadataContainer: {
    padding: 20,
    borderRadius: 24,
    gap: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  amountRow: {
    paddingTop: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountBox: {
    gap: 2,
  },
  amountLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroAmount: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 120,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  clearBtn: {
    marginTop: 32,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
  },
  clearBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 36,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    padding: 0,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalSecondaryBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  modalPrimaryBtn: {
    flex: 2,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
