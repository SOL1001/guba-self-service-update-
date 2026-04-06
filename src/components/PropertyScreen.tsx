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
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Colors } from '../constants/Theme';
import { apiService, PropertyUnit } from '../services/api';

interface PropertyScreenProps {
    onBack: () => void;
    onUnitPress?: (unitId: string) => void;
}

export default function PropertyScreen({ onBack, onUnitPress }: PropertyScreenProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [units, setUnits] = useState<PropertyUnit[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

    const filters = ['All', 'Available', 'Booked', 'Sold'];

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getPropertyUnits();

            if (response && response.message && Array.isArray(response.message)) {
                setUnits(response.message);
            } else {
                // Treat non-success/500 as "no data"
                setUnits([]);
            }
        } catch (err) {
            console.error('Error fetching property units:', err);
            // Treat 500/Connection errors as "no data"
            setUnits([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUnits();
    };

    const filteredUnits = units.filter(unit => {
        const matchesSearch = searchQuery === '' ||
            unit.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            unit.house_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            unit.project?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            unit.block?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            unit.unit_type?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = selectedFilter === null || selectedFilter === 'All' ||
            unit.booking_status?.toLowerCase() === selectedFilter.toLowerCase();

        return matchesSearch && matchesFilter;
    });

    const getStatusConfig = (status: string | null) => {
        const s = status?.toLowerCase() || '';
        switch (s) {
            case 'available':
                return { label: 'Available', color: '#10B981', bg: '#10B98115', icon: 'checkmark-circle-outline' };
            case 'booked':
                return { label: 'Booked', color: '#3B82F6', bg: '#3B82F615', icon: 'bookmark-outline' };
            case 'sold':
                return { label: 'Sold', color: '#EF4444', bg: '#EF444415', icon: 'lock-closed-outline' };
            default:
                return { label: status || 'Unknown', color: theme.secondary, bg: theme.border + '30', icon: 'help-circle-outline' };
        }
    };

    const getPriceDisplay = (price: number) => {
        if (price <= 0) return 'Price on Request';
        if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M ETB`;
        if (price >= 1000) return `${(price / 1000).toFixed(0)}K ETB`;
        return `${price.toLocaleString()} ETB`;
    };

    const FilterChip = ({ label }: { label: string }) => {
        const isActive = (selectedFilter === label) || (label === 'All' && selectedFilter === null);

        return (
            <TouchableOpacity
                onPress={() => setSelectedFilter(label === 'All' ? null : label)}
                style={[styles.filterChip, isActive && { backgroundColor: theme.primary }]}
            >
                <Text style={[styles.filterText, { color: isActive ? '#FFFFFF' : theme.secondary }]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderUnit = ({ item, index }: { item: PropertyUnit; index: number }) => {
        const status = getStatusConfig(item.booking_status);

        return (
            <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: theme.card }]}
                    activeOpacity={0.8}
                    onPress={() => onUnitPress && onUnitPress(item.name)}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.titleWrapper}>
                            <Text style={[styles.unitName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                            <View style={styles.projectRow}>
                                <Ionicons name="business-outline" size={12} color={theme.secondary} />
                                <Text style={[styles.projectName, { color: theme.secondary }]}>{item.project} • Block {item.block}</Text>
                            </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                            <Ionicons name={status.icon as any} size={12} color={status.color} />
                            <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
                        </View>
                    </View>

                    <View style={styles.specGrid}>
                        <View style={styles.specItem}>
                            <Ionicons name="apps-outline" size={14} color={theme.secondary} />
                            <Text style={[styles.specValue, { color: theme.text }]}>{item.unit_type || 'N/A'}</Text>
                            <Text style={[styles.specLabel, { color: theme.secondary }]}>TYPE</Text>
                        </View>
                        <View style={styles.specDivider} />
                        <View style={styles.specItem}>
                            <Ionicons name="layers-outline" size={14} color={theme.secondary} />
                            <Text style={[styles.specValue, { color: theme.text }]}>{item.floor || 'N/A'}</Text>
                            <Text style={[styles.specLabel, { color: theme.secondary }]}>FLOOR</Text>
                        </View>
                        <View style={styles.specDivider} />
                        <View style={styles.specItem}>
                            <Ionicons name="resize-outline" size={14} color={theme.secondary} />
                            <Text style={[styles.specValue, { color: theme.text }]}>{item.net_area}m²</Text>
                            <Text style={[styles.specLabel, { color: theme.secondary }]}>AREA</Text>
                        </View>
                    </View>

                    <View style={[styles.bedBathRow, { backgroundColor: theme.background + '50' }]}>
                        <View style={styles.iconMeta}>
                            <Ionicons name="bed-outline" size={16} color={theme.primary} />
                            <Text style={[styles.metaText, { color: theme.text }]}>{item.number_of_bed_rooms} Bedrooms</Text>
                        </View>
                        <View style={styles.iconMeta}>
                            <Ionicons name="water-outline" size={16} color={theme.primary} />
                            <Text style={[styles.metaText, { color: theme.text }]}>{item.number_of_bathrooms} Bathrooms</Text>
                        </View>
                    </View>

                    <View style={styles.cardFooter}>
                        <View>
                            <Text style={[styles.priceLabel, { color: theme.secondary }]}>Selling Price (Inc. VAT)</Text>
                            <Text style={[styles.priceValue, { color: theme.text }]}>{getPriceDisplay(item.selling_price_after_vat)}</Text>
                        </View>
                        <View style={[styles.arrowBtn, { backgroundColor: theme.primary }]}>
                            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderHeader = () => (
        <View style={styles.headerArea}>
            <SafeAreaView>
                <View style={styles.navHeader}>
                    <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                        <Ionicons name="chevron-back" size={28} color={theme.primary} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleArea}>
                        <Text style={[styles.navTitle, { color: theme.text }]}>Properties</Text>
                        <Text style={[styles.unitCount, { color: theme.secondary }]}>{filteredUnits.length} Units Found</Text>
                    </View>
                    <TouchableOpacity onPress={fetchUnits} style={styles.refreshBtn}>
                        <Ionicons name="refresh" size={22} color={theme.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchSection}>
                    <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
                        <Ionicons name="search-outline" size={20} color={theme.secondary} />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search by name, block, project..."
                            placeholderTextColor={theme.secondary + '80'}
                            style={[styles.searchInput, { color: theme.text }]}
                            autoCapitalize="none"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={theme.secondary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <FlatList
                        horizontal
                        data={filters}
                        renderItem={({ item }) => <FilterChip label={item} />}
                        keyExtractor={item => item}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterList}
                    />
                </View>
            </SafeAreaView>
        </View>
    );

    if (loading && units.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={styles.centerSection}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.secondary }]}>Syncing property listings...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <FlatList
                data={filteredUnits}
                renderItem={renderUnit}
                keyExtractor={(item) => item.name}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.primary}
                        colors={[theme.primary]}
                    />
                }
                ListEmptyComponent={
                    <Animated.View entering={FadeIn} style={styles.emptyContainer}>
                        <View style={[styles.emptyIconWrapper, { backgroundColor: theme.card }]}>
                            <Ionicons name="home-outline" size={64} color={theme.border} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No records found</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
                            {searchQuery || selectedFilter
                                ? "Try adjusting your search or filters."
                                : "No properties available at the moment."}
                        </Text>
                    </Animated.View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerArea: {
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
    headerTitleArea: {
        alignItems: 'center',
    },
    navTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    unitCount: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    refreshBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchSection: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    filterList: {
        marginTop: 16,
        paddingRight: 20,
        paddingBottom: 8,
    },
    filterChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 14,
        marginRight: 10,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '700',
    },
    listContent: {
        paddingBottom: 100,
    },
    card: {
        marginHorizontal: 20,
        marginTop: 16,
        padding: 20,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
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
        minWidth: 0,
    },
    unitName: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    projectRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    projectName: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        marginLeft: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusLabel: {
        fontSize: 11,
        fontWeight: '800',
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    specGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    specItem: {
        alignItems: 'center',
        flex: 1,
    },
    specDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#E5E7EB',
        opacity: 0.5,
    },
    specValue: {
        fontSize: 15,
        fontWeight: '800',
        marginTop: 8,
        marginBottom: 2,
    },
    specLabel: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1,
    },
    bedBathRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 20,
    },
    iconMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    metaText: {
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    priceLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 4,
    },
    priceValue: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    arrowBtn: {
        width: 44,
        height: 44,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    centerSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 80,
    },
    emptyIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 22,
    },
});