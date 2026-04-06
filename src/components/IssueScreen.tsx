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
import { apiService, Issue } from '../services/api';

interface IssueScreenProps {
  onBack: () => void;
}

export default function IssueScreen({ onBack }: IssueScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getIssueList();

      if (response && response.data && Array.isArray(response.data)) {
        if (response.message?.toLowerCase().includes('success')) {
          setIssues(response.data);
        } else {
          setError(response.message || 'Failed to fetch issues');
        }
      } else {
        setError('No data received from service');
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
      setError('Connection Error. Please check your internet.');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: { [key: string]: { color: string; bg: string; icon: string } } = {
    open: { color: '#3B82F6', bg: '#3B82F615', icon: 'radio-button-on-outline' },
    closed: { color: '#10B981', bg: '#10B98115', icon: 'checkmark-circle-outline' },
    resolved: { color: '#8B5CF6', bg: '#8B5CF615', icon: 'sparkles-outline' },
    'on hold': { color: '#F59E0B', bg: '#F59E0B15', icon: 'pause-circle-outline' },
    default: { color: '#6B7280', bg: '#6B728015', icon: 'help-circle-outline' }
  };

  const priorityConfig: { [key: string]: { color: string; bg: string } } = {
    high: { color: '#EF4444', bg: '#EF444415' },
    medium: { color: '#F97316', bg: '#F9731615' },
    low: { color: '#10B981', bg: '#10B98115' },
    default: { color: '#6B7280', bg: '#6B728015' }
  };

  const getStatusStyle = (status: string) => statusConfig[status.toLowerCase()] || statusConfig.default;
  const getPriorityStyle = (priority: string) => priorityConfig[priority.toLowerCase()] || priorityConfig.default;

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

  const renderIssueCard = ({ item }: { item: Issue }) => {
    const status = getStatusStyle(item.status);
    const priority = getPriorityStyle(item.priority);

    return (
      <View style={[styles.issueCard, { backgroundColor: theme.card }]}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.titleWrapper}>
            <Text style={[styles.issueSubject, { color: theme.text }]} numberOfLines={2}>
              {item.subject || 'No Subject'}
            </Text>
            <Text style={[styles.issueName, { color: theme.secondary }]}>{item.name}</Text>
          </View>
          <View style={styles.badgeColumn}>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Ionicons name={status.icon as any} size={12} color={status.color} style={{ marginRight: 4 }} />
              <Text style={[styles.badgeText, { color: status.color }]}>{item.status}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: priority.bg, marginTop: 6 }]}>
              <View style={[styles.dot, { backgroundColor: priority.color }]} />
              <Text style={[styles.badgeText, { color: priority.color }]}>{item.priority} Priority</Text>
            </View>
          </View>
        </View>

        {/* Bento Metadata Section */}
        <View style={[styles.metadataContainer, { backgroundColor: theme.background + '50' }]}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <View style={[styles.metaIcon, { backgroundColor: '#3B82F615' }]}>
                <Ionicons name="person-outline" size={14} color="#3B82F6" />
              </View>
              <View>
                <Text style={[styles.metaLabel, { color: theme.secondary }]}>RAISED BY</Text>
                <Text style={[styles.metaValue, { color: theme.text }]}>{item.raised_by}</Text>
              </View>
            </View>

            <View style={styles.metaItem}>
              <View style={[styles.metaIcon, { backgroundColor: '#10B98115' }]}>
                <Ionicons name="calendar-outline" size={14} color="#10B981" />
              </View>
              <View>
                <Text style={[styles.metaLabel, { color: theme.secondary }]}>OPENED ON</Text>
                <Text style={[styles.metaValue, { color: theme.text }]}>{formatDate(item.opening_date)}</Text>
              </View>
            </View>
          </View>

          {item.contact && (
            <View style={[styles.metaRow, { marginTop: 12, borderTopWidth: 1, borderTopColor: theme.border + '20', paddingTop: 12 }]}>
              <View style={styles.metaItem}>
                <View style={[styles.metaIcon, { backgroundColor: '#F59E0B15' }]}>
                  <Ionicons name="call-outline" size={14} color="#F59E0B" />
                </View>
                <View>
                  <Text style={[styles.metaLabel, { color: theme.secondary }]}>CONTACT</Text>
                  <Text style={[styles.metaValue, { color: theme.text }]}>{item.contact}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Description */}
        {item.description && (
          <View style={[styles.descriptionSection, { borderTopColor: theme.border + '30' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={16} color={theme.secondary} />
              <Text style={[styles.sectionTitle, { color: theme.secondary }]}>Description</Text>
            </View>
            <Text style={[styles.descriptionText, { color: theme.text }]}>{item.description}</Text>
          </View>
        )}

        {/* Agreement Status */}
        {item.agreement_status && (
          <View style={[styles.agreementSection, { backgroundColor: theme.primary + '08' }]}>
            <Ionicons name="shield-checkmark-outline" size={16} color={theme.primary} />
            <Text style={[styles.agreementText, { color: theme.primary }]}>
              Agreement: <Text style={{ fontWeight: '800' }}>{item.agreement_status}</Text>
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { borderBottomColor: theme.border }]}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={28} color={theme.primary} />
      </TouchableOpacity>
      <View style={styles.headerTitleWrapper}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Support Issues</Text>
        <Text style={[styles.headerSubtitle, { color: theme.secondary }]}>
          {issues.length} {issues.length === 1 ? 'ticket' : 'tickets'} active
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.refreshBtn, { backgroundColor: theme.primary + '10' }]}
        onPress={fetchIssues}
      >
        <Ionicons name="refresh" size={20} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader()}
        <View style={styles.centerSection}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.secondary }]}>Syncing your tickets...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader()}
        <View style={styles.centerSection}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: theme.text }]}>{error}</Text>
          <TouchableOpacity onPress={fetchIssues} style={[styles.retryBtn, { backgroundColor: theme.primary }]}>
            <Text style={styles.retryText}>Retry sync</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {renderHeader()}

      {issues.length === 0 ? (
        <View style={styles.centerSection}>
          <View style={[styles.emptyIconWrapper, { backgroundColor: theme.card }]}>
            <Ionicons name="ticket-outline" size={48} color={theme.border} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>All clear!</Text>
          <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
            No active support issues were found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={issues}
          renderItem={renderIssueCard}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  headerTitleWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 20,
    paddingBottom: 100,
  },
  issueCard: {
    marginHorizontal: 16,
    marginBottom: 20,
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
  titleWrapper: {
    flex: 1,
    marginRight: 12,
  },
  issueSubject: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  issueName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  badgeColumn: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  metadataContainer: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
  descriptionSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  agreementSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  agreementText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
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
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
