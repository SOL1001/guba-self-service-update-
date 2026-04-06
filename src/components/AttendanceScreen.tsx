import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { Colors } from '../constants/Theme';
import { apiService, AttendanceDetails, AttendanceRecord } from '../services/api';

interface AttendanceScreenProps {
  onBack: () => void;
}

export default function AttendanceScreen({ onBack }: AttendanceScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceDetails, setAttendanceDetails] = useState<AttendanceDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedMonth]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth() + 1;

      const response = await apiService.getAttendanceList(year, month);

      if (response.message === 'Attendance data getting successfully') {
        setAttendanceRecords(response.data.attendance_list);
        setAttendanceDetails(response.data.attendance_details);
      } else {
        // Treat non-success/500 as "no data"
        setAttendanceRecords([]);
        setAttendanceDetails(null);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      // Treat 500/Connection errors as "no data"
      setAttendanceRecords([]);
      setAttendanceDetails(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (record: AttendanceRecord) => {
    if (record.in_time && record.out_time) return 'Present';
    if (record.in_time && !record.out_time) return 'Half Day';
    return 'Absent';
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Present': return { color: '#10B981', bg: '#10B98115', icon: 'checkmark-circle' };
      case 'Half Day': return { color: '#3B82F6', bg: '#3B82F615', icon: 'contrast' };
      case 'Absent': return { color: '#EF4444', bg: '#EF444415', icon: 'close-circle' };
      default: return { color: '#6B7280', bg: '#6B728015', icon: 'help-circle' };
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--:--';
    try {
      const [h, m] = timeString.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${m} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const formatWorkingHours = (hours: number) => {
    if (hours === 0) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(selectedMonth);
    nextMonth.setMonth(selectedMonth.getMonth() + offset);
    setSelectedMonth(nextMonth);
  };

  const renderAttendanceCard = ({ item }: { item: AttendanceRecord }) => {
    const statusLabel = getAttendanceStatus(item);
    const status = getStatusConfig(statusLabel);

    return (
      <View style={[styles.logCard, { backgroundColor: theme.card }]}>
        <View style={styles.cardHeader}>
          <View style={styles.dateWrapper}>
            <Text style={[styles.logDate, { color: theme.text }]}>{item.attendance_date}</Text>
            <View style={styles.locationWrapper}>
              <Ionicons name="location-outline" size={12} color={theme.secondary} />
              <Text style={[styles.locationText, { color: theme.secondary }]}>Main Office</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon as any} size={12} color={status.color} />
            <Text style={[styles.statusLabel, { color: status.color }]}>{statusLabel}</Text>
          </View>
        </View>

        <View style={[styles.heroRow, { backgroundColor: theme.background + '50' }]}>
          <View style={styles.timeItem}>
            <Text style={[styles.timeLabel, { color: theme.secondary }]}>CHECK IN</Text>
            <View style={styles.timeValueRow}>
              <Ionicons name="enter-outline" size={16} color="#10B981" />
              <Text style={[styles.timeValue, { color: theme.text }]}>{formatTime(item.in_time)}</Text>
            </View>
          </View>
          <View style={[styles.timeDivider, { backgroundColor: theme.border + '30' }]} />
          <View style={styles.timeItem}>
            <Text style={[styles.timeLabel, { color: theme.secondary }]}>CHECK OUT</Text>
            <View style={styles.timeValueRow}>
              <Ionicons name="exit-outline" size={16} color="#EF4444" />
              <Text style={[styles.timeValue, { color: theme.text }]}>{formatTime(item.out_time)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={14} color={theme.secondary} />
            <Text style={[styles.footerText, { color: theme.secondary }]}>
              Work: <Text style={{ color: theme.text, fontWeight: '700' }}>{formatWorkingHours(item.working_hours)}</Text>
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    const totalPresent = attendanceDetails?.present || 0;
    const totalAbsent = attendanceDetails?.absent || 0;
    const totalLate = attendanceDetails?.late || 0;
    const monthName = selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
      <View style={styles.headerArea}>
        {/* Navigation & Header */}
        <View style={[styles.navHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: theme.text }]}>Attendance</Text>
          <TouchableOpacity onPress={fetchAttendanceData} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={22} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Month Selector */}
        <View style={styles.selectorWrapper}>
          <View style={[styles.monthSelector, { backgroundColor: theme.card }]}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.selectorBtn}>
              <Ionicons name="chevron-back" size={20} color={theme.primary} />
            </TouchableOpacity>
            <Text style={[styles.monthText, { color: theme.text }]}>{monthName}</Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.selectorBtn}>
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Row */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <View style={[styles.iconBox, { backgroundColor: '#10B98115' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text style={[styles.summaryCount, { color: theme.text }]}>{totalPresent}</Text>
            <Text style={[styles.summaryLabel, { color: theme.secondary }]}>Present</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <View style={[styles.iconBox, { backgroundColor: '#EF444415' }]}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            </View>
            <Text style={[styles.summaryCount, { color: theme.text }]}>{totalAbsent}</Text>
            <Text style={[styles.summaryLabel, { color: theme.secondary }]}>Absent</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <View style={[styles.iconBox, { backgroundColor: '#F59E0B15' }]}>
              <Ionicons name="time" size={20} color="#F59E0B" />
            </View>
            <Text style={[styles.summaryCount, { color: theme.text }]}>{totalLate}</Text>
            <Text style={[styles.summaryLabel, { color: theme.secondary }]}>Late</Text>
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: theme.text }]}>Daily Activity</Text>
        </View>
      </View>
    );
  };

  if (loading && attendanceRecords.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        {renderHeader()}
        <View style={styles.centerSection}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.secondary }]}>Fetching your logs...</Text>
        </View>
      </View>
    );
  }

  if (error && attendanceRecords.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader()}
        <View style={styles.centerSection}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: theme.text }]}>{error}</Text>
          <TouchableOpacity onPress={fetchAttendanceData} style={[styles.retryBtn, { backgroundColor: theme.primary }]}>
            <Text style={styles.retryText}>Retry sync</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <FlatList
        data={attendanceRecords}
        renderItem={renderAttendanceCard}
        keyExtractor={(item, index) => `${item.attendance_date}-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconWrapper, { backgroundColor: theme.card }]}>
              <Ionicons name="calendar-outline" size={64} color={theme.border} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No records yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
              We couldn't find any attendance logs for this period.
            </Text>
          </View>
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
  selectorWrapper: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  selectorBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 0.31,
    padding: 16,
    borderRadius: 24,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryCount: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listHeader: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  listContent: {
    paddingBottom: 100,
  },
  logCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  dateWrapper: {
    flex: 1,
  },
  logDate: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  locationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  timeItem: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timeValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  timeDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
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
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
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
