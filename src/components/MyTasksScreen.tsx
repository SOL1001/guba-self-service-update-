import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { Colors } from '../constants/Theme';
import { apiService, Task } from '../services/api';

import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

interface MyTasksScreenProps {
  onBack: () => void;
  onTaskPress?: (task: Task) => void;
}

export default function MyTasksScreen({ onBack, onTaskPress }: MyTasksScreenProps) {
  const { userProfile } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [activeTab, setActiveTab] = useState('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'all', label: 'All Tasks', icon: 'list-outline' },
    { id: 'created', label: 'Created', icon: 'create-outline' },
  ];

  useEffect(() => {
    fetchTasks();
  }, []);

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('/')) {
      const baseUrl = apiService.getBaseUrl();
      if (baseUrl) {
        return `${baseUrl}${imagePath}`;
      }
    }
    return imagePath;
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTaskList();
      setTasks(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      // Treat 500/Connection errors as "no data"
      setTasks([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return { color: '#EF4444', icon: 'alert-circle' };
      case 'medium':
        return { color: '#F59E0B', icon: 'alert' };
      case 'low':
        return { color: '#10B981', icon: 'information-circle' };
      default:
        return { color: '#6B7280', icon: 'help-circle' };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'overdue':
        return { color: '#EF4444', label: 'Overdue' };
      case 'completed':
        return { color: '#10B981', label: 'Completed' };
      case 'open':
        return { color: '#3B82F6', label: 'Open' };
      case 'in progress':
        return { color: '#F59E0B', label: 'In Progress' };
      default:
        return { color: '#6B7280', label: status };
    }
  };

  const filteredTasks = () => {
    switch (activeTab) {
      case 'created':
        return tasks.filter(task => task.assigned_by.user === userProfile?.user);
      default:
        return tasks;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View
        style={[styles.header, { borderBottomColor: theme.border }]}
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Work Tasks</Text>
          <Text style={[styles.headerSubtitle, { color: theme.secondary }]}>
            {tasks.length} active assignments
          </Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Modern Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: theme.background }]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabItem,
                isActive && { borderBottomColor: theme.primary }
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={tab.icon as any}
                  size={18}
                  color={isActive ? theme.primary : theme.secondary}
                  style={{ marginRight: 8 }}
                />
                <Text style={[
                  styles.tabLabel,
                  { color: isActive ? theme.primary : theme.secondary }
                ]}>
                  {tab.label}
                </Text>
              </View>
              {isActive && (
                <View
                  style={[styles.activeIndicator, { backgroundColor: theme.primary }]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Task List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.statusText, { color: theme.secondary }]}>Syncing tasks...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="cloud-offline-outline" size={64} color={theme.error} />
            <Text style={[styles.errorTitle, { color: theme.text }]}>Network Error</Text>
            <Text style={[styles.errorSubtitle, { color: theme.secondary }]}>{error}</Text>
            <TouchableOpacity onPress={fetchTasks} style={[styles.retryButton, { backgroundColor: theme.primary }]}>
              <Text style={styles.retryText}>Retry Sync</Text>
            </TouchableOpacity>
          </View>
        ) : filteredTasks().length === 0 ? (
          <View style={styles.centerContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.primary + '10' }]}>
              <Ionicons name="document-text-outline" size={48} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Tasks Today</Text>
            <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
              Take a breath! You're all caught up with your assignments.
            </Text>
          </View>
        ) : (
          filteredTasks().map((task, index) => {
            const priority = getPriorityInfo(task.priority);
            const status = getStatusInfo(task.status);

            return (
              <View
                key={task.name}
              >
                <TouchableOpacity
                  style={[styles.taskCard, { backgroundColor: theme.card, shadowColor: isDark ? '#000' : theme.primary }]}
                  onPress={() => onTaskPress?.(task)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.tagsContainer}>
                      <View style={[styles.statusTag, { backgroundColor: status.color + '15' }]}>
                        <Text style={[styles.statusTextSmall, { color: status.color }]}>{status.label}</Text>
                      </View>
                      <View style={[styles.priorityTag, { backgroundColor: priority.color + '15' }]}>
                        <Ionicons name={priority.icon as any} size={12} color={priority.color} style={{ marginRight: 4 }} />
                        <Text style={[styles.priorityText, { color: priority.color }]}>{task.priority}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.icon} />
                  </View>

                  <Text style={[styles.taskSubject, { color: theme.text }]} numberOfLines={2}>
                    {task.subject}
                  </Text>

                  <View style={styles.projectIdRow}>
                    <Ionicons name="briefcase-outline" size={14} color={theme.secondary} />
                    <Text style={[styles.taskId, { color: theme.secondary }]}>{task.name}</Text>
                  </View>

                  {task.description && (
                    <Text style={[styles.taskDesc, { color: theme.secondary }]} numberOfLines={2}>
                      {task.description}
                    </Text>
                  )}

                  {/* Progress View */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={[styles.progressLabel, { color: theme.text }]}>Completion</Text>
                      <Text style={[styles.progressValue, { color: theme.primary }]}>{task.progress}%</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#2D3748' : '#EDF2F7' }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${task.progress}%`, backgroundColor: theme.primary }
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.cardFooter}>
                    <View style={styles.footerInfo}>
                      {task.exp_end_date && (
                        <View style={styles.footerItem}>
                          <Ionicons name="time-outline" size={14} color={theme.secondary} />
                          <Text style={[styles.footerText, { color: theme.secondary }]}>{task.exp_end_date}</Text>
                        </View>
                      )}
                      <View style={styles.footerItem}>
                        <Ionicons name="chatbubbles-outline" size={14} color={theme.secondary} />
                        <Text style={[styles.footerText, { color: theme.secondary }]}>{task.num_comments}</Text>
                      </View>
                    </View>

                    <View style={styles.avatarStack}>
                      {task.assigned_to.slice(0, 3).map((user, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.stackedAvatar,
                            {
                              marginLeft: idx === 0 ? 0 : -12,
                              zIndex: 10 - idx,
                              borderColor: theme.card
                            }
                          ]}
                        >
                          {getImageUrl(user.user_image) ? (
                            <Image source={{ uri: getImageUrl(user.user_image)! }} style={styles.avatarImage} />
                          ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                              <Text style={styles.avatarInitial}>{user.full_name.charAt(0)}</Text>
                            </View>
                          )}
                        </View>
                      ))}
                      {task.assigned_to.length > 3 && (
                        <View style={[styles.moreAvatar, { backgroundColor: theme.secondary + '20' }]}>
                          <Text style={[styles.moreText, { color: theme.secondary }]}>+{task.assigned_to.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.creatorRow}>
                    <Ionicons name="person-circle-outline" size={16} color={theme.icon} />
                    <Text style={[styles.creatorText, { color: theme.secondary }]}>
                      By <Text style={{ fontWeight: '700' }}>{task.assigned_by.full_name}</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    // height: Platform.OS === 'ios' ? 110 : 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '60%',
    height: 3,
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  statusText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 20,
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  taskCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  statusTextSmall: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  priorityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  taskSubject: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  projectIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  taskId: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  taskDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerInfo: {
    flex: 1,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  moreAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreText: {
    fontSize: 10,
    fontWeight: '700',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
  },
  creatorText: {
    fontSize: 11,
    marginLeft: 6,
  },
});
