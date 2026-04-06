import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    RefreshControl,
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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Colors } from '../constants/Theme';
import { apiService, Lead } from '../services/api';

interface CRMScreenProps {
    onBack: () => void;
    onLeadPress?: (lead: Lead) => void;
}

export default function CRMScreen({ onBack, onLeadPress }: CRMScreenProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

    // Create Lead State
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [creatingLead, setCreatingLead] = useState(false);
    const [newLeadData, setNewLeadData] = useState({
        salutation: 'Mr',
        first_name: '',
        last_name: '',
        source: 'Advertisement',
        status: 'Lead'
    });

    const filters = ['All', 'Lead', 'Interested', 'Converted', 'Do Not Contact'];

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            if (!refreshing) setLoading(true);
            setError(null);
            const response = await apiService.getLeads();

            if (response && response.data && Array.isArray(response.data)) {
                setLeads(response.data);
            } else {
                // Treat 500/Connection errors as "no data"
                setLeads([]);
            }
        } catch (err) {
            console.error('Error fetching leads:', err);
            // Treat 500/Connection errors as "no data"
            setLeads([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLeads();
    };

    const handleCreateLead = async () => {
        if (!newLeadData.first_name || !newLeadData.last_name) {
            Alert.alert('Missing Fields', 'Please fill out all required fields.');
            return;
        }

        try {
            setCreatingLead(true);
            const payload = {
                ...newLeadData,
                lead_name: `${newLeadData.first_name} ${newLeadData.last_name}`.trim(),
            };

            const response = await apiService.createLead(payload);
            if (response.message?.toLowerCase().includes('success') || response.name) {
                Alert.alert('Success', 'Lead created successfully!', [
                    {
                        text: 'OK', onPress: () => {
                            setIsCreateModalVisible(false);
                            setNewLeadData({ salutation: 'Mr', first_name: '', last_name: '', source: 'Advertisement', status: 'Lead' });
                            fetchLeads();
                        }
                    }
                ]);
            } else {
                Alert.alert('Oops!', response.message || 'We couldn\'t create the lead.');
            }
        } catch (err) {
            console.error('Error creating lead:', err);
            Alert.alert('Error', 'Failed to connect to service.');
        } finally {
            setCreatingLead(false);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = searchQuery === '' ||
            lead.lead_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.mobile?.includes(searchQuery);

        const matchesFilter = selectedFilter === null || selectedFilter === 'All' ||
            lead.status?.toLowerCase() === selectedFilter.toLowerCase();

        return matchesSearch && matchesFilter;
    });

    const interestedCount = leads.filter(l => l.status?.toLowerCase().includes('interested')).length;
    const convertedCount = leads.filter(l => l.status?.toLowerCase().includes('converted')).length;

    const statusConfig: { [key: string]: { color: string; bg: string; icon: string } } = {
        lead: { color: '#3B82F6', bg: '#3B82F615', icon: 'person-outline' },
        interested: { color: '#F59E0B', bg: '#F59E0B15', icon: 'star-outline' },
        converted: { color: '#10B981', bg: '#10B98115', icon: 'checkmark-done-outline' },
        'do not contact': { color: '#EF4444', bg: '#EF444415', icon: 'close-circle-outline' },
        default: { color: Colors.light.secondary, bg: Colors.light.border + '30', icon: 'help-outline' }
    };

    const getStatusStyle = (status: string) => statusConfig[status?.toLowerCase()] || statusConfig.default;

    const getInitials = (firstName?: string, lastName?: string, leadName?: string) => {
        if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
        if (leadName) {
            const names = leadName.split(' ');
            return names.length >= 2 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : leadName.substring(0, 2).toUpperCase();
        }
        return '??';
    };

    const renderLead = ({ item, index }: { item: Lead, index: number }) => {
        const status = getStatusStyle(item.status || '');
        const initials = getInitials(item.first_name, item.last_name, item.lead_name);

        return (
            <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
                <TouchableOpacity
                    style={[styles.leadCard, { backgroundColor: theme.card }]}
                    activeOpacity={0.8}
                    onPress={() => onLeadPress && onLeadPress(item)}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.avatar, { backgroundColor: theme.primary + '15' }]}>
                            <Text style={[styles.avatarText, { color: theme.primary }]}>{initials}</Text>
                        </View>
                        <View style={styles.leadInfo}>
                            <Text style={[styles.leadName, { color: theme.text }]} numberOfLines={1}>
                                {item.lead_name || `${item.first_name || ''} ${item.last_name || ''}`.trim()}
                            </Text>
                            <Text style={[styles.jobTitle, { color: theme.secondary }]} numberOfLines={1}>
                                {item.job_title || item.customer || 'No Title'}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                            <Ionicons name={status.icon as any} size={12} color={status.color} />
                            <Text style={[styles.statusText, { color: status.color }]}>{item.status || 'Lead'}</Text>
                        </View>
                    </View>

                    <View style={[styles.metadataGrid, { backgroundColor: theme.background }]}>
                        <View style={styles.metaRow}>
                            <View style={styles.metaIconBox}>
                                <Ionicons name="briefcase-outline" size={14} color={theme.secondary} />
                            </View>
                            <Text style={[styles.metaText, { color: theme.secondary }]} numberOfLines={1}>
                                {item.type || 'Direct'} • {item.source || 'Advertisement'}
                            </Text>
                        </View>

                        {(item.email || item.mobile) && (
                            <View style={styles.contactGrid}>
                                {item.email && (
                                    <View style={styles.contactItem}>
                                        <Ionicons name="mail-outline" size={14} color={theme.secondary} />
                                        <Text style={[styles.contactText, { color: theme.secondary }]} numberOfLines={1}>{item.email}</Text>
                                    </View>
                                )}
                                {item.mobile && (
                                    <View style={styles.contactItem}>
                                        <Ionicons name="call-outline" size={14} color={theme.secondary} />
                                        <Text style={[styles.contactText, { color: theme.secondary }]}>{item.mobile}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    <View style={[styles.cardFooter, { borderTopColor: theme.border + '20' }]}>
                        <Text style={[styles.viewDetails, { color: theme.primary }]}>Analysis & Details</Text>
                        <Ionicons name="arrow-forward" size={16} color={theme.primary} />
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
                    <View style={styles.headerTitleArea}>
                        <Text style={[styles.headerSubtitle, { color: theme.secondary }]}>CRM MANAGEMENT</Text>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Lead Database</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setIsCreateModalVisible(true)}
                        style={[styles.addBtn, { backgroundColor: theme.primary }]}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={28} color="white" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View style={styles.bentoStats}>
                <View style={[styles.statBox, { backgroundColor: theme.card, flex: 1.4 }]}>
                    <View style={[styles.statIcon, { backgroundColor: theme.primary + '15' }]}>
                        <Ionicons name="people-outline" size={24} color={theme.primary} />
                    </View>
                    <View>
                        <Text style={[styles.statValue, { color: theme.text }]}>{leads.length}</Text>
                        <Text style={[styles.statLabel, { color: theme.secondary }]}>Total Leads</Text>
                    </View>
                </View>
                <View style={styles.statCol}>
                    <View style={[styles.statBoxMini, { backgroundColor: theme.card }]}>
                        <Text style={[styles.miniStatValue, { color: '#F59E0B' }]}>{interestedCount}</Text>
                        <Text style={[styles.miniStatLabel, { color: theme.secondary }]}>Interested</Text>
                    </View>
                    <View style={[styles.statBoxMini, { backgroundColor: theme.card }]}>
                        <Text style={[styles.miniStatValue, { color: '#10B981' }]}>{convertedCount}</Text>
                        <Text style={[styles.miniStatLabel, { color: theme.secondary }]}>Converted</Text>
                    </View>
                </View>
            </View>

            <View style={[styles.searchArea, { backgroundColor: theme.background }]}>
                <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
                    <Ionicons name="search" size={20} color={theme.secondary} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Find a contact or lead..."
                        placeholderTextColor={theme.secondary + '80'}
                        style={[styles.searchInput, { color: theme.text }]}
                        autoCapitalize="none"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={theme.secondary} />
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {filters.map(filter => {
                        const isActive = (selectedFilter === filter) || (filter === 'All' && selectedFilter === null);
                        return (
                            <TouchableOpacity
                                key={filter}
                                onPress={() => setSelectedFilter(filter === 'All' ? null : filter)}
                                style={[
                                    styles.filterChip,
                                    { backgroundColor: isActive ? theme.primary : theme.card }
                                ]}
                            >
                                <Text style={[
                                    styles.filterText,
                                    { color: isActive ? 'white' : theme.secondary }
                                ]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <FlatList
                data={filteredLeads}
                renderItem={renderLead}
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
                    !loading ? (
                        <Animated.View entering={FadeIn} style={styles.emptyContainer}>
                            <View style={[styles.emptyIconWrapper, { backgroundColor: theme.card }]}>
                                <Ionicons name="people-outline" size={64} color={theme.border} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>No records found</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
                                {searchQuery || selectedFilter
                                    ? "Try adjusting your search or filters."
                                    : "Your lead database is currently empty."}
                            </Text>
                        </Animated.View>
                    ) : (
                        <View style={styles.centerSection}>
                            <ActivityIndicator size="large" color={theme.primary} />
                            <Text style={[styles.loadingText, { color: theme.secondary }]}>Syncing leads...</Text>
                        </View>
                    )
                }
            />

            {/* Modern Create Lead Modal */}
            <Modal visible={isCreateModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalSubtitle, { color: theme.secondary }]}>NEW LEAD ENTRY</Text>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Record Details</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setIsCreateModalVisible(false)}
                                style={[styles.modalClose, { backgroundColor: theme.card }]}
                            >
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
                            <Text style={[styles.formHeader, { color: theme.text }]}>Personal Information</Text>
                            <View style={[styles.formCard, { backgroundColor: theme.card }]}>
                                <Text style={[styles.formLabel, { color: theme.secondary }]}>SALUTATION</Text>
                                <View style={styles.salutationRow}>
                                    {['Mr', 'Mrs', 'Ms', 'Dr'].map((title) => (
                                        <TouchableOpacity
                                            key={title}
                                            onPress={() => setNewLeadData(prev => ({ ...prev, salutation: title }))}
                                            style={[
                                                styles.titleChip,
                                                { backgroundColor: newLeadData.salutation === title ? theme.primary : theme.background }
                                            ]}
                                        >
                                            <Text style={[
                                                styles.titleText,
                                                { color: newLeadData.salutation === title ? 'white' : theme.secondary }
                                            ]}>{title}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={[styles.formLabel, { color: theme.secondary, marginTop: 24 }]}>FIRST NAME</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border + '30' }]}
                                    value={newLeadData.first_name}
                                    onChangeText={(text) => setNewLeadData(prev => ({ ...prev, first_name: text }))}
                                    placeholder="e.g. Samuel"
                                    placeholderTextColor={theme.secondary + '60'}
                                />

                                <Text style={[styles.formLabel, { color: theme.secondary, marginTop: 20 }]}>LAST NAME</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border + '30' }]}
                                    value={newLeadData.last_name}
                                    onChangeText={(text) => setNewLeadData(prev => ({ ...prev, last_name: text }))}
                                    placeholder="e.g. Solomon"
                                    placeholderTextColor={theme.secondary + '60'}
                                />
                            </View>

                            <Text style={[styles.formHeader, { color: theme.text, marginTop: 12 }]}>Source & Status</Text>
                            <View style={[styles.formCard, { backgroundColor: theme.card }]}>
                                <Text style={[styles.formLabel, { color: theme.secondary }]}>LEAD SOURCE</Text>
                                <View style={styles.wrapRow}>
                                    {['Advertisement', 'Website', 'Referral', 'Social Media'].map((source) => (
                                        <TouchableOpacity
                                            key={source}
                                            onPress={() => setNewLeadData(prev => ({ ...prev, source }))}
                                            style={[
                                                styles.pilledChip,
                                                { backgroundColor: newLeadData.source === source ? theme.primary : theme.background }
                                            ]}
                                        >
                                            <Text style={[
                                                styles.pilledText,
                                                { color: newLeadData.source === source ? 'white' : theme.secondary }
                                            ]}>{source}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={[styles.formLabel, { color: theme.secondary, marginTop: 24 }]}>INITIAL STATUS</Text>
                                <View style={styles.wrapRow}>
                                    {['Lead', 'Interested', 'Converted'].map((status) => (
                                        <TouchableOpacity
                                            key={status}
                                            onPress={() => setNewLeadData(prev => ({ ...prev, status }))}
                                            style={[
                                                styles.pilledChip,
                                                { backgroundColor: newLeadData.status === status ? theme.primary : theme.background }
                                            ]}
                                        >
                                            <Text style={[
                                                styles.pilledText,
                                                { color: newLeadData.status === status ? 'white' : theme.secondary }
                                            ]}>{status}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <View style={{ height: 160 }} />
                        </ScrollView>

                        <View style={[styles.modalFooter, { backgroundColor: theme.card, borderTopColor: theme.border + '20' }]}>
                            <TouchableOpacity
                                onPress={() => setIsCreateModalVisible(false)}
                                style={[styles.secondaryBtn, { backgroundColor: theme.background }]}
                            >
                                <Text style={[styles.secondaryBtnText, { color: theme.secondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCreateLead}
                                disabled={creatingLead}
                                style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
                            >
                                {creatingLead ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.primaryBtnText}>Submit Record</Text>
                                )}
                            </TouchableOpacity>
                        </View>
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
    headerContainer: {
        paddingBottom: 8,
    },
    navHeader: {
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: Platform.OS === 'ios' ? 0 : 10,
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
    addBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    bentoStats: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginTop: 16,
        marginBottom: 24,
    },
    statBox: {
        padding: 20,
        borderRadius: 32,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statIcon: {
        width: 52,
        height: 52,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: -1,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: -2,
    },
    statCol: {
        flex: 1,
        gap: 10,
    },
    statBoxMini: {
        flex: 1,
        padding: 12,
        borderRadius: 20,
        justifyContent: 'center',
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    miniStatValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    miniStatLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: -1,
    },
    searchArea: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 54,
        borderRadius: 18,
        paddingHorizontal: 18,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 12,
    },
    filterScroll: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
        marginBottom: 4,
    },
    filterChip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 14,
        marginRight: 10,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '800',
    },
    listContent: {
        paddingBottom: 100,
    },
    leadCard: {
        marginHorizontal: 20,
        marginTop: 16,
        padding: 24,
        borderRadius: 36,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 18,
    },
    avatarText: {
        fontSize: 17,
        fontWeight: '900',
    },
    leadInfo: {
        flex: 1,
    },
    leadName: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    jobTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    metadataGrid: {
        padding: 20,
        borderRadius: 24,
        gap: 16,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    metaIconBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },
    contactGrid: {
        marginTop: 4,
        gap: 10,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.03)',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    contactText: {
        fontSize: 13,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 20,
        gap: 6,
    },
    viewDetails: {
        fontSize: 13,
        fontWeight: '800',
    },
    centerSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 120,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 120,
    },
    emptyIconWrapper: {
        width: 120,
        height: 120,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 28,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '92%',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingTop: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 28,
        marginBottom: 28,
    },
    modalSubtitle: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: -1,
    },
    modalClose: {
        width: 44,
        height: 44,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalForm: {
        paddingHorizontal: 28,
    },
    formHeader: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 16,
        marginLeft: 4,
    },
    formCard: {
        padding: 24,
        borderRadius: 32,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    formLabel: {
        fontSize: 11,
        fontWeight: '800',
        marginBottom: 12,
        letterSpacing: 0.8,
    },
    salutationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    titleChip: {
        flex: 0.23,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 13,
        fontWeight: '800',
    },
    input: {
        height: 58,
        borderRadius: 18,
        paddingHorizontal: 18,
        borderWidth: 1.5,
        fontSize: 15,
        fontWeight: '700',
    },
    wrapRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    pilledChip: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 22,
        margin: 4,
    },
    pilledText: {
        fontSize: 13,
        fontWeight: '800',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 28,
        paddingBottom: Platform.OS === 'ios' ? 44 : 28,
        borderTopWidth: 1,
        gap: 16,
    },
    secondaryBtn: {
        flex: 1,
        height: 60,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryBtnText: {
        fontSize: 16,
        fontWeight: '800',
    },
    primaryBtn: {
        flex: 1.5,
        height: 60,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: -0.3,
    },
});