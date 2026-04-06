import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
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

interface ExpenseType {
  name: string;
}

interface NewExpenseScreenProps {
  onBack: () => void;
  onExpenseCreated?: () => void;
}

export default function NewExpenseScreen({ onBack, onExpenseCreated }: NewExpenseScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [expenseDate, setExpenseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expenseType, setExpenseType] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showExpenseTypePicker, setShowExpenseTypePicker] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [loadingExpenseTypes, setLoadingExpenseTypes] = useState(true);

  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  const fetchExpenseTypes = async () => {
    try {
      setLoadingExpenseTypes(true);
      const response = await apiService.getExpenseTypes();
      if (response.message?.toLowerCase().includes('success')) {
        setExpenseTypes(response.data || []);
        if (response.data && response.data.length > 0 && !expenseType) {
          setExpenseType(response.data[0].name);
        }
      }
    } catch (error) {
      console.error('Error fetching expense types:', error);
    } finally {
      setLoadingExpenseTypes(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setExpenseDate(selectedDate);
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const filePaths = result.assets.map(asset => asset.uri);
        setAttachments([...attachments, ...filePaths]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!expenseType.trim()) {
      Alert.alert('Error', 'Please select an expense type');
      return;
    }
    if (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const expenseData = {
        expense_date: formatDate(expenseDate),
        expense_type: expenseType,
        description: description.trim() || '',
        amount: amount.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      const response = await apiService.createExpense(expenseData);
      if (response.message?.toLowerCase().includes('success')) {
        Alert.alert('Success', 'Expense created successfully!', [
          { text: 'OK', onPress: () => { onExpenseCreated?.(); onBack(); } },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to create expense');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      Alert.alert('Error', 'Failed to create expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const FormLabel = ({ label }: { label: string }) => (
    <Text style={[styles.label, { color: theme.secondary }]}>{label}</Text>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Modern Header - Adjusted to match user's manual layout changes */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Apply Expense</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Section: General Info */}
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Information</Text>
            </View>

            <FormLabel label="Expense Type" />
            <TouchableOpacity
              style={[styles.pickerTrigger, { backgroundColor: theme.background, borderColor: theme.border }]}
              onPress={() => setShowExpenseTypePicker(true)}
              disabled={loadingExpenseTypes || expenseTypes.length === 0}
              activeOpacity={0.7}
            >
              <View style={styles.pickerValueContainer}>
                {loadingExpenseTypes ? (
                  <ActivityIndicator size="small" color={theme.primary} style={{ marginRight: 8 }} />
                ) : (
                  <Ionicons name="receipt-outline" size={18} color={theme.primary} style={{ marginRight: 8 }} />
                )}
                <Text style={{ color: expenseType ? theme.text : theme.secondary, fontWeight: '600', fontSize: 16 }}>
                  {loadingExpenseTypes ? 'Loading types...' : (expenseType || 'Select type')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.secondary} />
            </TouchableOpacity>

            <FormLabel label="Expense Date" />
            <TouchableOpacity
              style={[styles.pickerTrigger, { backgroundColor: theme.background, borderColor: theme.border }]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <View style={styles.pickerValueContainer}>
                <Ionicons name="calendar-outline" size={18} color={theme.primary} style={{ marginRight: 8 }} />
                <Text style={{ color: theme.text, fontWeight: '600', fontSize: 16 }}>{formatDateDisplay(expenseDate)}</Text>
              </View>
              <Ionicons name="calendar" size={18} color={theme.secondary} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker value={expenseDate} mode="date" display="default" onChange={handleDateChange} />
            )}
          </View>

          {/* Section: Amount & Description */}
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cash-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Financial Details</Text>
            </View>

            <FormLabel label="Amount" />
            <View style={[styles.amountContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Text style={[styles.currencyPrefix, { color: theme.primary }]}>Br</Text>
              <TextInput
                style={[styles.amountInput, { color: theme.text }]}
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholderTextColor={theme.secondary}
                selectionColor={theme.primary}
              />
            </View>

            <FormLabel label="Description (Optional)" />
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              placeholder="What was this expense for?..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={theme.secondary}
            />
          </View>

          {/* Section: Attachments */}
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-attach-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Attachments</Text>
            </View>

            <TouchableOpacity
              style={[styles.uploadZone, { backgroundColor: theme.background, borderColor: theme.border }]}
              onPress={handlePickDocument}
              activeOpacity={0.7}
            >
              <View style={[styles.uploadIconWrapper, { backgroundColor: theme.primary + '10' }]}>
                <Ionicons name="cloud-upload" size={28} color={theme.primary} />
              </View>
              <Text style={[styles.uploadTitle, { color: theme.text }]}>Add Receipt Documents</Text>
              <Text style={[styles.uploadSubtitle, { color: theme.secondary }]}>PDF, JPG, PNG (Max 5MB)</Text>
            </TouchableOpacity>

            <View style={styles.attachmentList}>
              {attachments.map((attachment, index) => (
                <View key={index} style={[styles.attachmentItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <View style={[styles.attachmentIconWrapper, { backgroundColor: theme.primary + '08' }]}>
                    <Ionicons name="document-text" size={18} color={theme.primary} />
                  </View>
                  <Text style={[styles.attachmentName, { color: theme.text }]} numberOfLines={1}>
                    {attachment.split('/').pop()}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeAttachment(index)}
                    style={styles.attachmentRemove}
                  >
                    <Ionicons name="close-circle" size={22} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Submit Application</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={onBack} style={styles.cancelLink} activeOpacity={0.6}>
              <Text style={[styles.cancelText, { color: theme.secondary }]}>Cancel and Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modern Picker Modal */}
      <Modal
        visible={showExpenseTypePicker}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalDismiss}
            activeOpacity={1}
            onPress={() => setShowExpenseTypePicker(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalBar} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Expense Type</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowExpenseTypePicker(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalList}>
              {expenseTypes.map((type) => (
                <TouchableOpacity
                  key={type.name}
                  style={[
                    styles.typeItem,
                    expenseType === type.name && { backgroundColor: theme.primary + '08', borderColor: theme.primary + '40' }
                  ]}
                  onPress={() => { setExpenseType(type.name); setShowExpenseTypePicker(false); }}
                >
                  <View style={styles.typeItemContent}>
                    <View style={[styles.typeIcon, { backgroundColor: theme.primary + '10' }]}>
                      <Ionicons name="receipt-outline" size={18} color={theme.primary} />
                    </View>
                    <Text style={[
                      styles.typeText,
                      { color: theme.text },
                      expenseType === type.name && { color: theme.primary, fontWeight: '700' }
                    ]}>
                      {type.name}
                    </Text>
                  </View>
                  {expenseType === type.name && <Ionicons name="checkmark-circle" size={22} color={theme.primary} />}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    padding: 20,
  },
  sectionCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  pickerValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    borderWidth: 1,
    height: 64,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '800',
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  textArea: {
    borderRadius: 16,
    padding: 16,
    height: 120,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
    borderWidth: 1,
  },
  uploadZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  attachmentList: {
    marginTop: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  attachmentIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  attachmentRemove: {
    padding: 4,
  },
  footer: {
    marginTop: 10,
    alignItems: 'center',
  },
  submitBtn: {
    width: '100%',
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  submitBtnText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
  },
  cancelLink: {
    marginTop: 20,
    padding: 10,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
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
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalBar: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalList: {
    marginBottom: 20,
  },
  typeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
