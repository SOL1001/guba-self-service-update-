import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import { apiService, Order } from '../services/api';

interface OrdersScreenProps {
  onBack: () => void;
  onOrderPress?: (order: Order) => void;
}

export default function OrdersScreen({ onBack, onOrderPress }: OrdersScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const response = await apiService.getOrderList();

      if (response && response.data) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]); // Treat 500s/connection errors as no data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(true);
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

  const getPriceDisplay = (price: string | number) => {
    if (typeof price === 'number') return `${price.toLocaleString()} ETB`;
    const num = parseFloat(price.replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? price : `${num.toLocaleString()} ETB`;
  };

  const renderOrderCard = ({ item, index }: { item: Order; index: number }) => {
    const status = getStatusConfig(item.status);

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card }]}
          activeOpacity={0.8}
          onPress={() => onOrderPress?.(item)}
        >
          <View style={styles.cardHeader}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.orderId, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.customerName, { color: theme.secondary }]} numberOfLines={1}>{item.customer_name}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Ionicons name={status.icon as any} size={12} color={status.color} />
              <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={theme.secondary} />
              <Text style={[styles.metaText, { color: theme.secondary }]}>{item.transaction_date}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="cube-outline" size={14} color={theme.secondary} />
              <Text style={[styles.metaText, { color: theme.secondary }]}>{item.total_qty} Items</Text>
            </View>
          </View>

          <View style={[styles.cardFooter, { borderTopColor: theme.border + '30' }]}>
            <View>
              <Text style={[styles.totalLabel, { color: theme.secondary }]}>Order Total</Text>
              <Text style={[styles.totalValue, { color: theme.primary }]}>{getPriceDisplay(item.grand_total)}</Text>
            </View>
            <View style={[styles.arrowBtn, { backgroundColor: theme.primary }]}>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </View>
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
          <View style={styles.titleArea}>
            <Text style={[styles.title, { color: theme.text }]}>Orders</Text>
            <Text style={[styles.subtitle, { color: theme.secondary }]}>{orders.length} Records Found</Text>
          </View>
          <TouchableOpacity onPress={() => fetchOrders()} style={styles.refreshBtn} activeOpacity={0.7}>
            <Ionicons name="refresh" size={22} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {orders.length > 0 && (
          <View style={styles.summaryBento}>
            <View style={[styles.summaryItem, { backgroundColor: theme.card }]}>
              <View style={[styles.iconWrapper, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="receipt-outline" size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.summaryValue, { color: theme.text }]}>{orders.length}</Text>
                <Text style={[styles.summaryLabel, { color: theme.secondary }]}>Total Orders</Text>
              </View>
            </View>
            <View style={[styles.summaryItem, { backgroundColor: theme.card }]}>
              <View style={[styles.iconWrapper, { backgroundColor: '#10B98115' }]}>
                <Ionicons name="wallet-outline" size={20} color="#10B981" />
              </View>
              <View>
                <Text style={[styles.summaryValue, { color: theme.text }]}>Summary</Text>
                <Text style={[styles.summaryLabel, { color: theme.secondary }]}>Financials</Text>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <FlatList
        data={orders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.name}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
                <Ionicons name="receipt-outline" size={64} color={theme.border} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No records found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
                You don't have any orders at the moment.
              </Text>
            </Animated.View>
          ) : null
        }
      />
      {loading && !refreshing && (
        <View style={styles.loaderArea}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loaderText, { color: theme.secondary }]}>Syncing orders...</Text>
        </View>
      )}
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
    paddingHorizontal: 16,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginHorizontal: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: -2,
  },
  refreshBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryBento: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  metaDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  arrowBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderArea: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});

