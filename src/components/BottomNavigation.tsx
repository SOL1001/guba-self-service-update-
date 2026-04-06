import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PopupMenu from './PopupMenu';
import { Colors } from '../constants/Theme';

interface BottomNavigationProps {
    activeTab: string;
    onTabPress: (tab: string) => void;
    onMenuItemPress?: (itemId: string) => void;
}

interface TabItem {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
}

export default function BottomNavigation({ activeTab, onTabPress, onMenuItemPress }: BottomNavigationProps) {
    const [showPopupMenu, setShowPopupMenu] = useState(false);
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const tabs = useMemo<TabItem[]>(() => [
        { id: 'home', label: 'Home', icon: 'home-sharp' },
        { id: 'updates', label: 'Updates', icon: 'grid' },
        { id: 'approval', label: 'Approval', icon: 'checkmark-circle' },
        { id: 'profile', label: 'Profile', icon: 'person' },
    ], []);

    const [leftTabs, rightTabs] = useMemo(() => [
        tabs.slice(0, 2),
        tabs.slice(2)
    ], [tabs]);

    const handleAddPress = useCallback(() => {
        setShowPopupMenu(true);
    }, []);

    const handleMenuClose = useCallback(() => {
        setShowPopupMenu(false);
    }, []);

    const handleMenuItemPress = useCallback((item: string) => {
        handleMenuClose();
        if (onMenuItemPress) {
            onMenuItemPress(item);
        }
    }, [handleMenuClose, onMenuItemPress]);

    const handleTabPress = useCallback((tabId: string) => {
        onTabPress(tabId);
    }, [onTabPress]);

    const renderTabItem = useCallback((tab: TabItem) => {
        const isActive = activeTab === tab.id;
        const iconColor = isActive ? theme.primary : theme.secondary;
        const textColor = isActive ? theme.primary : theme.secondary;

        return (
            <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                onPress={() => handleTabPress(tab.id)}
                accessibilityLabel={`${tab.label} tab`}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
            >
                <Ionicons name={tab.icon} size={22} color={iconColor} />
                <Text style={[styles.tabText, { color: textColor }]} numberOfLines={1}>
                    {tab.label}
                </Text>
            </TouchableOpacity>
        );
    }, [activeTab, handleTabPress, theme]);

    return (
        <View style={[styles.container, { backgroundColor: theme.card }]}>
            <View style={[styles.curvedLine, { backgroundColor: theme.border }]} />
            <View style={[styles.curvedOverlay, { backgroundColor: theme.card }]} />

            <View style={styles.tabsContainer}>
                <View style={styles.tabGroup}>
                    {leftTabs.map(renderTabItem)}
                </View>

                <View style={styles.centerButtonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.centerButton,
                            { backgroundColor: showPopupMenu ? theme.error : theme.primary }
                        ]}
                        onPress={showPopupMenu ? handleMenuClose : handleAddPress}
                    >
                        <Ionicons name={showPopupMenu ? 'close' : 'add'} size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.tabGroup}>
                    {rightTabs.map(renderTabItem)}
                </View>
            </View>

            <PopupMenu
                visible={showPopupMenu}
                onClose={handleMenuClose}
                onItemPress={handleMenuItemPress}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: Platform.OS === 'android' ? 0 : 0,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    curvedLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        zIndex: 1,
    },
    curvedOverlay: {
        position: 'absolute',
        top: 0,
        left: '50%',
        marginLeft: -60,
        width: 120,
        height: 25,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        zIndex: 2,
    },
    tabsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    tabGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 8,
    },
    tabText: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: '600',
    },
    centerButtonContainer: {
        paddingHorizontal: 20,
        position: 'relative',
    },
    centerButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        top: -30,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
});
