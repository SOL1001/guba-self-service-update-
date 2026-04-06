import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
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

interface MyLeavesScreenProps {
  onBack: () => void;
  onNavigateToNewLeave?: () => void;
  onLeavePress?: (leave: any) => void;
}

interface LeaveRequest {
  name: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_leave_days: number;
  description: string;
  status: string;
  posting_date: string;
  half_day: number;
  half_day_date: string | null;
}

interface LeaveBalance {
  leave_type: string;
  total_leaves: number;
  leaves_allocated: number;
  leaves_taken: number;
  expired_leaves: number;
  employee: string;
  closing_balance: number;
}

interface LeaveData {
  upcoming: LeaveRequest[];
  taken: LeaveRequest[];
  balance: LeaveBalance[];
}

export default function MyLeavesScreen({ onBack, onNavigateToNewLeave, onLeavePress }: MyLeavesScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [leaveData, setLeaveData] = useState<LeaveData>({ upcoming: [], taken: [], balance: [] });
  const [loading, setLoading] = useState(true);
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLeaveApplicationList();
      if (response.message?.toLowerCase().includes('success')) {
        setLeaveData(response.data || { upcoming: [], taken: [], balance: [] });
      } else {
        // Treat non-success/500 as "no data"
        setLeaveData({ upcoming: [], taken: [], balance: [] });
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      // Treat 500/Connection errors as "no data"
      setLeaveData({ upcoming: [], taken: [], balance: [] });
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: { [key: string]: { color: string; bg: string; icon: string } } = {
    approved: { color: '#10B981', bg: '#10B98115', icon: 'checkmark-circle' },
    rejected: { color: '#EF4444', bg: '#EF444415', icon: 'close-circle' },
    open: { color: '#F59E0B', bg: '#F59E0B15', icon: 'time' },
    cancelled: { color: '#6B7280', bg: '#6B728015', icon: 'ban' },
    default: { color: theme.secondary, bg: theme.border + '50', icon: 'help-circle' }
  };

  const getStatusStyle = (status: string) => statusConfig[status.toLowerCase()] || statusConfig.default;

  const renderLeaveCard = ({ item }: { item: LeaveRequest }) => {
    const status = getStatusStyle(item.status);
    return (
      <TouchableOpacity
        onPress={() => onLeavePress?.(item)}
        style={[styles.leaveCard, { backgroundColor: theme.card }]}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTypeContainer}>
            <View style={[styles.typeIconWrapper, { backgroundColor: theme.primary + '10' }]}>
              <Ionicons name="calendar" size={18} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.leaveType, { color: theme.text }]}>{item.leave_type}</Text>
              <Text style={[styles.postingDate, { color: theme.secondary }]}>{item.posting_date}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon as any} size={12} color={status.color} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: status.color }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.durationRow}>
            <View style={styles.dateBlock}>
              <Text style={[styles.dateLabel, { color: theme.secondary }]}>FROM</Text>
              <Text style={[styles.dateValue, { color: theme.text }]}>{item.from_date}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={theme.border} style={{ marginHorizontal: 12 }} />
            <View style={styles.dateBlock}>
              <Text style={[styles.dateLabel, { color: theme.secondary }]}>TO</Text>
              <Text style={[styles.dateValue, { color: theme.text }]}>{item.to_date}</Text>
            </View>
          </View>

          <View style={[styles.daysBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.daysText}>{item.total_leave_days} {item.total_leave_days === 1 ? 'Day' : 'Days'}</Text>
          </View>
        </View>

        {item.description && (
          <View style={[styles.descriptionWrapper, { borderTopColor: theme.border + '40' }]}>
            <Text style={[styles.description, { color: theme.secondary }]} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const BalanceCard = ({ item }: { item: LeaveBalance }) => (
    <View style={[styles.balanceCard, { backgroundColor: theme.card }]}>
      <Text style={[styles.balanceType, { color: theme.secondary }]} numberOfLines={1}>{item.leave_type}</Text>
      <Text style={[styles.balanceValue, { color: theme.primary }]}>{item.closing_balance}</Text>
      <Text style={[styles.balanceUnit, { color: theme.secondary }]}>Days Left</Text>
      <View style={[styles.balanceTrend, { backgroundColor: theme.primary + '10' }]}>
        <Text style={[styles.trendText, { color: theme.primary }]}>{item.leaves_taken} taken</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Modern Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Leaves</Text>
        <TouchableOpacity onPress={() => setShowBalanceModal(true)} style={styles.headerAction}>
          <Ionicons name="pie-chart-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView stickyHeaderIndices={[2]} showsVerticalScrollIndicator={false}>
        {/* Bento Summary Section */}
        <View style={styles.summaryContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Leave Balance</Text>
            <TouchableOpacity onPress={() => setShowBalanceModal(true)}>
              <Text style={{ color: theme.primary, fontWeight: '600' }}>See Details</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.balanceList}>
            {leaveData.balance.map((item, index) => (
              <BalanceCard key={index} item={item} />
            ))}
            {leaveData.balance.length === 0 && (
              <View style={[styles.emptyBalance, { backgroundColor: theme.card }]}>
                <Text style={{ color: theme.secondary }}>No balance data</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.divider} />

        {/* Tab Bar */}
        <View style={[styles.tabBarContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.tabBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('pending')}
              style={[styles.tab, activeTab === 'pending' && { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.tabText, { color: activeTab === 'pending' ? 'white' : theme.secondary }]}>Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('history')}
              style={[styles.tab, activeTab === 'history' && { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.tabText, { color: activeTab === 'history' ? 'white' : theme.secondary }]}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.centerSection}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.secondary }]}>Loading leaves...</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {(() => {
              const currentLeaves = activeTab === 'pending'
                ? [...leaveData.upcoming, ...leaveData.taken].filter(l => l.status.toLowerCase() === 'open')
                : [...leaveData.upcoming, ...leaveData.taken];

              if (currentLeaves.length === 0) {
                return (
                  <View style={styles.emptyState}>
                    <View style={[styles.emptyIconWrapper, { backgroundColor: theme.card }]}>
                      <Ionicons name="calendar-outline" size={48} color={theme.border} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No leaves found</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
                      {activeTab === 'pending' ? 'All caught up! No pending requests.' : 'You haven\'t applied for any leaves yet.'}
                    </Text>
                  </View>
                );
              }

              return currentLeaves.map((item, index) => (
                <RenderItem key={index} item={item} onLeavePress={onLeavePress} theme={theme} getStatusStyle={getStatusStyle} />
              ));
            })()}
            <View style={{ height: 100 }} />
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={onNavigateToNewLeave}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Modern Balance Modal */}
      <Modal visible={showBalanceModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismiss} activeOpacity={1} onPress={() => setShowBalanceModal(false)} />
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalBar} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Detailed Balance</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowBalanceModal(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {leaveData.balance.map((item, index) => (
                <View key={index} style={[styles.modalBalanceItem, { borderBottomColor: theme.border }]}>
                  <View style={styles.modalItemHeader}>
                    <Text style={[styles.modalItemTitle, { color: theme.text }]}>{item.leave_type}</Text>
                    <Text style={[styles.modalItemValue, { color: theme.primary }]}>{item.closing_balance} Days</Text>
                  </View>
                  <View style={styles.modalItemGrid}>
                    <View style={styles.modalGridCell}>
                      <Text style={[styles.modalCellLabel, { color: theme.secondary }]}>Allocated</Text>
                      <Text style={[styles.modalCellValue, { color: theme.text }]}>{item.total_leaves}</Text>
                    </View>
                    <View style={styles.modalGridCell}>
                      <Text style={[styles.modalCellLabel, { color: theme.secondary }]}>Taken</Text>
                      <Text style={[styles.modalCellValue, { color: theme.text }]}>{item.leaves_taken}</Text>
                    </View>
                    <View style={styles.modalGridCell}>
                      <Text style={[styles.modalCellLabel, { color: theme.secondary }]}>Expired</Text>
                      <Text style={[styles.modalCellValue, { color: theme.text }]}>{item.expired_leaves}</Text>
                    </View>
                  </View>
                </View>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper component for list items
function RenderItem({ item, onLeavePress, theme, getStatusStyle }: any) {
  const status = getStatusStyle(item.status);
  return (
    <TouchableOpacity
      onPress={() => onLeavePress?.(item)}
      style={[styles.leaveCard, { backgroundColor: theme.card }]}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTypeContainer}>
          <View style={[styles.typeIconWrapper, { backgroundColor: theme.primary + '10' }]}>
            <Ionicons name="calendar-outline" size={18} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.leaveType, { color: theme.text }]}>{item.leave_type}</Text>
            <Text style={[styles.postingDate, { color: theme.secondary }]}>{item.posting_date}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon as any} size={12} color={status.color} style={{ marginRight: 4 }} />
          <Text style={[styles.statusText, { color: status.color }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.durationRow}>
          <View style={styles.dateBlock}>
            <Text style={[styles.dateLabel, { color: theme.secondary }]}>FROM</Text>
            <Text style={[styles.dateValue, { color: theme.text }]}>{item.from_date}</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={theme.border} style={{ marginHorizontal: 12 }} />
          <View style={styles.dateBlock}>
            <Text style={[styles.dateLabel, { color: theme.secondary }]}>TO</Text>
            <Text style={[styles.dateValue, { color: theme.text }]}>{item.to_date}</Text>
          </View>
        </View>

        <View style={[styles.daysBadge, { backgroundColor: theme.primary }]}>
          <Text style={styles.daysText}>{item.total_leave_days} {item.total_leave_days === 1 ? 'Day' : 'Days'}</Text>
        </View>
      </View>

      {item.description && (
        <View style={[styles.descriptionWrapper, { borderTopColor: theme.border + '15' }]}>
          <Text style={[styles.description, { color: theme.secondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  balanceList: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  balanceCard: {
    width: 140,
    padding: 16,
    borderRadius: 24,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  balanceType: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  balanceUnit: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  balanceTrend: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyBalance: {
    width: 320,
    height: 70,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
  },
  divider: {
    height: 12,
  },
  tabBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 10,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  leaveCard: {
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaveType: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  postingDate: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBlock: {
    alignItems: 'flex-start',
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  daysBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  daysText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  descriptionWrapper: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  description: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 8,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalBar: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBalanceItem: {
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  modalItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalItemTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalItemValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalItemGrid: {
    flexDirection: 'row',
  },
  modalGridCell: {
    flex: 1,
  },
  modalCellLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  modalCellValue: {
    fontSize: 15,
    fontWeight: '600',
  },
});