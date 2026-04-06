import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { Colors } from '../constants/Theme';
import { apiService, ProfileDetailTabs } from '../services/api';

interface PersonalDetailsScreenProps {
  onBack: () => void;
}

export default function PersonalDetailsScreen({ onBack }: PersonalDetailsScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(true);
  const [profileDetailTabs, setProfileDetailTabs] = useState<ProfileDetailTabs | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPersonalDetails();
  }, []);

  const fetchPersonalDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProfileDetailTabs();

      if (response.message?.toLowerCase().includes('success')) {
        setProfileDetailTabs(response.data);
      } else {
        setError('Failed to fetch personal details');
      }
    } catch (err) {
      console.error('Error fetching profile detail tabs:', err);
      setError('Failed to fetch personal details');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const InfoRow = ({ label, value, icon, last = false }: { label: string; value: string | null | undefined; icon: string; last?: boolean }) => (
    <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
      <View style={[styles.infoIconWrapper, { backgroundColor: theme.primary + '10' }]}>
        <Ionicons name={icon as any} size={18} color={theme.primary} />
      </View>
      <View style={styles.infoTextWrapper}>
        <Text style={[styles.infoLabel, { color: theme.secondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.secondary }]}>Loading details...</Text>
      </View>
    );
  }

  if (error || !profileDetailTabs?.personal_details) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.text }]}>{error || 'Details not found'}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={fetchPersonalDetails}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { personal_details } = profileDetailTabs;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Premium Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Personal Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Section: Identity */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Identity</Text>
          </View>
          <InfoRow
            label="Date of Birth"
            value={formatDateForDisplay(personal_details.date_of_birth)}
            icon="calendar-outline"
          />
          <InfoRow
            label="Gender"
            value={personal_details.gender}
            icon="transgender-outline"
            last
          />
        </View>

        {/* Section: Contact */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Information</Text>
          </View>
          <InfoRow
            label="Personal Email"
            value={personal_details.personal_email}
            icon="mail-outline"
          />
          <InfoRow
            label="Cell Number"
            value={personal_details.cell_number}
            icon="phone-portrait-outline"
          />
          <InfoRow
            label="Current Address"
            value={personal_details.current_address}
            icon="location-outline"
            last
          />
        </View>

        {/* Section: Emergency */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, marginBottom: 40 }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Emergency Contacts</Text>
          </View>
          <InfoRow
            label="Contact Person"
            value={personal_details.person_to_be_contacted}
            icon="people-outline"
          />
          <InfoRow
            label="Emergency Phone"
            value={personal_details.emergency_phone_number}
            icon="alert-circle-outline"
            last
          />
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scroll: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  sectionCard: {
    margin: 20,
    marginBottom: 0,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
});

