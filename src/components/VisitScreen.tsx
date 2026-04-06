import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
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
import { apiService, Visit } from '../services/api';

interface VisitScreenProps {
  onBack: () => void;
  onNavigateToNewVisit?: () => void;
}

export default function VisitScreen({ onBack, onNavigateToNewVisit }: VisitScreenProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const isDark = colorScheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const response = await apiService.getVisitList();

      if (response && response.data && Array.isArray(response.data)) {
        const message = response.message || '';
        const isSuccess = message.toLowerCase().includes('success');

        if (isSuccess) {
          setVisits(response.data);
        } else {
          // Treat as no data as per UX standard
          setVisits([]);
        }
      } else {
        // Treat 500/Connection error as "no data"
        setVisits([]);
      }
    } catch (err) {
      console.error('Error fetching visits:', err);
      // Treat 500/Connection error as "no data"
      setVisits([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVisits();
  };

  const formatDate = (dateString: string) => dateString;
  const formatTime = (timeString: string) => timeString;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter(v => v.date === todayStr).length;

  const renderVisitCard = ({ item, index }: { item: Visit, index: number }) => {
    return (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
        <TouchableOpacity
          style={[styles.visitCard, { backgroundColor: theme.card }]}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.avatarBox, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="person" size={24} color={theme.primary} />
            </View>
            <View style={styles.visitMainInfo}>
              <Text style={[styles.customerName, { color: theme.text }]} numberOfLines={1}>
                {item.customer_name}
              </Text>
              <Text style={[styles.visitId, { color: theme.secondary }]}>{item.name}</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: theme.background }]}>
              <Text style={[styles.typeText, { color: theme.primary }]}>{item.visit_type}</Text>
            </View>
          </View>

          <View style={[styles.metadataContainer, { backgroundColor: theme.background }]}>
            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <View style={[styles.metaIcon, { backgroundColor: '#3B82F615' }]}>
                  <Ionicons name="calendar-outline" size={14} color="#3B82F6" />
                </View>
                <View>
                  <Text style={[styles.metaLabel, { color: theme.secondary }]}>SCHEDULE</Text>
                  <Text style={[styles.metaValue, { color: theme.text }]}>{formatDate(item.date)}</Text>
                </View>
              </View>
              <View style={styles.metaItem}>
                <View style={[styles.metaIcon, { backgroundColor: '#10B98115' }]}>
                  <Ionicons name="time-outline" size={14} color="#10B981" />
                </View>
                <View>
                  <Text style={[styles.metaLabel, { color: theme.secondary }]}>CHECK-IN</Text>
                  <Text style={[styles.metaValue, { color: theme.text }]}>{formatTime(item.time)}</Text>
                </View>
              </View>
            </View>

            {item.description && (
              <View style={[styles.descriptionArea, { borderTopColor: theme.border + '20' }]}>
                <View style={styles.descTitleRow}>
                  <Ionicons name="document-text-outline" size={14} color={theme.secondary} />
                  <Text style={[styles.descTitle, { color: theme.secondary }]}>PURPOSE OF VISIT</Text>
                </View>
                <Text style={[styles.descriptionText, { color: theme.text }]} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.cardFooter, { borderTopColor: theme.border + '15' }]}>
            <Text style={[styles.footerLink, { color: theme.primary }]}>View Detailed Report</Text>
            <Ionicons name="arrow-forward" size={16} color={theme.primary} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <SafeAreaView>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleArea}>
            <Text style={[styles.headerSubtitle, { color: theme.secondary }]}>FIELD OPERATIONS</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Visits & Surveys</Text>
          </View>
          {onNavigateToNewVisit && (
            <TouchableOpacity
              onPress={onNavigateToNewVisit}
              style={[styles.addBtn, { backgroundColor: theme.primary }]}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <View style={styles.bentoStats}>
        <View style={[styles.statCard, { backgroundColor: theme.card, flex: 1.2 }]}>
          <View style={[styles.statIconBox, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="location-outline" size={24} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.statValue, { color: theme.text }]}>{visits.length}</Text>
            <Text style={[styles.statLabel, { color: theme.secondary }]}>Total Visits</Text>
          </View>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card, flex: 1 }]}>
          <View style={[styles.statIconBox, { backgroundColor: '#10B98115' }]}>
            <Ionicons name="today-outline" size={22} color="#10B981" />
          </View>
          <View>
            <Text style={[styles.statValue, { color: theme.text }]}>{todayVisits}</Text>
            <Text style={[styles.statLabel, { color: theme.secondary }]}>Scheduled Today</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <FlatList
        data={visits}
        renderItem={renderVisitCard}
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
                <Ionicons name="map-outline" size={64} color={theme.border} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No visits found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
                {visits.length === 0
                  ? "You haven't recorded any field visits yet. Tap the '+' to add one."
                  : "Syncing your records..."}
              </Text>
              {onNavigateToNewVisit && (
                <TouchableOpacity
                  onPress={onNavigateToNewVisit}
                  style={[styles.createBtn, { backgroundColor: theme.primary }]}
                >
                  <Text style={styles.createBtnText}>Schedule Visit</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          ) : (
            <View style={styles.centerSection}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.secondary }]}>Mapping visits...</Text>
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
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
  visitCard: {
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
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  visitMainInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  visitId: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metadataContainer: {
    padding: 20,
    borderRadius: 24,
    gap: 20,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 24,
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
  descriptionArea: {
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  descTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  descTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 6,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '800',
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
  createBtn: {
    marginTop: 32,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  createBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
  },
});
