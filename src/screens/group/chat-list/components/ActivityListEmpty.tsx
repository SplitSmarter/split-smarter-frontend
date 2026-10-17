import React from 'react';
import {View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {useRouter} from 'expo-router';
import {SheetEmptyState} from '@/src/components/empty-states/SheetEmptyState';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import type {FilterTab} from '../types';

interface ActivityListEmptyProps {
    activeTab: FilterTab;
    searchQuery: string;
    onClearSearch: () => void;
}

export function ActivityListEmpty({
    activeTab,
    searchQuery,
    onClearSearch,
}: ActivityListEmptyProps) {
    const router = useRouter();
    const isDark = themeStore((state) => state.theme === 'dark');
    const iconColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length > 0) {
        return (
            <View className="flex-1 justify-center pt-10">
                <SheetEmptyState
                    icon={
                        <Iconify
                            icon="heroicons:magnifying-glass-minus"
                            size={32}
                            color={iconColor}
                        />
                    }
                    title="No results found"
                    description={`Nothing matched “${trimmedQuery}”. Try another search or create something new.`}
                    primaryAction={{
                        label: 'Clear Search',
                        onPress: onClearSearch,
                        renderIcon: (color) => (
                            <Iconify icon="heroicons:x-mark" size={18} color={color} />
                        ),
                    }}
                />
            </View>
        );
    }

    if (activeTab === 'Groups') {
        return (
            <View className="flex-1 justify-center pt-10">
                <SheetEmptyState
                    icon={
                        <Iconify icon="heroicons:user-group" size={32} color={iconColor} />
                    }
                    title="No groups yet"
                    description="Create a group to split expenses and track shared spending with others."
                    primaryAction={{
                        label: 'Create New Group',
                        onPress: () => router.push('/(authenticated)/user/group/add'),
                        renderIcon: (color) => (
                            <Iconify icon="heroicons:plus-circle" size={18} color={color} />
                        ),
                    }}
                />
            </View>
        );
    }

    if (activeTab === 'Expenses') {
        return (
            <View className="flex-1 justify-center pt-10">
                <SheetEmptyState
                    icon={
                        <Iconify icon="heroicons:banknotes" size={32} color={iconColor} />
                    }
                    title="No expenses yet"
                    description="Add your first expense to start tracking spending and splits."
                    primaryAction={{
                        label: 'Add Expense',
                        onPress: () => router.push('/expense/add'),
                        renderIcon: (color) => (
                            <Iconify icon="heroicons:plus-circle" size={18} color={color} />
                        ),
                    }}
                />
            </View>
        );
    }

    if (activeTab === 'Chat') {
        return (
            <View className="flex-1 justify-center pt-10">
                <SheetEmptyState
                    icon={
                        <Iconify
                            icon="heroicons:chat-bubble-left-right"
                            size={32}
                            color={iconColor}
                        />
                    }
                    title="No chats yet"
                    description="Group conversations will show up here once you start chatting."
                />
            </View>
        );
    }

    // All — both sources empty
    return (
        <View className="flex-1 justify-center pt-10">
            <SheetEmptyState
                icon={
                    <Iconify icon="heroicons:squares-plus" size={32} color={iconColor} />
                }
                title="Nothing here yet"
                description="Add an expense or create a group to get started."
                primaryAction={{
                    label: 'Add Expense',
                    onPress: () => router.push('/expense/add'),
                    renderIcon: (color) => (
                        <Iconify icon="heroicons:plus-circle" size={18} color={color} />
                    ),
                }}
                secondaryAction={{
                    label: 'Create New Group',
                    onPress: () => router.push('/(authenticated)/user/group/add'),
                }}
            />
        </View>
    );
}
