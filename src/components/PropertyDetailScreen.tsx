import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import { apiService } from '../services/api';

interface PropertyDetailScreenProps {
    unitId: string;
    onBack: () => void;
}

export default function PropertyDetailScreen({ unitId, onBack }: PropertyDetailScreenProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [unitData, setUnitData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUnitDetails();
    }, [unitId]);

    const fetchUnitDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getPropertyUnitDetail(unitId);

            if (response && (response.message || response.data)) {
                setUnitData(response.message || response.data);
            } else if (response && typeof response === 'object' && !Array.isArray(response)) {
                setUnitData(response);
            } else {
                // Treat 500 or missing data as "no data"
                setUnitData(null);
            }
        } catch (err) {
            console.error('Error fetching property unit detail:', err);
            // Treat 500/Connection errors as "no data"
            setUnitData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleBookUnit = async () => {
        Alert.alert(
            "Confirm Booking",
            `Are you sure you want to book ${unitData.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Book Now",
                    onPress: async () => {
                        try {
                            setBooking(true);
                            await apiService.bookPropertyUnit(unitId);
                            Alert.alert(
                                "Success",
                                "Property unit booked successfully!",
                                [{ text: "OK", onPress: () => fetchUnitDetails() }]
                            );
                        } catch (err) {
                            console.error('Error booking property unit:', err);
                            Alert.alert(
                                "Booking Failed",
                                err instanceof Error ? err.message : "An error occurred while booking.",
                                [{ text: "OK" }]
                            );
                        } finally {
                            setBooking(false);
                        }
                    }
                }
            ]
        );
    };

    const handleCancelBooking = async () => {
        Alert.alert(
            "Confirm Cancellation",
            `Are you sure you want to cancel the booking for ${unitData.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Cancel Booking",
                    onPress: async () => {
                        try {
                            setBooking(true);
                            await apiService.cancelPropertyBooking(unitId);
                            Alert.alert(
                                "Booking Cancelled",
                                "The property booking has been cancelled.",
                                [{ text: "OK", onPress: () => fetchUnitDetails() }]
                            );
                        } catch (err) {
                            console.error('Error cancelling property booking:', err);
                            Alert.alert(
                                "Cancellation Failed",
                                err instanceof Error ? err.message : "An error occurred while cancelling the booking.",
                                [{ text: "OK" }]
                            );
                        } finally {
                            setBooking(false);
                        }
                    }
                }
            ]
        );
    };

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

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={styles.centerSection}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.secondary }]}>Syncing property details...</Text>
                </View>
            </View>
        );
    }

    if (!unitData) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={styles.navHeader}>
                    <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                        <Ionicons name="chevron-back" size={28} color={theme.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.navTitle, { color: theme.text }]}>Unit Details</Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.centerSection}>
                    <View style={[styles.emptyIconWrapper, { backgroundColor: theme.card }]}>
                        <Ionicons name="home-outline" size={64} color={theme.border} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>Unit not found</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
                        We couldn't find the details for this property unit.
                    </Text>
                    <TouchableOpacity onPress={onBack} style={[styles.backHomeBtn, { backgroundColor: theme.primary }]}>
                        <Text style={styles.backHomeText}>Back to List</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const status = getStatusConfig(unitData.booking_status);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <View style={[styles.navHeader, { borderBottomColor: theme.border + '30' }]}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={28} color={theme.primary} />
                </TouchableOpacity>
                <Text style={[styles.navTitle, { color: theme.text }]} numberOfLines={1}>{unitData.name}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.duration(400)}>
                    {/* Hero Hero Section */}
                    <View style={[styles.heroCard, { backgroundColor: theme.card }]}>
                        <View style={styles.heroMain}>
                            <View style={{ flex: 1, marginRight: 12, minWidth: 0 }}>
                                <Text style={[styles.heroTitle, { color: theme.text }]} numberOfLines={2}>{unitData.name}</Text>
                                <View style={styles.heroMeta}>
                                    <Ionicons name="business-outline" size={14} color={theme.secondary} />
                                    <Text style={[styles.heroMetaText, { color: theme.secondary }]} numberOfLines={1}>{unitData.project} • Block {unitData.block}</Text>
                                </View>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                                <Ionicons name={status.icon as any} size={14} color={status.color} />
                                <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
                            </View>
                        </View>

                        {/* Bento Grid */}
                        <View style={styles.bentoGrid}>
                            <View style={[styles.bentoItem, { backgroundColor: theme.background + '50' }]}>
                                <View style={[styles.bentoIcon, { backgroundColor: '#F59E0B20' }]}>
                                    <Ionicons name="bed-outline" size={18} color="#F59E0B" />
                                </View>
                                <Text style={[styles.bentoValue, { color: theme.text }]}>{unitData.number_of_bed_rooms || unitData.bedrooms || 0}</Text>
                                <Text style={[styles.bentoLabel, { color: theme.secondary }]}>BED</Text>
                            </View>
                            <View style={[styles.bentoItem, { backgroundColor: theme.background + '50' }]}>
                                <View style={[styles.bentoIcon, { backgroundColor: '#3B82F620' }]}>
                                    <Ionicons name="water-outline" size={18} color="#3B82F6" />
                                </View>
                                <Text style={[styles.bentoValue, { color: theme.text }]}>{unitData.number_of_bathrooms || unitData.bathrooms || 0}</Text>
                                <Text style={[styles.bentoLabel, { color: theme.secondary }]}>BATH</Text>
                            </View>
                            <View style={[styles.bentoItem, { backgroundColor: theme.background + '50' }]}>
                                <View style={[styles.bentoIcon, { backgroundColor: '#EF444420' }]}>
                                    <Ionicons name="resize-outline" size={18} color="#EF4444" />
                                </View>
                                <Text style={[styles.bentoValue, { color: theme.text }]}>{unitData.net_area}m²</Text>
                                <Text style={[styles.bentoLabel, { color: theme.secondary }]}>AREA</Text>
                            </View>
                            <View style={[styles.bentoItem, { backgroundColor: theme.background + '50' }]}>
                                <View style={[styles.bentoIcon, { backgroundColor: '#8B5CF620' }]}>
                                    <Ionicons name="layers-outline" size={18} color="#8B5CF6" />
                                </View>
                                <Text style={[styles.bentoValue, { color: theme.text }]}>{unitData.floor || 'N/A'}</Text>
                                <Text style={[styles.bentoLabel, { color: theme.secondary }]}>FLOOR</Text>
                            </View>
                        </View>
                    </View>

                    {/* Financial Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Financial Summary</Text>
                    </View>
                    <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
                        <View style={styles.priceHero}>
                            <Text style={[styles.priceLabel, { color: theme.secondary }]}>TOTAL PRICE (INC. VAT)</Text>
                            <Text style={[styles.priceValue, { color: theme.primary }]}>
                                {(unitData.price_after_vat || unitData.selling_price_after_vat) > 0
                                    ? `${(unitData.price_after_vat || unitData.selling_price_after_vat).toLocaleString()} ETB`
                                    : 'Price on Request'}
                            </Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.border + '30' }]} />
                        <View style={styles.priceGrid}>
                            <View style={styles.priceRow}>
                                <Text style={[styles.detailLabel, { color: theme.secondary }]}>Price Before VAT</Text>
                                <Text style={[styles.detailValue, { color: theme.text }]}>
                                    {unitData.price_before_vat ? `${unitData.price_before_vat.toLocaleString()} ETB` : 'N/A'}
                                </Text>
                            </View>
                            <View style={styles.priceRow}>
                                <Text style={[styles.detailLabel, { color: theme.secondary }]}>VAT Amount (15%)</Text>
                                <Text style={[styles.detailValue, { color: theme.text }]}>
                                    {unitData.vat_amount ? `${unitData.vat_amount.toLocaleString()} ETB` : 'N/A'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Unit Overview Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Unit Overview</Text>
                    </View>
                    <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
                        <View style={styles.rowDetail}>
                            <View style={styles.rowLabelGroup}>
                                <Ionicons name="home-outline" size={18} color={theme.secondary} />
                                <Text style={[styles.rowLabel, { color: theme.secondary }]}>Unit Type</Text>
                            </View>
                            <Text style={[styles.rowValue, { color: theme.text }]}>{unitData.unit_type || 'N/A'}</Text>
                        </View>
                        <View style={[styles.innerDivider, { backgroundColor: theme.border + '30' }]} />
                        <View style={styles.rowDetail}>
                            <View style={styles.rowLabelGroup}>
                                <Ionicons name="barcode-outline" size={18} color={theme.secondary} />
                                <Text style={[styles.rowLabel, { color: theme.secondary }]}>House Code</Text>
                            </View>
                            <Text style={[styles.rowValue, { color: theme.text }]}>{unitData.house_code || 'N/A'}</Text>
                        </View>
                        <View style={[styles.innerDivider, { backgroundColor: theme.border + '30' }]} />
                        <View style={styles.rowDetail}>
                            <View style={styles.rowLabelGroup}>
                                <Ionicons name="location-outline" size={18} color={theme.secondary} />
                                <Text style={[styles.rowLabel, { color: theme.secondary }]}>Location</Text>
                            </View>
                            <Text style={[styles.rowValue, { color: theme.text }]}>Block {unitData.block}, {unitData.project}</Text>
                        </View>
                    </View>

                    {/* Features Section */}
                    {unitData.room_features && unitData.room_features.length > 0 && (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Room Features</Text>
                            </View>
                            <View style={styles.featuresContainer}>
                                {unitData.room_features.map((feature: any, index: number) => (
                                    <View key={index} style={[styles.featurePill, { backgroundColor: theme.card, borderColor: theme.border + '30' }]}>
                                        <Ionicons name="sparkles-outline" size={14} color={theme.primary} />
                                        <Text style={[styles.featureText, { color: theme.text }]}>{feature.feature}</Text>
                                        <Text style={[styles.featureArea, { color: theme.secondary }]}>{feature.area_in_m2}m²</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Booking History Section */}
                    {(unitData.booked_by || unitData.booking_date) && (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Booking Record</Text>
                            </View>
                            <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
                                <View style={styles.rowDetail}>
                                    <View style={styles.rowLabelGroup}>
                                        <Ionicons name="person-outline" size={18} color={theme.secondary} />
                                        <Text style={[styles.rowLabel, { color: theme.secondary }]}>Booked By</Text>
                                    </View>
                                    <Text style={[styles.rowValue, { color: theme.text }]}>{unitData.booked_by || 'Unknown'}</Text>
                                </View>
                                <View style={[styles.innerDivider, { backgroundColor: theme.border + '30' }]} />
                                <View style={styles.rowDetail}>
                                    <View style={styles.rowLabelGroup}>
                                        <Ionicons name="calendar-outline" size={18} color={theme.secondary} />
                                        <Text style={[styles.rowLabel, { color: theme.secondary }]}>Booking Date</Text>
                                    </View>
                                    <Text style={[styles.rowValue, { color: theme.text }]}>{unitData.booking_date || 'N/A'}</Text>
                                </View>
                                {unitData.booking_expiry_date && (
                                    <>
                                        <View style={[styles.innerDivider, { backgroundColor: theme.border + '30' }]} />
                                        <View style={styles.rowDetail}>
                                            <View style={styles.rowLabelGroup}>
                                                <Ionicons name="hourglass-outline" size={18} color="#EF4444" />
                                                <Text style={[styles.rowLabel, { color: "#EF4444" }]}>Valid Until</Text>
                                            </View>
                                            <Text style={[styles.rowValue, { color: theme.text, fontWeight: '800' }]}>{unitData.booking_expiry_date}</Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        </>
                    )}
                </Animated.View>
            </ScrollView>

            {/* Fixed Footer Segment */}
            <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border + '30' }]}>
                {unitData.booking_status?.toLowerCase() === 'available' ? (
                    <TouchableOpacity
                        onPress={handleBookUnit}
                        disabled={booking}
                        style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                        activeOpacity={0.8}
                    >
                        {booking ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="bookmark" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
                                <Text style={styles.actionBtnText}>Book Now</Text>
                            </>
                        )}
                    </TouchableOpacity>
                ) : unitData.booking_status?.toLowerCase() === 'booked' ? (
                    <TouchableOpacity
                        onPress={handleCancelBooking}
                        disabled={booking}
                        style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
                        activeOpacity={0.8}
                    >
                        {booking ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="trash-outline" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
                                <Text style={styles.actionBtnText}>Cancel Booking</Text>
                            </>
                        )}
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.statusInfoBox, { backgroundColor: theme.background }]}>
                        <Ionicons name="lock-closed-outline" size={20} color={theme.secondary} />
                        <Text style={[styles.statusInfoText, { color: theme.secondary }]}>Status: {unitData.booking_status}</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navHeader: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navTitle: {
        fontSize: 18,
        fontWeight: '800',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 12,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    centerSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        fontWeight: '600',
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
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    backHomeBtn: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 16,
    },
    backHomeText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    heroCard: {
        margin: 20,
        padding: 24,
        borderRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    heroMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    heroMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heroMetaText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        marginLeft: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
    },
    statusLabel: {
        fontSize: 12,
        fontWeight: '800',
        marginLeft: 6,
        textTransform: 'uppercase',
    },
    bentoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    bentoItem: {
        width: '48%',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
    },
    bentoIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    bentoValue: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 2,
    },
    bentoLabel: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    sectionHeader: {
        paddingHorizontal: 24,
        marginBottom: 12,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        opacity: 0.6,
    },
    infoCard: {
        marginHorizontal: 20,
        padding: 24,
        borderRadius: 28,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 2,
    },
    priceHero: {
        alignItems: 'center',
        paddingBottom: 16,
    },
    priceLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 8,
    },
    priceValue: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
    },
    divider: {
        height: 1,
        marginBottom: 16,
    },
    priceGrid: {
        gap: 12,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '700',
    },
    rowDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
    },
    rowLabelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 10,
    },
    rowValue: {
        fontSize: 14,
        fontWeight: '700',
        flex: 1,
        textAlign: 'right',
        marginLeft: 20,
    },
    innerDivider: {
        height: 1,
    },
    featuresContainer: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
    },
    featurePill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
    },
    featureText: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 8,
    },
    featureArea: {
        fontSize: 11,
        fontWeight: '700',
        marginLeft: 6,
        opacity: 0.7,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 36,
        borderTopWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    actionBtn: {
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    actionBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    statusInfoBox: {
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#E5E7EB',
    },
    statusInfoText: {
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 10,
    },
});
