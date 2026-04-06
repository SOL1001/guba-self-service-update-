import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '../constants/Theme';
import { apiService } from '../services/api';

interface PaymentDetailScreenProps {
  paymentId: string;
  onBack: () => void;
}

interface PaymentReference {
  reference_doctype?: string;
  reference_name?: string;
  due_date?: string | null;
  total_amount?: number;
  outstanding_amount?: number;
  allocated_amount?: number;
}

interface PaymentDetail {
  name?: string;
  posting_date?: string;
  mode_of_payment?: string | null;
  party?: string;
  party_name?: string;
  paid_amount?: number;
  payment_type?: string;
  status?: string;
  workflow_state?: string;
  paid_amount_in_currency?: string;
  company?: string;
  reference_no?: string;
  reference_date?: string;
  remarks?: string;
  party_type?: string;
  paid_from?: string;
  paid_to?: string;
  cost_center?: string;
  references?: PaymentReference[];
  attachments?: any[];
  allow_edit?: boolean;
  next_action?: any[];
  [key: string]: any;
}

export default function PaymentDetailScreen({ paymentId, onBack }: PaymentDetailScreenProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const isDark = colorScheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentDetail();
  }, [paymentId]);

  const fetchPaymentDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getPaymentEntry(paymentId);
      if (response.message?.toLowerCase().includes('successfully')) {
        const data = { ...response.data };
        if (data.workflow_state && !data.status) {
          data.status = data.workflow_state;
        }
        setPaymentDetail(data);
      } else {
        setError(response.message || 'Failed to fetch payment details');
      }
    } catch (err) {
      console.error('Error fetching payment detail:', err);
      setError('Connection lost. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number | string) => {
    if (amount === undefined || amount === null) return 'ETB 0.00';
    if (typeof amount === 'string') return amount;
    return `ETB ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status?: string) => {
    const s = status?.toLowerCase() || 'unknown';
    let config = { icon: 'checkmark-circle' as any, color: '#10B981' };

    if (s === 'draft' || s.includes('pending')) config = { icon: 'time', color: '#F59E0B' };
    if (s === 'cancelled' || s.includes('reject')) config = { icon: 'close-circle', color: '#EF4444' };

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color + '15' }]}>
        <Ionicons name={config.icon} size={14} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>{status || 'Draft'}</Text>
      </View>
    );
  };

  const InfoGridItem = ({ label, value, icon, color, delay }: { label: string, value: string, icon: any, color: string, delay: number }) => (
    <Animated.View entering={FadeInDown.delay(delay)} style={[styles.gridItem, { backgroundColor: theme.background }]}>
      <View style={[styles.gridIconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.gridTextContent}>
        <Text style={[styles.gridLabel, { color: theme.secondary }]}>{label}</Text>
        <Text style={[styles.gridValue, { color: theme.text }]} numberOfLines={1}>{value}</Text>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 16, color: theme.secondary }}>Fetching ledger details...</Text>
      </View>
    );
  }

  if (error || !paymentDetail) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.secondary} />
        <Text style={[styles.errorTitle, { color: theme.text }]}>Oops!</Text>
        <Text style={[styles.errorSubtitle, { color: theme.secondary }]}>{error || ' Ledger not found.'}</Text>
        <TouchableOpacity onPress={onBack} style={[styles.backBtnAction, { backgroundColor: theme.primary }]}>
          <Text style={styles.backBtnText}>Return to List</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ backgroundColor: theme.card }}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleArea}>
            <Text style={[styles.headerSubtitle, { color: theme.secondary }]}>LEDGER DETAIL</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>{paymentId}</Text>
          </View>
          {getStatusBadge(paymentDetail.status)}
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Identity Card */}
        <Animated.View entering={FadeInDown.delay(100)} style={[styles.bentoCard, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBoxMain, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="receipt-outline" size={24} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Identity Section</Text>
              <Text style={[styles.cardSubtitle, { color: theme.secondary }]}>Voucher & Party Meta</Text>
            </View>
          </View>

          <View style={styles.gridContainer}>
            <InfoGridItem label="PARTY NAME" value={paymentDetail.party_name || paymentDetail.party || 'N/A'} icon="person-outline" color="#3B82F6" delay={150} />
            <InfoGridItem label="PARTY TYPE" value={paymentDetail.party_type || 'N/A'} icon="business-outline" color="#8B5CF6" delay={200} />
            <InfoGridItem label="POSTING DATE" value={formatDate(paymentDetail.posting_date)} icon="calendar-outline" color="#10B981" delay={250} />
            <InfoGridItem label="PAYMENT TYPE" value={paymentDetail.payment_type || 'N/A'} icon="swap-horizontal-outline" color="#F59E0B" delay={300} />
          </View>
        </Animated.View>

        {/* Financial Breakdown */}
        <Animated.View entering={FadeInDown.delay(350)} style={[styles.bentoCard, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBoxMain, { backgroundColor: '#10B98115' }]}>
              <Ionicons name="wallet-outline" size={24} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Financial Breakdown</Text>
              <Text style={[styles.cardSubtitle, { color: theme.secondary }]}>Transaction Summary</Text>
            </View>
          </View>

          <View style={styles.heroAmountArea}>
            <Text style={[styles.heroLabel, { color: theme.secondary }]}>TOTAL PAID AMOUNT</Text>
            <Text style={[styles.heroValue, { color: theme.text }]}>{formatCurrency(paymentDetail.paid_amount)}</Text>
            <View style={[styles.currencyChip, { backgroundColor: theme.primary + '10' }]}>
              <Text style={[styles.currencyText, { color: theme.primary }]}>{paymentDetail.paid_amount_in_currency}</Text>
            </View>
          </View>

          <View style={[styles.metaGrid, { borderTopColor: theme.border + '15' }]}>
            <View style={styles.metaBox}>
              <Ionicons name="card-outline" size={18} color="#3B82F6" />
              <View>
                <Text style={[styles.metaLabel, { color: theme.secondary }]}>MODE OF PAYMENT</Text>
                <Text style={[styles.metaValue, { color: theme.text }]}>{paymentDetail.mode_of_payment || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.metaBox}>
              <Ionicons name="copy-outline" size={18} color="#8B5CF6" />
              <View>
                <Text style={[styles.metaLabel, { color: theme.secondary }]}>REFERENCE NO</Text>
                <Text style={[styles.metaValue, { color: theme.text }]}>{paymentDetail.reference_no || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Linked Accounts */}
        <Animated.View entering={FadeInDown.delay(450)} style={[styles.bentoCard, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBoxMain, { backgroundColor: '#F59E0B15' }]}>
              <Ionicons name="git-network-outline" size={24} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Accounts Info</Text>
              <Text style={[styles.cardSubtitle, { color: theme.secondary }]}>Destination & Source</Text>
            </View>
          </View>

          <View style={styles.accountRow}>
            <View style={styles.accountBox}>
              <Text style={[styles.accLabel, { color: '#EF4444' }]}>PAID FROM</Text>
              <Text style={[styles.accValue, { color: theme.text }]}>{paymentDetail.paid_from || 'N/A'}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={theme.border} style={{ marginHorizontal: 8 }} />
            <View style={[styles.accountBox, { alignItems: 'flex-end' }]}>
              <Text style={[styles.accLabel, { color: '#10B981' }]}>PAID TO</Text>
              <Text style={[styles.accValue, { color: theme.text, textAlign: 'right' }]}>{paymentDetail.paid_to || 'N/A'}</Text>
            </View>
          </View>

          <View style={[styles.tagRow, { borderTopColor: theme.border + '15' }]}>
            <View style={styles.tag}>
              <Ionicons name="layers-outline" size={14} color={theme.secondary} />
              <Text style={[styles.tagText, { color: theme.secondary }]}>{paymentDetail.cost_center || 'General CC'}</Text>
            </View>
            <View style={styles.tag}>
              <Ionicons name="business-outline" size={14} color={theme.secondary} />
              <Text style={[styles.tagText, { color: theme.secondary }]}>{paymentDetail.company || 'Guba SL'}</Text>
            </View>
          </View>
        </Animated.View>

        {/* References Table */}
        {paymentDetail.references && paymentDetail.references.length > 0 && (
          <Animated.View entering={FadeInDown.delay(550)} style={[styles.bentoCard, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBoxMain, { backgroundColor: '#8B5CF615' }]}>
                <Ionicons name="link-outline" size={24} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Linked References</Text>
                <Text style={[styles.cardSubtitle, { color: theme.secondary }]}>Allocated Documents</Text>
              </View>
            </View>

            {paymentDetail.references.map((ref, index) => (
              <View key={index} style={[styles.referenceBox, { backgroundColor: theme.background }]}>
                <View style={styles.refHeader}>
                  <Text style={[styles.refDocType, { color: theme.secondary }]}>{ref.reference_doctype}</Text>
                  <Text style={[styles.refDocName, { color: theme.primary }]}>{ref.reference_name}</Text>
                </View>
                <View style={styles.refGrid}>
                  <View style={styles.refCol}>
                    <Text style={styles.refLabelMini}>TOTAL</Text>
                    <Text style={[styles.refValMini, { color: theme.text }]}>{formatCurrency(ref.total_amount)}</Text>
                  </View>
                  <View style={styles.refCol}>
                    <Text style={styles.refLabelMini}>ALLOCATED</Text>
                    <Text style={[styles.refValMini, { color: theme.primary }]}>{formatCurrency(ref.allocated_amount)}</Text>
                  </View>
                  <View style={[styles.refCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.refLabelMini}>OUTSTANDING</Text>
                    <Text style={[styles.refValMini, { color: '#EF4444' }]}>{formatCurrency(ref.outstanding_amount)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Remarks Section */}
        {paymentDetail.remarks && (
          <Animated.View entering={FadeInDown.delay(650)} style={[styles.bentoCard, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="chatbubble-outline" size={20} color={theme.primary} />
              <Text style={[styles.cardTitle, { color: theme.text }]}>Journal Remarks</Text>
            </View>
            <View style={[styles.remarksArea, { backgroundColor: theme.background }]}>
              <Text style={[styles.remarksText, { color: theme.text }]}>{paymentDetail.remarks}</Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  navHeader: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  } as ViewStyle,
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
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: -2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  } as ViewStyle,
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  } as TextStyle,
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  bentoCard: {
    padding: 24,
    borderRadius: 36,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  } as ViewStyle,
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  iconBoxMain: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
    padding: 16,
    borderRadius: 20,
    gap: 12,
  },
  gridIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridTextContent: {
    gap: 2,
  },
  gridLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: '700',
  } as TextStyle,
  heroAmountArea: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  heroValue: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  currencyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  currencyText: {
    fontSize: 12,
    fontWeight: '800',
  } as TextStyle,
  metaGrid: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
  },
  metaBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  accountBox: {
    flex: 1,
    gap: 4,
  },
  accLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  accValue: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  tagRow: {
    paddingTop: 20,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(0,0,0,0.03)',
    gap: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  referenceBox: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  refHeader: {
    marginBottom: 16,
  },
  refDocType: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  refDocName: {
    fontSize: 14,
    fontWeight: '700',
  },
  refGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  refCol: {
    gap: 4,
  },
  refLabelMini: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9CA3AF',
  },
  refValMini: {
    fontSize: 12,
    fontWeight: '800',
  },
  remarksArea: {
    padding: 20,
    borderRadius: 20,
  },
  remarksText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 24,
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  backBtnAction: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
  },
  backBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
  },
});
