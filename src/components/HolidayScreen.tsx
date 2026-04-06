import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { Colors } from '../constants/Theme';
import { apiService, Holiday } from '../services/api';

interface HolidayScreenProps {
  onBack: () => void;
}

interface HolidaySection {
  title: string;
  data: Holiday[];
}

export default function HolidayScreen({ onBack }: HolidayScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<HolidaySection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [yearInput, setYearInput] = useState<string>(currentYear.toString());
  const [totalHolidays, setTotalHolidays] = useState(0);

  useEffect(() => {
    fetchHolidays(selectedYear);
  }, [selectedYear]);

  const fetchHolidays = async (year: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getHolidayList(year);

      const message = response?.message || '';
      if (message.toLowerCase().includes('no holidays found') ||
        message.toLowerCase().includes('no holidays')) {
        setSections([]);
        setTotalHolidays(0);
        return;
      }

      if (response && response.data && Array.isArray(response.data)) {
        if (message.toLowerCase().includes('success')) {
          const grouped = groupHolidaysByMonth(response.data);
          setSections(grouped);
          setTotalHolidays(response.data.length);
        } else {
          setError(response.message || 'Failed to fetch holidays');
        }
      }
    } catch (err) {
      console.error('Error fetching holidays:', err);
      const errorMessage = err instanceof Error ? err.message : 'Connection Error';

      if (errorMessage.toLowerCase().includes('no holidays')) {
        setSections([]);
        setTotalHolidays(0);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const groupHolidaysByMonth = (data: Holiday[]): HolidaySection[] => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const groups: { [key: string]: Holiday[] } = {};

    data.forEach(item => {
      try {
        const dateParts = item.date.split('-'); // Expected Format: YYYY-MM-DD
        const monthIndex = dateParts.length === 3 ? parseInt(dateParts[1]) - 1 : new Date(item.date).getMonth();
        const monthName = months[monthIndex];

        if (!groups[monthName]) groups[monthName] = [];
        groups[monthName].push(item);
      } catch (e) {
        if (!groups['Other']) groups['Other'] = [];
        groups['Other'].push(item);
      }
    });

    return Object.keys(groups).map(key => ({
      title: key,
      data: groups[key]
    }));
  };

  const handleYearSearch = () => {
    const year = parseInt(yearInput.trim());
    if (!isNaN(year) && year > 1900 && year < 2100) {
      setSelectedYear(year);
    } else {
      setYearInput(selectedYear.toString());
    }
  };

  const renderHolidayCard = ({ item }: { item: Holiday }) => {
    const dayLower = item.day.toLowerCase();
    const isWeekend = dayLower.includes('saturday') || dayLower.includes('sunday');

    // Extract Day Number and Month Abbreviation for the Icon
    let dayNum = '??';
    let monthAbbr = '???';
    try {
      const date = new Date(item.date);
      dayNum = date.getDate().toString();
      monthAbbr = date.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
    } catch { }

    const iconColor = isWeekend ? '#3B82F6' : '#F59E0B';
    const iconBg = isWeekend ? '#3B82F615' : '#F59E0B15';

    return (
      <View style={[styles.holidayCard, { backgroundColor: theme.card }]}>
        <View style={styles.cardContent}>
          {/* Calendar Leaf Icon */}
          <View style={[styles.calendarLeaf, { backgroundColor: iconBg }]}>
            <View style={[styles.leafHeader, { backgroundColor: iconColor }]}>
              <Text style={styles.leafMonth}>{monthAbbr}</Text>
            </View>
            <View style={styles.leafBody}>
              <Text style={[styles.leafDay, { color: theme.text }]}>{dayNum}</Text>
            </View>
          </View>

          <View style={styles.holidayInfo}>
            <Text style={[styles.holidayDay, { color: theme.text }]}>{item.day}</Text>
            <Text style={[styles.holidayDate, { color: theme.secondary }]}>{item.date}</Text>
            {item.description && item.description !== item.day && (
              <View style={[styles.descBadge, { backgroundColor: theme.background }]}>
                <Ionicons name="information-circle-outline" size={12} color={theme.secondary} />
                <Text style={[styles.holidayDesc, { color: theme.secondary }]} numberOfLines={1}>
                  {item.description}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.typeIndicator, { backgroundColor: isWeekend ? '#3B82F6' : '#F59E0B' }]} />
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.secondary }]}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionDivider, { backgroundColor: theme.border + '50' }]} />
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrapper}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Company Holidays</Text>
          <Text style={[styles.headerSubtitle, { color: theme.secondary }]}>
            {totalHolidays} {totalHolidays === 1 ? 'day' : 'days'} scheduled for {selectedYear}
          </Text>
        </View>
      </View>

      {/* Year Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
          <Ionicons name="calendar-outline" size={20} color={theme.primary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search year (e.g. 2024)"
            placeholderTextColor={theme.secondary + '80'}
            value={yearInput}
            onChangeText={setYearInput}
            keyboardType="numeric"
            onSubmitEditing={handleYearSearch}
          />
          <TouchableOpacity onPress={handleYearSearch} style={[styles.goBtn, { backgroundColor: theme.primary }]}>
            <Ionicons name="search" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && totalHolidays === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader()}
        <View style={styles.centerSection}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.secondary }]}>Fetching holiday calendar...</Text>
        </View>
      </View>
    );
  }

  if (error && totalHolidays === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader()}
        <View style={styles.centerSection}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: theme.text }]}>{error}</Text>
          <TouchableOpacity onPress={() => fetchHolidays(selectedYear)} style={[styles.retryBtn, { backgroundColor: theme.primary }]}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SectionList
        sections={sections}
        renderItem={renderHolidayCard}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item, index) => `${item.date}-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconWrapper, { backgroundColor: theme.card }]}>
              <Ionicons name="calendar-outline" size={64} color={theme.border} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No holidays found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
              We couldn't find any scheduled holidays for the year {selectedYear}.
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
  headerContainer: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrapper: {
    flex: 1,
    marginLeft: 12,
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
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  goBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginRight: 12,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
  },
  holidayCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  calendarLeaf: {
    width: 52,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  leafHeader: {
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leafMonth: {
    color: 'white',
    fontSize: 9,
    fontWeight: '900',
  },
  leafBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leafDay: {
    fontSize: 20,
    fontWeight: '800',
  },
  holidayInfo: {
    flex: 1,
    marginLeft: 16,
  },
  holidayDay: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  holidayDate: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  descBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  holidayDesc: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  typeIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginLeft: 12,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
