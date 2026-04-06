import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '../constants/Theme';
import { apiService, VisitType } from '../services/api';

interface NewVisitScreenProps {
  onBack: () => void;
  onVisitCreated?: () => void;
}

export default function NewVisitScreen({ onBack, onVisitCreated }: NewVisitScreenProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const isDark = colorScheme === 'dark';

  const [customer, setCustomer] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [visitType, setVisitType] = useState('');
  const [showVisitTypePicker, setShowVisitTypePicker] = useState(false);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [loadingVisitTypes, setLoadingVisitTypes] = useState(true);

  useEffect(() => {
    fetchVisitTypes();
  }, []);

  const fetchVisitTypes = async () => {
    try {
      setLoadingVisitTypes(true);
      const response = await apiService.getVisitTypes();
      if (response.message === 'Visit Type Get Successfully' || response.message.toLowerCase().includes('successfully')) {
        setVisitTypes(response.data || []);
        if (response.data && response.data.length > 0 && !visitType) {
          setVisitType(response.data[0].name);
        }
      }
    } catch (error) {
      console.error('Error fetching visit types:', error);
      Alert.alert('Error', 'Failed to load visit types. Please try again.');
    } finally {
      setLoadingVisitTypes(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) setTime(selectedTime);
  };

  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const formatTime = (t: Date) => t.toTimeString().split(' ')[0];

  const formatDateDisplay = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatTimeDisplay = (t: Date) => t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

  const handleSubmit = async () => {
    if (!customer.trim() || !visitType || !description.trim()) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields marked with (*).');
      return;
    }

    try {
      setLoading(true);
      const visitData = {
        name: '',
        customer: customer.trim(),
        date: formatDate(date),
        time: formatTime(time),
        visit_type: visitType,
        description: description.trim(),
        location: location || '',
      };

      const response = await apiService.createVisit(visitData);
      if (response.message?.toLowerCase().includes('successfully')) {
        Alert.alert('Success', 'Visit scheduled successfully!', [{ text: 'Great', onPress: () => onVisitCreated?.() }]);
      } else {
        Alert.alert('Submission Failed', response.message || 'Please check your inputs.');
      }
    } catch (error) {
      console.error('Error creating visit:', error);
      Alert.alert('Network Error', 'Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderVisitTypeModal = () => (
    <Modal visible={showVisitTypePicker} transparent animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowVisitTypePicker(false)}
      >
        <Animated.View entering={FadeInDown} style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Selection Visit Type</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {visitTypes.map((type) => (
              <TouchableOpacity
                key={type.name}
                style={[
                  styles.pickerItem,
                  visitType === type.name && { backgroundColor: theme.primary + '15' }
                ]}
                onPress={() => {
                  setVisitType(type.name);
                  setShowVisitTypePicker(false);
                }}
              >
                <Text style={[
                  styles.pickerItemText,
                  { color: theme.text },
                  visitType === type.name && { color: theme.primary, fontWeight: '700' }
                ]}>
                  {type.name}
                </Text>
                {visitType === type.name && <Ionicons name="checkmark-circle" size={20} color={theme.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ backgroundColor: theme.card }}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleArea}>
            <Text style={[styles.headerSubtitle, { color: theme.secondary }]}>PLANNING</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Schedule Visit</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInDown.delay(100)} style={[styles.formCard, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="business-outline" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Identity Details</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.secondary }]}>CUSTOMER NAME *</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.background }]}>
              <Ionicons name="person-outline" size={20} color={theme.secondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Who are you visiting?"
                placeholderTextColor={theme.secondary + '80'}
                value={customer}
                onChangeText={setCustomer}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.secondary }]}>VISIT TYPE *</Text>
            <TouchableOpacity
              style={[styles.inputWrapper, { backgroundColor: theme.background }]}
              onPress={() => setShowVisitTypePicker(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="pricetags-outline" size={20} color={theme.secondary} />
              <Text style={[styles.input, { color: visitType ? theme.text : theme.secondary + '80' }]}>
                {loadingVisitTypes ? 'Loading types...' : (visitType || 'Select type')}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.secondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={[styles.formCard, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Schedule Info</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: theme.secondary }]}>DATE *</Text>
              <TouchableOpacity
                style={[styles.inputWrapper, { backgroundColor: theme.background }]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="today-outline" size={20} color="#3B82F6" />
                <Text style={[styles.input, { color: theme.text }]}>{formatDateDisplay(date)}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: theme.secondary }]}>TIME *</Text>
              <TouchableOpacity
                style={[styles.inputWrapper, { backgroundColor: theme.background }]}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={20} color="#10B981" />
                <Text style={[styles.input, { color: theme.text }]}>{formatTimeDisplay(time)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={handleDateChange} />
          )}
          {showTimePicker && (
            <DateTimePicker value={time} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={handleTimeChange} />
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={[styles.formCard, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Additional Data</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.secondary }]}>LOCATION</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.background }]}>
              <Ionicons name="location-outline" size={20} color={theme.secondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter site name/address (Optional)"
                placeholderTextColor={theme.secondary + '80'}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.secondary }]}>PURPOSE *</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.background, alignItems: 'flex-start', paddingTop: 12 }]}>
              <Ionicons name="chatbox-outline" size={20} color={theme.secondary} style={{ marginTop: 2 }} />
              <TextInput
                style={[styles.input, { color: theme.text, height: 100, textAlignVertical: 'top' }]}
                placeholder="What is the objective of this visit?"
                placeholderTextColor={theme.secondary + '80'}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: theme.primary }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Confirm Schedule</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {renderVisitTypeModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navHeader: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  formCard: {
    padding: 24,
    borderRadius: 36,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  actionRow: {
    marginTop: 12,
  },
  submitBtn: {
    height: 64,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 30,
  },
  modalContent: {
    borderRadius: 32,
    padding: 24,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 4,
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
