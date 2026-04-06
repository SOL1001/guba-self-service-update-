import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '../constants/Theme';
import { apiService, Order, OrderDetails } from '../services/api';

interface OrderDetailsScreenProps {
  order: Order;
  onBack: () => void;
}

export default function OrderDetailsScreen({ order, onBack }: OrderDetailsScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getOrderDetails(order.name);

      if (response && response.data) {
        setOrderDetails(response.data);
      } else {
        setError('Failed to fetch order details');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('completed')) {
      return { label: 'Completed', color: '#10B981', bg: '#10B98115', icon: 'checkmark-circle-outline' };
    }
    if (s.includes('deliver') || s.includes('bill')) {
      return { label: status, color: '#F59E0B', bg: '#F59E0B15', icon: 'time-outline' };
    }
    return { label: status, color: '#6B7280', bg: '#6B728015', icon: 'ellipsis-horizontal-circle-outline' };
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/')) {
      const baseUrl = apiService.getBaseUrl();
      if (baseUrl) {
        return `${baseUrl}${imagePath}`;
      }
    }
    return imagePath;
  };

  const renderInfoItem = (label: string, value: string | null | undefined, icon: string) => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        <View style={[styles.infoIconWrapper, { backgroundColor: theme.background }]}>
          <Ionicons name={icon as any} size={16} color={theme.secondary} />
        </View>
        <View>
          <Text style={[styles.infoLabel, { color: theme.secondary }]}>{label}</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SafeAreaView>
          <View style={styles.navHeader}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={28} color={theme.primary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>Order Details</Text>
          </View>
        </SafeAreaView>
        <View style={styles.centerSection}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.secondary }]}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  if (error || !orderDetails) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SafeAreaView>
          <View style={styles.navHeader}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={28} color={theme.primary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>Order Details</Text>
          </View>
        </SafeAreaView>
        <View style={styles.centerSection}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={[styles.errorText, { color: theme.text }]}>{error || 'Failed to load order details'}</Text>
          <TouchableOpacity onPress={fetchOrderDetails} style={[styles.retryBtn, { backgroundColor: theme.primary }]}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const status = getStatusConfig(orderDetails.workflow_state || '');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.titleArea}>
            <Text style={[styles.title, { color: theme.text }]}>Order Details</Text>
            <Text style={[styles.subtitle, { color: theme.secondary }]}>{orderDetails.name}</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Order Hero Card */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={[styles.heroCard, { backgroundColor: theme.card }]}>
              <View style={styles.heroHeader}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.customerName, { color: theme.text }]} numberOfLines={1}>{orderDetails.customer_name}</Text>
                  <Text style={[styles.orderCreationDate, { color: theme.secondary }]}>Created on {orderDetails.transaction_date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Ionicons name={status.icon as any} size={12} color={status.color} />
                  <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>

              <View style={[styles.heroFinancials, { borderTopColor: theme.border + '30' }]}>
                <View style={styles.financialItem}>
                  <Text style={[styles.financialLabel, { color: theme.secondary }]}>TOTAL AMOUNT</Text>
                  <Text style={[styles.financialValue, { color: theme.primary }]}>{orderDetails.grand_total}</Text>
                </View>
                <View style={[styles.verticalDivider, { backgroundColor: theme.border + '30' }]} />
                <View style={styles.financialItem}>
                  <Text style={[styles.financialLabel, { color: theme.secondary }]}>ITEMS</Text>
                  <Text style={[styles.financialValue, { color: theme.text }]}>{orderDetails.total_qty}</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Company & Info Bento */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <View style={[styles.section, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>General Information</Text>
              <View style={styles.infoGrid}>
                {renderInfoItem('Company', orderDetails.company, 'business-outline')}
                {renderInfoItem('Cost Center', orderDetails.cost_center, 'pie-chart-outline')}
                {renderInfoItem('Warehouse', orderDetails.set_warehouse, 'cube-outline')}
                {renderInfoItem('Delivery Date', orderDetails.delivery_date, 'calendar-outline')}
              </View>
            </View>
          </Animated.View>

          {/* Contact Information */}
          {(orderDetails.contact_email || orderDetails.contact_mobile || orderDetails.shipping_address) && (
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <View style={[styles.section, { backgroundColor: theme.card }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Details</Text>
                <View style={styles.contactList}>
                  {renderInfoItem('Email', orderDetails.contact_email, 'mail-outline')}
                  {renderInfoItem('Mobile', orderDetails.contact_mobile || orderDetails.contact_phone, 'phone-portrait-outline')}
                  {renderInfoItem('Shipping Address', orderDetails.shipping_address, 'location-outline')}
                </View>
              </View>
            </Animated.View>
          )}

          {/* Order Items */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <View style={[styles.section, { backgroundColor: theme.card, paddingBottom: 8 }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Items</Text>
              {orderDetails.items.map((item, index) => (
                <View key={index} style={[styles.itemRow, { borderBottomColor: theme.border + '20' }]}>
                  <View style={[styles.itemImageWrapper, { backgroundColor: theme.background }]}>
                    {item.image && getImageUrl(item.image) ? (
                      <Image source={{ uri: getImageUrl(item.image) || '' }} style={styles.itemImage} resizeMode="cover" />
                    ) : (
                      <Ionicons name="cube-outline" size={24} color={theme.border} />
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>{item.item_name}</Text>
                    <Text style={[styles.itemCode, { color: theme.secondary }]}>{item.item_code}</Text>
                    <View style={styles.itemMeta}>
                      <View style={styles.qtyBadge}>
                        <Text style={[styles.qtyText, { color: theme.secondary }]}>{item.qty} {item.uom}</Text>
                      </View>
                      <Text style={[styles.itemAmount, { color: theme.primary }]}>{item.amount}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Financial Summary */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <View style={[styles.section, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Financial Summary</Text>
              <View style={styles.summaryTable}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.secondary }]}>Net Total</Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>{orderDetails.net_total}</Text>
                </View>
                {parseFloat(orderDetails.discount_amount.replace(/[^0-9.-]+/g, '')) > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.secondary }]}>Discount</Text>
                    <Text style={[styles.summaryValue, { color: '#EF4444' }]}>-{orderDetails.discount_amount}</Text>
                  </View>
                )}
                {parseFloat(orderDetails.total_taxes_and_charges.replace(/[^0-9.-]+/g, '')) > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.secondary }]}>Taxes & Charges</Text>
                    <Text style={[styles.summaryValue, { color: theme.text }]}>{orderDetails.total_taxes_and_charges}</Text>
                  </View>
                )}
                <View style={[styles.grandTotalRow, { borderTopColor: theme.border + '30' }]}>
                  <Text style={[styles.grandTotalLabel, { color: theme.text }]}>Grand Total</Text>
                  <Text style={[styles.grandTotalValue, { color: theme.primary }]}>{orderDetails.grand_total}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleArea: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: -2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  customerName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  orderCreationDate: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexShrink: 0,
    marginLeft: 12,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  heroFinancials: {
    flexDirection: 'row',
    paddingTop: 24,
    borderTopWidth: 1,
  },
  financialItem: {
    flex: 1,
  },
  financialLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  financialValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  verticalDivider: {
    width: 1,
    height: 36,
    marginHorizontal: 16,
  },
  section: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 20,
    opacity: 0.8,
  },
  infoGrid: {
    gap: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  contactList: {
    gap: 20,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  itemImageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemCode: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyBadge: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  summaryTable: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  grandTotalValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 20,
  },
  retryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});












