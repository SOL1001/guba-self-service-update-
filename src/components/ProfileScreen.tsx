import { Colors } from '../constants/Theme';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
  Modal,
  StyleSheet,
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { UserProfile, apiService, EmployeeProfile } from '../services/api';
import { StorageService } from '../services/storage';

interface ProfileScreenProps {
  userProfile: UserProfile;
  onLogout: () => void;
  onNavigateToPersonalDetails?: () => void;
  onNavigateToChangePassword?: () => void;
}

export default function ProfileScreen({
  userProfile,
  onLogout,
  onNavigateToPersonalDetails,
  onNavigateToChangePassword
}: ProfileScreenProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [profileData, setProfileData] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!profileData) {
      loadProfile();
    }
  }, []);

  const loadProfile = async () => {
    if (profileData || hasFetchedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const storedProfile = await StorageService.getEmployeeProfile();
      if (storedProfile) {
        setProfileData(storedProfile);
        setLoading(false);
      }

      try {
        const response = await apiService.getProfile();
        if (response.message === 'Profile get successfully') {
          setProfileData(response.data);
          await StorageService.storeEmployeeProfile(response.data);
          hasFetchedRef.current = true;
        }
      } catch (err) {
        console.error('Error fetching profile from API:', err);
        if (!storedProfile) {
          setError('Failed to fetch profile. Please check your connection.');
        }
        hasFetchedRef.current = true;
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      const storedProfile = await StorageService.getEmployeeProfile();
      if (!storedProfile) setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (forceRefresh: boolean = false) => {
    try {
      if (!forceRefresh) setLoading(true);
      setError(null);
      const response = await apiService.getProfile();
      if (response.message === 'Profile get successfully') {
        setProfileData(response.data);
        await StorageService.storeEmployeeProfile(response.data);
        hasFetchedRef.current = true;
      } else {
        setError('Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      const storedProfile = await StorageService.getEmployeeProfile();
      if (storedProfile) {
        setProfileData(storedProfile);
        setError(null);
      } else {
        setError('Failed to fetch profile. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = apiService.getBaseUrl();
    return imagePath.startsWith('/') ? `${baseUrl}${imagePath}` : `${baseUrl}/${imagePath}`;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return dateString;
  };

  const showModalMessage = (type: 'success' | 'error', message: string) => {
    setModalType(type);
    setModalMessage(message);
    setShowModal(true);
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showModalMessage('error', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      showModalMessage('error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadProfilePicture = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setUploading(true);
      const fileUri = asset.uri;
      const fileName = asset.fileName || `profile_${Date.now()}.jpg`;
      const fileType = asset.type === 'image' ? `image/${asset.uri.split('.').pop() || 'jpeg'}` : 'image/jpeg';

      const response = await apiService.updateProfilePicture(fileUri, fileName, fileType);
      if (response.message) {
        showModalMessage('success', response.message || 'Profile picture updated successfully!');
        await fetchProfile();
      } else {
        showModalMessage('error', 'Failed to update profile picture');
      }
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      showModalMessage('error', 'Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: onLogout },
    ]);
  };

  if (loading && !profileData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.secondary }]}>Loading your profile...</Text>
      </View>
    );
  }

  const InfoRow = ({ label, value, icon, color }: { label: string, value: string, icon: any, color: string }) => (
    <View style={styles.infoRow}>
      <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: theme.secondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Dynamic Header Background */}
      <View style={[styles.headerBg, { backgroundColor: theme.primary }]} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.bodyBackgroundColor || theme.background }]}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <TouchableOpacity onPress={handleImagePicker} activeOpacity={0.9} style={styles.avatarWrapper}>
            <View style={[styles.avatarContainer, { borderColor: theme.card }]}>
              {uploading ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : profileData?.employee_image ? (
                <Image source={{ uri: getImageUrl(profileData.employee_image) || '' }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.background }]}>
                  <Ionicons name="person" size={48} color={theme.secondary} />
                </View>
              )}
            </View>
            <View style={[styles.cameraIcon, { backgroundColor: theme.primary }]}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>

          <Text style={[styles.name, { color: theme.text }]}>
            {profileData?.employee_name || userProfile.full_name}
          </Text>
          <Text style={[styles.designation, { color: theme.secondary }]}>
            {profileData?.designation || 'Team Member'}
          </Text>
        </View>

        {/* Info Sections */}
        <View style={styles.sectionsContainer}>
          <SectionHeader title="Work Information" />
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <InfoRow label="Employee ID" value={profileData?.name || userProfile.employee_id} icon="id-card-outline" color="#3B82F6" />
            <View style={styles.divider} />
            <InfoRow label="Joining Date" value={formatDate(profileData?.date_of_joining)} icon="calendar-outline" color="#10B981" />
          </View>

          <SectionHeader title="Personal Details" />
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <InfoRow label="Date of Birth" value={formatDate(profileData?.date_of_birth)} icon="gift-outline" color="#EC4899" />
            <View style={styles.divider} />
            <InfoRow label="Gender" value={profileData?.gender || 'N/A'} icon="person-outline" color="#8B5CF6" />
          </View>

          <SectionHeader title="Contact Information" />
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <InfoRow label="Business Email" value={profileData?.company_email || userProfile.user} icon="mail-outline" color="#EF4444" />
            <View style={styles.divider} />
            <InfoRow label="Personal Email" value={profileData?.personal_email || 'N/A'} icon="at-outline" color="#F59E0B" />
            <View style={styles.divider} />
            <InfoRow label="Phone Number" value={profileData?.cell_number || 'N/A'} icon="call-outline" color="#06B6D4" />
            <View style={styles.divider} />
            <InfoRow label="Emergency Contact" value={profileData?.emergency_phone_number || 'N/A'} icon="alert-circle-outline" color="#EF4444" />
          </View>

          {/* Action Settings */}
          <SectionHeader title="Settings" />
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.card }]}
            onPress={onNavigateToChangePassword}
          >
            <View style={styles.actionBtnLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#6366F115' }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#6366F1" />
              </View>
              <Text style={[styles.actionBtnText, { color: theme.text }]}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.card }]}
            onPress={onNavigateToPersonalDetails}
          >
            <View style={styles.actionBtnLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#10B98115' }]}>
                <Ionicons name="document-text-outline" size={20} color="#10B981" />
              </View>
              <Text style={[styles.actionBtnText, { color: theme.text }]}>Personal Details</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.secondary} />
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="white" />
            <Text style={styles.logoutBtnText}>Logout from Account</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Result Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Ionicons
              name={modalType === 'success' ? "checkmark-circle" : "close-circle"}
              size={64}
              color={modalType === 'success' ? "#10B981" : "#EF4444"}
              style={{ marginBottom: 16 }}
            />
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {modalType === 'success' ? 'Successful' : 'Error'}
            </Text>
            <Text style={[styles.modalMessage, { color: theme.secondary }]}>{modalMessage}</Text>
            <TouchableOpacity style={[styles.modalAction, { backgroundColor: theme.primary }]} onPress={() => setShowModal(false)}>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  scrollContent: {
    paddingTop: 60,
  },
  profileCard: {
    marginHorizontal: 20,
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
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
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  designation: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  sectionsContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginLeft: 4,
  },
  infoCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginHorizontal: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logoutBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 10,
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
  modalAction: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
});
