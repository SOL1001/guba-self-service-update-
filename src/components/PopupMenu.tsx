import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    StyleSheet,
    useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Theme';

interface PopupMenuProps {
    visible: boolean;
    onClose: () => void;
    onItemPress: (item: string) => void;
}

const menuItems = [
    { id: 'expense', title: 'Create Expense', icon: 'wallet-outline', color: '#10B981' },
    { id: 'leave', title: 'Apply Leave', icon: 'bed-outline', color: '#3B82F6' },
    { id: 'order', title: 'Create Order', icon: 'list-outline', color: '#8B5CF6' },
    { id: 'visit', title: 'Visit', icon: 'person-add-outline', color: '#F59E0B' },
    { id: 'task', title: 'Task', icon: 'checkmark-circle-outline', color: '#EF4444' },
    { id: 'payment-entry', title: 'Payment Entry', icon: 'card-outline', color: '#06B6D4' },
    { id: 'petty-expense', title: 'Petty Expense', icon: 'cash-outline', color: '#84CC16' },
];

export default function PopupMenu({ visible, onClose, onItemPress }: PopupMenuProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View style={[styles.menuContainer, { backgroundColor: theme.card }]}>
                            <View style={styles.itemsWrapper}>
                                {menuItems.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.menuItem}
                                        onPress={() => {
                                            onItemPress(item.id);
                                            onClose();
                                        }}
                                    >
                                        <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                                            <Ionicons name={item.icon as any} size={20} color={item.color} />
                                        </View>
                                        <Text style={[styles.itemText, { color: theme.text }]}>
                                            {item.title}
                                        </Text>
                                        <Ionicons name="chevron-forward" size={16} color={theme.icon} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
        borderRadius: 16,
        marginHorizontal: 24,
        marginBottom: 96,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    itemsWrapper: {
        gap: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    itemText: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
});
