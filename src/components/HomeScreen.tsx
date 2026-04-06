import { Colors } from '../constants/Theme';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator,
  Modal,
  StyleSheet,
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { UserProfile, apiService, Task } from '../services/api';
import { StorageService } from '../services/storage';

interface HomeScreenProps {
  userProfile: UserProfile;
  onLogout: () => void;
  onNavigateToTasks?: () => void;
  onNavigateToLeaves?: () => void;
  onNavigateToExpenses?: () => void;
  onNavigateToAttendance?: () => void;
  onNavigateToSalary?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToManager?: () => void;
  onNavigateToVisits?: () => void;
  onNavigateToIssues?: () => void;
  onNavigateToHolidays?: () => void;
  onNavigateToDocuments?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToPettyExpense?: () => void;
  onNavigateToPayment?: () => void;
  onNavigateToEmployees?: () => void;
  onNavigateToCustomers?: () => void;
  onNavigateToCRM?: () => void;
  onNavigateToProperty?: () => void;
  onTaskPress?: (task: Task) => void;
}

export default function HomeScreen({
  userProfile,
  onLogout,
  onNavigateToTasks,
  onNavigateToLeaves,
  onNavigateToExpenses,
  onNavigateToAttendance,
  onNavigateToSalary,
  onNavigateToNotifications,
  onNavigateToOrders,
  onNavigateToManager,
  onNavigateToVisits,
  onNavigateToIssues,
  onNavigateToHolidays,
  onNavigateToDocuments,
  onNavigateToDashboard,
  onNavigateToPettyExpense,
  onNavigateToPayment,
  onNavigateToEmployees,
  onNavigateToCustomers,
  onNavigateToCRM,
  onNavigateToProperty,
  onTaskPress
}: HomeScreenProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkOutTime, setCheckOutTime] = useState('09:00 AM');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileImage();
    fetchTasks();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchProfileImage = async () => {
    try {
      if (userProfile.employee_image) {
        setProfileImage(userProfile.employee_image);
      } else {
        const storedProfile = await StorageService.getEmployeeProfile();
        if (storedProfile?.employee_image) {
          setProfileImage(storedProfile.employee_image);
        } else {
          const response = await apiService.getProfile();
          if (response.data?.employee_image) {
            setProfileImage(response.data.employee_image);
            await StorageService.storeEmployeeProfile(response.data);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      const response = await apiService.getTaskList();
      setTasks(response.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = apiService.getBaseUrl();
    return imagePath.startsWith('/') ? `${baseUrl}${imagePath}` : `${baseUrl}/${imagePath}`;
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const getRealTimeDisplay = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const showModalMessage = (type: 'success' | 'error', message: string) => {
    setModalType(type);
    setModalMessage(message);
    setShowModal(true);
  };

  const handleCheckIn = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showModalMessage('error', 'Location permission required to check in.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const response = await apiService.createEmployeeLog({
        log_type: isCheckedIn ? 'OUT' : 'IN',
        location: JSON.stringify({ latitude: location.coords.latitude, longitude: location.coords.longitude }),
      });

      if (response.message === 'Employee log added' || response.message.includes('successful')) {
        setIsCheckedIn(!isCheckedIn);
        setCheckOutTime(getRealTimeDisplay());
        showModalMessage('success', isCheckedIn ? 'Check-out successful!' : 'Check-in successful!');
      } else {
        showModalMessage('error', response.message || 'Check-in failed');
      }
    } catch (error) {
      showModalMessage('error', 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const ActionCard = ({ title, icon, color, onPress }: { title: string, icon: any, color: string, onPress?: () => void }) => (
    <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.card }]} onPress={onPress}>
      <View style={[styles.actionIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.actionText, { color: theme.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  const ListItem = ({ title, icon, color, onPress, style }: { title: string, icon: any, color: string, onPress?: () => void, style?: any }) => (
    <TouchableOpacity style={[styles.listItem, { backgroundColor: theme.card }, style]} onPress={onPress}>
      <View style={styles.listItemLeft}>
        <View style={[styles.listIconContainer, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={[styles.listItemText, { color: theme.text }]}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.secondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.logoBox, { backgroundColor: theme.primary }]}>
            <Ionicons name="arrow-up" size={18} color="white" />
          </View>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>GUBA</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="refresh-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onNavigateToNotifications}>
            <Ionicons name="notifications-outline" size={24} color={theme.primary} />
            <View style={[styles.badge, { backgroundColor: '#8B5CF6' }]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.bodyBackgroundColor }]}>
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View style={styles.profileRow}>
            <View style={styles.profileInfo}>
              <Text style={[styles.greeting, { color: theme.secondary }]}>{getGreeting()}</Text>
              <Text style={[styles.fullName, { color: theme.text }]}>{userProfile.full_name}!</Text>
              <Text style={[styles.statusSub, { color: theme.secondary }]}>
                {isCheckedIn ? 'Checked in at' : 'Checked out at'}
              </Text>
              <Text style={[styles.statusTime, { color: theme.primary }]}>{getRealTimeDisplay()}</Text>
            </View>
            <View style={styles.avatarContainer}>
              {profileImage ? (
                <Image source={{ uri: getImageUrl(profileImage) || '' }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.background }]}>
                  <Ionicons name="person" size={32} color={theme.secondary} />
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.checkInBtn, { borderColor: theme.border, backgroundColor: theme.background }]}
            onPress={handleCheckIn}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator size="small" color={theme.primary} /> : (
              <>
                <Text style={[styles.checkInText, { color: theme.text }]}>{isCheckedIn ? 'Checked In' : 'Check In'}</Text>
                {!isCheckedIn && (
                  <View style={[styles.checkCircle, { backgroundColor: '#10B981' }]}>
                    <Ionicons name="arrow-down" size={12} color="white" />
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <ListItem title="Personal Details" icon="git-branch-outline" color="#3B82F6" onPress={onNavigateToDashboard} />
          <ListItem title="ToDo" icon="document-text-outline" color="#3B82F6" onPress={onNavigateToTasks} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Task</Text>
          <TouchableOpacity onPress={onNavigateToTasks} style={styles.viewAll}>
            <Text style={{ color: theme.primary, fontWeight: '600', marginRight: 4 }}>View all</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Horizontal Task Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.taskScroll}
          contentContainerStyle={{ paddingRight: 32 }}
        >
          {tasksLoading ? (
            <ActivityIndicator style={{ padding: 20 }} color={theme.primary} />
          ) : tasks.length > 0 ? (
            tasks.slice(0, 5).map((task) => (
              <TouchableOpacity
                key={task.name}
                style={[styles.taskCard, { backgroundColor: theme.card }]}
                onPress={() => onTaskPress?.(task)}
              >
                <View style={styles.taskStatusRow}>
                  <View style={[styles.statusBadge, { backgroundColor: task.status.toLowerCase() === 'completed' ? '#10B98120' : '#3B82F620' }]}>
                    <Text style={{ color: task.status.toLowerCase() === 'completed' ? '#10B981' : '#3B82F6', fontSize: 10, fontWeight: '700' }}>{task.status}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: task.priority.toLowerCase() === 'high' ? '#EF444420' : '#F59E0B20' }]}>
                    <Text style={{ color: task.priority.toLowerCase() === 'high' ? '#EF4444' : '#F59E0B', fontSize: 10, fontWeight: '700' }}>{task.priority}</Text>
                  </View>
                </View>
                <Text style={[styles.taskTitle, { color: theme.text }]} numberOfLines={1}>{task.subject}</Text>
                <Text style={[styles.taskDesc, { color: theme.secondary }]} numberOfLines={2}>{task.description || 'No description'}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressInner, { width: `${task.progress}%`, backgroundColor: theme.primary }]} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.emptyTasks, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="document-text-outline" size={40} color={theme.secondary} />
              <Text style={{ color: theme.secondary, marginTop: 10 }}>No tasks found</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>What would you like to do?</Text>
          <TouchableOpacity style={styles.gridIcon}>
            <Ionicons name="grid" size={16} color={theme.secondary} />
          </TouchableOpacity>
        </View>

        {/* Horizontal Action Grid */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.gridScroll}
          contentContainerStyle={styles.gridContainerStyle}
        >
          <View style={styles.gridColumn}>
            <ActionCard title="Expense" icon="wallet" color="#F59E0B" onPress={onNavigateToExpenses} />
            <ActionCard title="Holiday" icon="calendar" color="#EC4899" onPress={onNavigateToHolidays} />
            <ActionCard title="Orders" icon="list" color="#3B82F6" onPress={onNavigateToOrders} />
          </View>
          <View style={styles.gridColumn}>
            <ActionCard title="Leave" icon="bed" color="#10B981" onPress={onNavigateToLeaves} />
            <ActionCard title="Attendance" icon="calendar" color="#8B5CF6" onPress={onNavigateToAttendance} />
            <ActionCard title="Visit" icon="person-add" color="#F59E0B" onPress={onNavigateToVisits} />
          </View>
          <View style={styles.gridColumn}>
            <ActionCard title="Salary" icon="mail" color="#6366F1" onPress={onNavigateToSalary} />
            <ActionCard title="Manager" icon="swap-vertical" color="#06B6D4" onPress={onNavigateToManager} />
            <ActionCard title="Payment" icon="card" color="#EC4899" onPress={onNavigateToPayment} />
          </View>
          <View style={styles.gridColumn}>
            <ActionCard title="Issues" icon="alert-circle" color="#EF4444" onPress={onNavigateToIssues} />
            <ActionCard title="Petty Exp." icon="phone-portrait" color="#10B981" onPress={onNavigateToPettyExpense} />
            <ActionCard title="Document" icon="document-text" color="#6B7280" onPress={onNavigateToDocuments} />
          </View>
          <View style={styles.gridColumn}>
            <ActionCard title="CRM" icon="people" color="#8B5CF6" onPress={onNavigateToCRM} />
            <ActionCard title="Property" icon="home" color="#EC4899" onPress={onNavigateToProperty} />
          </View>
        </ScrollView>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 16, marginTop: 8 }]}>Other Informations</Text>
          <ListItem title="Employees" icon="people-outline" color="#3B82F6" onPress={onNavigateToEmployees} />
          <ListItem title="Customers" icon="business-outline" color="#3B82F6" onPress={onNavigateToCustomers} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal Overlay */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalIconBox, { backgroundColor: modalType === 'success' ? '#10B98120' : '#EF444420' }]}>
              <Ionicons
                name={modalType === 'success' ? "checkmark-circle" : "close-circle"}
                size={48}
                color={modalType === 'success' ? "#10B981" : "#EF4444"}
              />
            </View>
            <Text style={[styles.modalTitle, { color: modalType === 'success' ? '#10B981' : '#EF4444' }]}>
              {modalType === 'success' ? 'Success!' : 'Error'}
            </Text>
            <Text style={[styles.modalMessage, { color: theme.secondary }]}>{modalMessage}</Text>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.primary }]} onPress={() => setShowModal(false)}>
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    // paddingVertical: 12,
    // borderBottomWidth: 1,
    paddingBottom: 12,
    borderBottomColor: 'rgba(0,0,0,0.02)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileCard: {
    margin: 16,
    borderRadius: 30,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '400',
  },
  fullName: {
    fontSize: 28,
    fontWeight: '800',
    marginVertical: 2,
  },
  statusSub: {
    fontSize: 13,
    marginTop: 8,
  },
  statusTime: {
    fontSize: 18,
    fontWeight: '700',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  checkInText: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskScroll: {
    paddingLeft: 16,
  },
  taskCard: {
    width: 280,
    padding: 20,
    borderRadius: 24,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  taskStatusRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  taskDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressInner: {
    height: '100%',
    borderRadius: 2,
  },
  emptyTasks: {
    width: 280,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  gridScroll: {
    paddingLeft: 16,
  },
  gridContainerStyle: {
    paddingRight: 32,
    paddingVertical: 4,
  },
  gridColumn: {
    marginRight: 16,
    width: 110,
  },
  actionCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
  },
  modalIconBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
});
