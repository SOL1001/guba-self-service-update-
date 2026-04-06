import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { Colors } from '../constants/Theme';
import { apiService, ExpenseDetail, ExpenseDetailItem } from '../services/api';

interface ExpenseDetailScreenProps {
  expenseId: string;
  onBack: () => void;
}

export default function ExpenseDetailScreen({ expenseId, onBack }: ExpenseDetailScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(true);
  const [expenseDetail, setExpenseDetail] = useState<ExpenseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExpenseDetail();
  }, [expenseId]);

  const fetchExpenseDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getExpenseDetail(expenseId);

      if (response.message?.toLowerCase().includes('success')) {
        setExpenseDetail(response.data);
      } else {
        setError(response.message || 'Failed to fetch expense details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expense details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const s = status?.toLowerCase() || '';
    switch (s) {
      case 'approved':
        return { color: '#10B981', bg: isDark ? '#10B98120' : '#10B98115', icon: 'checkmark-circle' };
      case 'pending':
        return { color: '#F59E0B', bg: isDark ? '#F59E0B20' : '#F59E0B15', icon: 'time' };
      case 'draft':
        return { color: '#6B7280', bg: isDark ? '#374151' : '#F3F4F6', icon: 'create' };
      case 'rejected':
      case 'cancelled':
        return { color: '#EF4444', bg: isDark ? '#EF444420' : '#EF444415', icon: 'close-circle' };
      default:
        return { color: theme.primary, bg: theme.primary + '15', icon: 'receipt' };
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    try {
      if (!dateString) return '--';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString || '--';
    }
  };

  const InfoRow = ({ label, value, icon, last = false }: { label: string; value: string | null | undefined; icon: string; last?: boolean }) => (
    <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
      <View style={[styles.infoIconWrapper, { backgroundColor: theme.primary + '10' }]}>
        <Ionicons name={icon as any} size={18} color={theme.primary} />
      </View>
      <View style={styles.infoTextWrapper}>
        <Text style={[styles.infoLabel, { color: theme.secondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{value || '--'}</Text>
      </View>
    </View>
  );

  const FinancialRow = ({ label, value, isBold = false, color }: { label: string; value: string | number; isBold?: boolean; color?: string }) => (
    <View style={styles.financialRow}>
      <Text style={[styles.financialLabel, { color: theme.secondary }]}>{label}</Text>
      <Text style={[
        styles.financialValue,
        { color: color || theme.text },
        isBold && { fontWeight: '700', fontSize: 16 }
      ]}>
        {typeof value === 'number' ? `Br ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : value}
      </Text>
    </View>
  );

  const renderExpenseItem = (item: ExpenseDetailItem, index: number) => {
    return (
      <View key={item.name || index} style={[styles.itemCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.itemHeader}>
          <View style={[styles.itemIcon, { backgroundColor: theme.primary + '08' }]}>
            <Ionicons name="receipt-outline" size={20} color={theme.primary} />
          </View>
          <View style={styles.itemTitleWrapper}>
            <Text style={[styles.itemType, { color: theme.text }]}>{item.expense_type}</Text>
            <Text style={[styles.itemDate, { color: theme.secondary }]}>{formatDate(item.expense_date)}</Text>
          </View>
          <Text style={[styles.itemAmount, { color: theme.primary }]}>{item.amount_in_currency}</Text>
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.itemDetailCol}>
            <Text style={[styles.itemDetailLabel, { color: theme.secondary }]}>Sanctioned</Text>
            <Text style={[styles.itemDetailValue, { color: theme.text }]}>{item.section_amount_in_currency}</Text>
          </View>
          {item.cost_center && (
            <View style={styles.itemDetailCol}>
              <Text style={[styles.itemDetailLabel, { color: theme.secondary }]}>Cost Center</Text>
              <Text style={[styles.itemDetailValue, { color: theme.text }]} numberOfLines={1}>{item.cost_center}</Text>
            </View>
          )}
        </View>

        {item.description && (
          <View style={[styles.itemDescription, { borderTopColor: theme.border }]}>
            <Ionicons name="chatbubble-outline" size={14} color={theme.secondary} style={{ marginRight: 6 }} />
            <Text style={[styles.descriptionText, { color: theme.secondary }]}>{item.description}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.secondary }]}>Loading details...</Text>
      </View>
    );
  }

  if (error || !expenseDetail) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.text }]}>{error || 'Failed to load details'}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={fetchExpenseDetail}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = expenseDetail.approval_status || expenseDetail.status || 'Draft';
  const statusConfig = getStatusConfig(status);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Claim Record</Text>
          <Text style={[styles.headerSubtitle, { color: theme.secondary }]}>{expenseDetail.name}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={[styles.heroCard, { backgroundColor: theme.primary }]}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroLabel}>Total Claimed Amount</Text>
              <Text style={styles.heroValue}>{expenseDetail.total_claimed_amount}</Text>
            </View>
            <View style={[styles.heroStatusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name={statusConfig.icon as any} size={14} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.heroStatusText}>{status}</Text>
            </View>
          </View>
          <View style={styles.heroFooter}>
            <View style={styles.heroInfoItem}>
              <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroInfoText}>{formatDate(expenseDetail.posting_date)}</Text>
            </View>
            <View style={styles.heroInfoItem}>
              <Ionicons name="person-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroInfoText} numberOfLines={1}>{expenseDetail.employee_name}</Text>
            </View>
          </View>
        </View>

        {/* Basic Information Bento Card */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Information</Text>
          </View>

          <InfoRow label="Company" value={expenseDetail.company} icon="business-outline" />
          <InfoRow label="Department" value={expenseDetail.department} icon="briefcase-outline" />
          <InfoRow label="Cost Center" value={expenseDetail.cost_center} icon="pie-chart-outline" />
          <InfoRow label="Approver" value={expenseDetail.expense_approver} icon="shield-checkmark-outline" last />
        </View>

        {/* Expense Items Section */}
        {expenseDetail.expenses && expenseDetail.expenses.length > 0 && (
          <View style={styles.itemsWrapper}>
            <View style={styles.sectionHeaderInline}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Expense Items</Text>
              <View style={[styles.itemCountBadge, { backgroundColor: theme.primary + '15' }]}>
                <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 12 }}>{expenseDetail.expenses.length}</Text>
              </View>
            </View>
            {expenseDetail.expenses.map((item, index) => renderExpenseItem(item, index))}
          </View>
        )}

        {/* Financial Summary Bento Card */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, marginBottom: 24 }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calculator-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Financial Summary</Text>
          </View>

          <FinancialRow label="Claimed Amount" value={expenseDetail.total_claimed_amount} isBold color={theme.primary} />
          <FinancialRow label="Sanctioned Amount" value={expenseDetail.total_sanctioned_amount_in_currency || '--'} />

          {expenseDetail.total_taxes_and_charges > 0 && (
            <FinancialRow label="Taxes & Charges" value={expenseDetail.total_taxes_and_charges} />
          )}

          {expenseDetail.total_advance_amount > 0 && (
            <FinancialRow label="Advance Paid" value={expenseDetail.total_advance_amount} />
          )}

          {expenseDetail.total_amount_reimbursed > 0 && (
            <View style={[styles.reimbursedHighlight, { backgroundColor: theme.success + '10' }]}>
              <FinancialRow label="Total Reimbursed" value={expenseDetail.total_amount_reimbursed} color={theme.success} isBold />
            </View>
          )}
        </View>

        {/* Additional Info Section */}
        {(expenseDetail.project || expenseDetail.task || expenseDetail.remark || expenseDetail.clearance_date) && (
          <View style={[styles.sectionCard, { backgroundColor: theme.card, marginBottom: 40 }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Additional Information</Text>
            </View>

            <InfoRow label="Project" value={expenseDetail.project} icon="folder-outline" />
            <InfoRow label="Task" value={expenseDetail.task} icon="checkbox-outline" />
            <InfoRow label="Clearance Date" value={formatDate(expenseDetail.clearance_date)} icon="calendar-clear-outline" />

            {expenseDetail.remark && (
              <View style={styles.remarkBox}>
                <Text style={[styles.infoLabel, { color: theme.secondary, marginBottom: 6 }]}>Remark</Text>
                <Text style={[styles.descriptionText, { color: theme.text }]}>{expenseDetail.remark}</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    // paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  heroCard: {
    margin: 20,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  heroStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  heroStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  heroInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    maxWidth: '60%',
  },
  heroInfoText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionHeaderInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemsWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  itemCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTitleWrapper: {
    flex: 1,
  },
  itemType: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemDate: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  itemDetails: {
    flexDirection: 'row',
    paddingLeft: 48,
  },
  itemDetailCol: {
    marginRight: 24,
    flexShrink: 1,
  },
  itemDetailLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  itemDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemDescription: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  financialLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  financialValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  reimbursedHighlight: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  remarkBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 16,
  },
});







