import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
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
import { apiService, ManagerDashboardStats, TeamExpenseClaim, TeamLeaveApplication } from '../services/api';

interface ManagerDashboardScreenProps {
  onBack: () => void;
}

export default function ManagerDashboardScreen({ onBack }: ManagerDashboardScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ManagerDashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<'expenses' | 'leaves'>('expenses');
  const [expenseClaims, setExpenseClaims] = useState<TeamExpenseClaim[]>([]);
  const [expenseClaimsLoading, setExpenseClaimsLoading] = useState(true);
  const [leaveApplications, setLeaveApplications] = useState<TeamLeaveApplication[]>([]);
  const [leaveApplicationsLoading, setLeaveApplicationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [selectedClaim, setSelectedClaim] = useState<TeamExpenseClaim | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<TeamLeaveApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLeaveDetailsModal, setShowLeaveDetailsModal] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    fetchExpenseClaims();
    fetchLeaveApplications();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getManagerDashboardStats();
      if (response && response.message === 'Stats retrieved successfully') {
        setStats(response.data);
      } else {
        setStats(null); // Treat non-success/500 as no data
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setStats(null); // Treat 500 as no data
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseClaims = async () => {
    try {
      setExpenseClaimsLoading(true);
      const response = await apiService.getTeamExpenseClaims();
      if (response && response.message === 'Team expense claim get successfully') {
        setExpenseClaims(response.data || []);
      } else {
        setExpenseClaims([]);
      }
    } catch (err) {
      console.error('Error fetching expense claims:', err);
      setExpenseClaims([]);
    } finally {
      setExpenseClaimsLoading(false);
    }
  };

  const fetchLeaveApplications = async () => {
    try {
      setLeaveApplicationsLoading(true);
      const response = await apiService.getTeamLeaveApplications();
      if (response && response.message === 'Team leave application get successfully') {
        setLeaveApplications(response.data || []);
      } else {
        setLeaveApplications([]);
      }
    } catch (err) {
      console.error('Error fetching leave applications:', err);
      setLeaveApplications([]);
    } finally {
      setLeaveApplicationsLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `${apiService.getBaseUrl()}${imagePath}`;
  };

  const formatDate = (dateString: string) => {
    try {
      if (dateString.includes('-') && dateString.split('-').length === 3) return dateString;
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('approve') || s.includes('paid')) return { color: '#10B981', bg: '#10B98115' };
    if (s.includes('reject') || s.includes('cancel') || s.includes('draft')) return { color: '#EF4444', bg: '#EF444415' };
    if (s.includes('pending') || s.includes('open')) return { color: '#F59E0B', bg: '#F59E0B15' };
    return { color: theme.secondary, bg: theme.border + '30' };
  };

  const StatTile = ({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) => (
    <View style={[styles.statTile, { backgroundColor: theme.card }]}>
      <View style={[styles.statIconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View>
        <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: theme.secondary }]}>{label}</Text>
      </View>
    </View>
  );

  const renderExpenseCard = ({ item }: { item: TeamExpenseClaim }) => {
    const status = getStatusColor(item.approval_status);
    const imageUrl = getImageUrl(item.user_image);

    return (
      <TouchableOpacity
        style={[styles.requestCard, { backgroundColor: theme.card }]}
        activeOpacity={0.8}
        onPress={() => { setSelectedClaim(item); setShowDetailsModal(true); }}
      >
        <View style={styles.cardTop}>
          <View style={styles.userSection}>
            <View style={[styles.avatarBox, { backgroundColor: theme.primary + '15' }]}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarText, { color: theme.primary }]}>{item.employee_name[0]}</Text>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>{item.employee_name}</Text>
              <Text style={[styles.userId, { color: theme.secondary }]}>{item.employee}</Text>
            </View>
          </View>
          <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{item.approval_status}</Text>
          </View>
        </View>

        <View style={[styles.cardMetaRow, { backgroundColor: theme.background + '50' }]}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={theme.secondary} />
            <Text style={[styles.metaText, { color: theme.secondary }]}>{formatDate(item.expense_date)}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="pricetag-outline" size={14} color={theme.secondary} />
            <Text style={[styles.metaText, { color: theme.secondary }]} numberOfLines={1}>{item.expense_type}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.footerLabel, { color: theme.secondary }]}>Requested Amount</Text>
          <Text style={[styles.footerValue, { color: theme.text }]}>{item.total_claimed_amount}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLeaveCard = ({ item }: { item: TeamLeaveApplication }) => {
    const status = getStatusColor(item.status);
    const imageUrl = getImageUrl(item.user_image);

    return (
      <TouchableOpacity
        style={[styles.requestCard, { backgroundColor: theme.card }]}
        activeOpacity={0.8}
        onPress={() => { setSelectedLeave(item); setShowLeaveDetailsModal(true); }}
      >
        <View style={styles.cardTop}>
          <View style={styles.userSection}>
            <View style={[styles.avatarBox, { backgroundColor: theme.primary + '15' }]}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarText, { color: theme.primary }]}>{item.employee_name[0]}</Text>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>{item.employee_name}</Text>
              <Text style={[styles.userId, { color: theme.secondary }]}>{item.employee}</Text>
            </View>
          </View>
          <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{item.status}</Text>
          </View>
        </View>

        <View style={[styles.cardMetaRow, { backgroundColor: theme.background + '50' }]}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={theme.secondary} />
            <Text style={[styles.metaText, { color: theme.secondary }]}>
              {formatDate(item.from_date)} - {formatDate(item.to_date)}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="briefcase-outline" size={14} color={theme.secondary} />
            <Text style={[styles.footerText, { color: theme.secondary }]}>{item.leave_type}</Text>
          </View>
          <Text style={[styles.footerValue, { color: theme.primary }]}>
            {item.total_leave_days} {item.total_leave_days === 1 ? 'Day' : 'Days'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const DetailModal = ({ visible, onClose, item, type }: { visible: boolean; onClose: () => void; item: any; type: 'expense' | 'leave' }) => {
    if (!item) return null;
    const imageUrl = getImageUrl(item.user_image);
    const status = getStatusColor(type === 'expense' ? item.approval_status : item.status);

    return (
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalSubtitle, { color: theme.secondary }]}>{type === 'expense' ? 'EXPENSE CLAIM' : 'LEAVE APPLICATION'}</Text>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Request Details</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={[styles.modalClose, { backgroundColor: theme.card }]}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
                <View style={styles.modalUserRow}>
                  <View style={[styles.modalAvatar, { backgroundColor: theme.primary + '15' }]}>
                    {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.avatarImage} /> : <Text style={[styles.modalAvatarText, { color: theme.primary }]}>{item.employee_name[0]}</Text>}
                  </View>
                  <View style={styles.modalUserInfo}>
                    <Text style={[styles.modalUserName, { color: theme.text }]}>{item.employee_name}</Text>
                    <Text style={[styles.modalUserId, { color: theme.secondary }]}>{item.employee}</Text>
                    <Text style={[styles.modalDept, { color: theme.secondary }]}>{item.department}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.infoLabel, { color: theme.secondary }]}>STATUS</Text>
                <View style={[styles.modalStatusBadge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.modalStatusText, { color: status.color }]}>{type === 'expense' ? item.approval_status : item.status}</Text>
                </View>

                <View style={styles.infoGrid}>
                  <View style={styles.infoCol}>
                    <Text style={[styles.infoLabel, { color: theme.secondary }]}>{type === 'expense' ? 'EXPENSE TYPE' : 'LEAVE TYPE'}</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>{type === 'expense' ? item.expense_type : item.leave_type}</Text>
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={[styles.infoLabel, { color: theme.secondary }]}>DATES</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>{type === 'expense' ? formatDate(item.expense_date) : `${formatDate(item.from_date)} - ${formatDate(item.to_date)}`}</Text>
                  </View>
                </View>

                {item.description && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.infoLabel, { color: theme.secondary }]}>DESCRIPTION</Text>
                    <Text style={[styles.infoValue, { color: theme.text, fontWeight: '500' }]}>{item.description || item.expense_description}</Text>
                  </View>
                )}
              </View>

              {type === 'expense' && (
                <View style={[styles.modalCard, { backgroundColor: theme.card, marginBottom: 40 }]}>
                  <Text style={[styles.infoLabel, { color: theme.secondary, marginBottom: 12 }]}>FINANCIAL SUMMARY</Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, { color: theme.secondary }]}>Subtotal</Text>
                    <Text style={[styles.priceValue, { color: theme.text }]}>{item.total_claimed_amount}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, { color: theme.secondary }]}>Grand Total</Text>
                    <Text style={[styles.priceValue, { color: theme.primary, fontSize: 20 }]}>ETB {item.grand_total?.toLocaleString()}</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <TouchableOpacity onPress={onClose} style={[styles.actionBtn, { backgroundColor: theme.primary }]}>
                <Text style={styles.actionBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerArea}>
      <View style={[styles.navHeader, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>Manager Dashboard</Text>
        <TouchableOpacity onPress={fetchDashboardStats} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {stats && (
        <View style={styles.statsGrid}>
          <View style={styles.gridRow}>
            <StatTile icon="people" label="Employees" value={stats.total_employees} color="#3B82F6" />
            <StatTile icon="enter-outline" label="Clock In" value={stats.clock_in} color="#10B981" />
            <StatTile icon="exit-outline" label="Clock Out" value={stats.clock_out} color="#F59E0B" />
          </View>
          <View style={styles.gridRow}>
            <StatTile icon="bed-outline" label="On Leave" value={stats.on_leave} color="#8B5CF6" />
            <StatTile icon="time-outline" label="Late" value={stats.not_clock_in} color="#EF4444" />
            <StatTile icon="checkmark-circle" label="Approvals" value={stats.approval} color="#6366F1" />
          </View>
        </View>
      )}

      {/* Custom Tab Bar */}
      <View style={styles.tabWrapper}>
        <View style={[styles.tabBar, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            onPress={() => setActiveTab('expenses')}
            style={[styles.tabItem, activeTab === 'expenses' && { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.tabText, { color: activeTab === 'expenses' ? 'white' : theme.secondary }]}>Expenses</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('leaves')}
            style={[styles.tabItem, activeTab === 'leaves' && { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.tabText, { color: activeTab === 'leaves' ? 'white' : theme.secondary }]}>Leaves</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.centerSection}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.secondary }]}>Preparing Manager Dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <FlatList<TeamExpenseClaim | TeamLeaveApplication>
        data={activeTab === 'expenses' ? expenseClaims : leaveApplications}
        renderItem={({ item }) => {
          if (activeTab === 'expenses') {
            return renderExpenseCard({ item: item as TeamExpenseClaim });
          } else {
            return renderLeaveCard({ item: item as TeamLeaveApplication });
          }
        }}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconWrapper, { backgroundColor: theme.card }]}>
              <Ionicons name={activeTab === 'expenses' ? "receipt-outline" : "calendar-outline"} size={64} color={theme.border} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Pending Requests</Text>
            <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
              Team {activeTab} requests will appear here once they are submitted.
            </Text>
          </View>
        }
      />

      <DetailModal visible={showDetailsModal} onClose={() => setShowDetailsModal(false)} item={selectedClaim} type="expense" />
      <DetailModal visible={showLeaveDetailsModal} onClose={() => setShowLeaveDetailsModal(false)} item={selectedLeave} type="leave" />
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
  navTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statTile: {
    flex: 0.31,
    padding: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  tabWrapper: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  tabBar: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    padding: 6,
  },
  tabItem: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 120,
  },
  requestCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  userId: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '88%',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modalSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modalClose: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    paddingHorizontal: 24,
  },
  modalCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
  },
  modalUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  modalAvatarText: {
    fontSize: 24,
    fontWeight: '800',
  },
  modalUserInfo: {
    flex: 1,
  },
  modalUserName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modalUserId: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  modalDept: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    marginTop: 20,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceValue: {
    fontWeight: '800',
    fontSize: 16,
  },
  modalFooter: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
  },
  actionBtn: {
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  actionBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
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
    paddingVertical: 80,
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
});
