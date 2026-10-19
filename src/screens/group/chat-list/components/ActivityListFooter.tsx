import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useRouter} from 'expo-router';
import {Iconify} from 'react-native-iconify';
import {AppButton} from '@/src/components/common/AppButton';
import {AppText} from '@/src/components/common/AppText';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {ROUTES} from '@/src/constants/routes';
import type {FilterTab} from '@/src/screens/group/chat-list/types';

type Props = {
    activeTab: FilterTab;
    hasItems: boolean;
    loadingMore: boolean;
    /** When true, expense pagination may still have more pages */
    hasMoreExpenses: boolean;
    isSearching: boolean;
};

function endMessage(activeTab: FilterTab, isSearching: boolean): string {
    if (isSearching) return 'No more results';
    switch (activeTab) {
        case 'Groups':
            return 'No more groups';
        case 'Expenses':
            return 'No more expenses';
        case 'Chat':
            return 'No more chats';
        case 'All':
        default:
            return 'No more groups or expenses';
    }
}

export function ActivityListFooter({
    activeTab,
    hasItems,
    loadingMore,
    hasMoreExpenses,
    isSearching,
}: Props) {
    const router = useRouter();
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    if (loadingMore) {
        return (
            <View className="items-center py-4">
                <ActivityIndicator color={colors.icon.primary} />
            </View>
        );
    }

    if (!hasItems) return null;

    const canPaginate = activeTab === 'All' || activeTab === 'Expenses';
    if (canPaginate && hasMoreExpenses && !isSearching) {
        return <View className="h-6" />;
    }

    return (
        <View className="w-full px-6 pb-6 pt-4">
            <AppText
                variant="caption-xs"
                className="mb-4 text-center text-text-primary-lighter"
            >
                {endMessage(activeTab, isSearching)}
            </AppText>
            <AppButton
                variant="primary"
                size="md"
                className="w-full"
                onPress={() => router.push(ROUTES.expenseAdd())}
                renderIcon={(c, s) => (
                    <Iconify icon="heroicons:plus-circle" size={s} color={c} />
                )}
            >
                Add expense
            </AppButton>
        </View>
    );
}
