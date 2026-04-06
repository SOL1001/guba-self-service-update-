import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { Colors } from '../constants/Theme';
import { apiService } from '../services/api';

interface NewLeaveRequestScreenProps {
  onBack: () => void;
  onLeaveCreated?: () => void;
}

interface LeaveType {
  name: string;
  balance: number;
}

export default function NewLeaveRequestScreen({ onBack, onLeaveCreated }: NewLeaveRequestScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [showLeaveTypePicker, setShowLeaveTypePicker] = useState(false);
  const [halfDay, setHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const response = await apiService.getLeaveTypes();
      if (response.message?.toLowerCase().includes('success')) {
        setLeaveTypes(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      // Automatically update end date if it's before start date
      if (endDate < selectedDate) setEndDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLeaveType || !reason.trim()) {
      Alert.alert('Required Info', 'Please select a leave type and provide a reason.');
      return;
    }

    if (startDate > endDate) {
      Alert.alert('Invalid Dates', 'End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      const leaveData = {
        leave_type: selectedLeaveType,
        from_date: startDate.toISOString().split('T')[0],
        to_date: endDate.toISOString().split('T')[0],
        half_day: halfDay ? "1" : "0",
        half_day_date: halfDay ? startDate.toISOString().split('T')[0] : "",
        description: reason,
      };

      const response = await apiService.makeLeaveApplication(leaveData);

      if (response.message?.toLowerCase().includes('success')) {
        Alert.alert('Success', 'Your leave request has been submitted!', [
          {
            text: 'Done', onPress: () => {
              onLeaveCreated?.();
              onBack();
            }
          }
        ]);
      } else {
        Alert.alert('Oops!', response.message || 'We couldn\'t submit your request.');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      Alert.alert('Connection Error', 'Failed to submit request. Please check your internet.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Premium Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Apply for Leave</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.formContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Leave Type Selection Card */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Leave Type</Text>
          <TouchableOpacity
            onPress={() => setShowLeaveTypePicker(true)}
            style={[styles.pickerTrigger, { backgroundColor: theme.background, borderColor: theme.border }]}
            activeOpacity={0.8}
          >
            <View style={styles.pickerMain}>
              <View style={[styles.iconWrapper, { backgroundColor: theme.primary + '10' }]}>
                <Ionicons name="umbrella-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.pickerText, { color: selectedLeaveType ? theme.text : theme.secondary }]}>
                {selectedLeaveType || 'Select leave type'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={theme.secondary} />
          </TouchableOpacity>
        </View>

        {/* Schedule Card */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Schedule</Text>

          <View style={styles.dateGrid}>
            <TouchableOpacity
              onPress={() => setShowStartDatePicker(true)}
              style={[styles.dateInput, { backgroundColor: theme.background, borderColor: theme.border }]}
            >
              <Text style={[styles.inputLabel, { color: theme.secondary }]}>START DATE</Text>
              <Text style={[styles.dateValue, { color: theme.text }]}>{formatDate(startDate)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowEndDatePicker(true)}
              style={[styles.dateInput, { backgroundColor: theme.background, borderColor: theme.border }]}
            >
              <Text style={[styles.inputLabel, { color: theme.secondary }]}>END DATE</Text>
              <Text style={[styles.dateValue, { color: theme.text }]}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setHalfDay(!halfDay)}
            style={[styles.toggleRow, { backgroundColor: theme.background, borderColor: theme.border }]}
            activeOpacity={0.8}
          >
            <View style={styles.toggleTextWrapper}>
              <Text style={[styles.toggleTitle, { color: theme.text }]}>Half Day Request</Text>
              <Text style={[styles.toggleSubtitle, { color: theme.secondary }]}>Requires approval for single day</Text>
            </View>
            <View style={[
              styles.toggleSwitch,
              { backgroundColor: halfDay ? theme.primary : theme.border }
            ]}>
              <View style={[
                styles.toggleKnob,
                { transform: [{ translateX: halfDay ? 20 : 0 }] }
              ]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Reason Card */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Reason for Leave</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Please specify the reason for your leave request..."
            placeholderTextColor={theme.secondary + '80'}
            multiline
            numberOfLines={4}
            style={[styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <View style={styles.btnRow}>
          <TouchableOpacity
            onPress={onBack}
            style={[styles.secondaryBtn, { borderColor: theme.border }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryBtnText, { color: theme.secondary }]}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? 'Sending...' : 'Apply Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker value={startDate} mode="date" display="default" onChange={handleStartDateChange} />
      )}
      {showEndDatePicker && (
        <DateTimePicker value={endDate} mode="date" display="default" onChange={handleEndDateChange} />
      )}

      {/* Leave Type Modal */}
      <Modal visible={showLeaveTypePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismiss} activeOpacity={1} onPress={() => setShowLeaveTypePicker(false)} />
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalBar} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Leave Type</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {leaveTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedLeaveType(type.name);
                    setShowLeaveTypePicker(false);
                  }}
                  style={[styles.typeItem, { borderBottomColor: theme.border }]}
                  activeOpacity={0.6}
                >
                  <View>
                    <Text style={[styles.typeName, { color: theme.text }]}>{type.name}</Text>
                    <Text style={[styles.typeBalance, { color: theme.secondary }]}>Balance: {type.balance} days</Text>
                  </View>
                  <Ionicons
                    name={selectedLeaveType === type.name ? "radio-button-on" : "radio-button-off"}
                    size={24}
                    color={selectedLeaveType === type.name ? theme.primary : theme.border}
                  />
                </TouchableOpacity>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
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
  formContent: {
    flex: 1,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  pickerMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pickerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInput: {
    flex: 0.48,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  toggleTextWrapper: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  toggleSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textArea: {
    height: 120,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryBtn: {
    flex: 0.35,
    height: 56,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryBtn: {
    flex: 0.6,
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
  primaryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 8,
    maxHeight: '60%',
  },
  modalBar: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
  },
  typeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '700',
  },
  typeBalance: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
});
