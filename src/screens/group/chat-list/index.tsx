import React, {useEffect, useMemo, useState} from 'react';
import {useLocalSearchParams} from 'expo-router';
import {COLORS, PLATINUM_HEADER} from '@/src/constants/colors';
import {View, FlatList, RefreshControl, ActivityIndicator, Pressable} from 'react-native';
import {format, parseISO} from 'date-fns';
import {Iconify} from 'react-native-iconify';
import {ScreenWrapper} from '@/src/components/common/ScreenWrapper';
import {AppText} from '@/src/components/common/AppText';
import {DateRangeBottomSheet} from '@/src/components/common/DateRangeBottomSheet';
import type {DateRangeResult} from '@/src/components/common/types/dateRangeBottomSheet.types';
import {themeStore} from '@/src/store/themeStore';
import {ActivityListItem, UnifiedActivityItem} from '@/src/screens/group/chat-list/components/ActivityListItem';
import {ActivityListEmpty} from '@/src/screens/group/chat-list/components/ActivityListEmpty';
import {ActivityListFooter} from '@/src/screens/group/chat-list/components/ActivityListFooter';
import {SearchHeader} from '@/src/screens/group/chat-list/components/SearchHeader';
import {FilterTabs} from '@/src/screens/group/chat-list/components/FilterTabs';
import {useChatListData} from '@/src/screens/group/chat-list/hooks/useChatListData';
import type {FilterTab} from '@/src/screens/group/chat-list/types';

export type {FilterTab};

const FILTER_TABS: FilterTab[] = ['All', 'Chat', 'Groups', 'Expenses'];

function parseFilterTab(raw: string | string[] | undefined): FilterTab | null {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value) return null;
    return FILTER_TABS.includes(value as FilterTab) ? (value as FilterTab) : null;
}

function formatRangeLabel(range: DateRangeResult): string {
    try {
        const start = format(parseISO(range.startDate), 'dd MMM');
        const end = format(parseISO(range.endDate), 'dd MMM yyyy');
        return `${start} – ${end}`;
    } catch {
        return `${range.startDate} – ${range.endDate}`;
    }
}

const ExpenseChatGroupListScreen = () => {
    const isDark = themeStore((state) => state.theme) === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;
    const headerChrome = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;
    const params = useLocalSearchParams<{tab?: string}>();

    const [activeTab, setActiveTab] = useState<FilterTab>(
        () => parseFilterTab(params.tab) ?? 'All',
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRangeVisible, setDateRangeVisible] = useState(false);
    const [dateRange, setDateRange] = useState<DateRangeResult | null>(null);

    const {
        groups,
        expenses,
        loading,
        refreshing,
        loadingMore,
        hasMoreExpenses,
        handleRefresh,
        loadMoreExpenses,
    } = useChatListData(dateRange);

    useEffect(() => {
        const next = parseFilterTab(params.tab);
        if (next) setActiveTab(next);
    }, [params.tab]);

    const unifiedDisplayItems = useMemo(() => {
        let combinedList: UnifiedActivityItem[] = [];

        if (activeTab === 'All' || activeTab === 'Groups') {
            groups.forEach((g) => {
                const memberLabel =
                    g.no_of_members === 1
                        ? '1 member'
                        : `${g.no_of_members} members`;
                combinedList.push({
                    id: `group-${g.id}`,
                    rawId: g.id,
                    type: 'group',
                    title: g.title,
                    subtitle: memberLabel,
                    timestamp: g.last_activity?.created_at ?? '',
                    avatarUrl: g.icon?.url,
                    rawItem: g,
                });
            });
        }

        if (activeTab === 'All' || activeTab === 'Expenses') {
            expenses.forEach((e) => {
                if (activeTab === 'All' && e.group !== null) {
                    return;
                }

                combinedList.push({
                    id: `expense-${e.id}`,
                    rawId: e.id,
                    type: 'expense',
                    title: e.name,
                    subtitle: `${e.currency} ${e.total_amount.toFixed(2)} • ${e.status}`,
                    timestamp: e.expense_date,
                    avatarUrl: e.category?.icon.url,
                    rawItem: e,
                });
            });
        }

        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            combinedList = combinedList.filter(
                (item) =>
                    item.title.toLowerCase().includes(query) ||
                    item.subtitle?.toLowerCase().includes(query),
            );
        }

        return combinedList.sort((a, b) => {
            const tb = new Date(b.timestamp).getTime() || 0;
            const ta = new Date(a.timestamp).getTime() || 0;
            return tb - ta;
        });
    }, [groups, expenses, activeTab, searchQuery]);

    const shouldPaginateExpenses = activeTab === 'All' || activeTab === 'Expenses';

    return (
        <ScreenWrapper
            backgroundColor={headerChrome}
            statusBarStyle="light-content"
            withPadding={false}
        >
            <View
                className="w-full rounded-b-[30px] pb-6 pt-4"
                style={{backgroundColor: headerChrome}}
            >
                <View className="mb-4 flex-row items-center justify-between px-4">
                    <View className="w-10" />
                    <AppText variant="h3" className="text-white">
                        Expenses
                    </AppText>
                    <Pressable
                        onPress={() => setDateRangeVisible(true)}
                        accessibilityRole="button"
                        accessibilityLabel="Select date range"
                        className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/20 active:opacity-70"
                    >
                        <Iconify
                            icon="heroicons:calendar"
                            size={18}
                            color={COLORS.light.text.contrast}
                        />
                    </Pressable>
                </View>

                {dateRange ? (
                    <View className="mb-3 px-4">
                        <Pressable
                            onPress={() => setDateRangeVisible(true)}
                            className="flex-row items-center self-start gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5"
                        >
                            <Iconify
                                icon="heroicons:calendar-days"
                                size={14}
                                color={COLORS.light.text.contrast}
                            />
                            <AppText variant="caption-xs" className="font-semibold text-white">
                                {formatRangeLabel(dateRange)}
                            </AppText>
                            <Pressable
                                onPress={() => setDateRange(null)}
                                hitSlop={8}
                                accessibilityRole="button"
                                accessibilityLabel="Clear date filter"
                            >
                                <Iconify
                                    icon="heroicons:x-mark"
                                    size={14}
                                    color={COLORS.light.text.contrast}
                                />
                            </Pressable>
                        </Pressable>
                    </View>
                ) : null}

                <SearchHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
                <FilterTabs activeTab={activeTab} onTabSelect={setActiveTab} />
            </View>

            <View
                className="flex-1 overflow-hidden rounded-t-[24px] pt-4"
                style={{backgroundColor: colors.bg.primary}}
            >
                {loading && !refreshing ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator color={colors.icon.primary} size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={unifiedDisplayItems}
                        keyExtractor={(item) => item.id}
                        renderItem={({item}) => (
                            <ActivityListItem item={item} isDark={isDark} />
                        )}
                        style={{backgroundColor: colors.bg.primary}}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                tintColor={colors.icon.primary}
                            />
                        }
                        onEndReached={() => {
                            if (shouldPaginateExpenses && hasMoreExpenses) {
                                void loadMoreExpenses();
                            }
                        }}
                        onEndReachedThreshold={0.4}
                        ListFooterComponent={
                            <ActivityListFooter
                                activeTab={activeTab}
                                hasItems={unifiedDisplayItems.length > 0}
                                loadingMore={loadingMore}
                                hasMoreExpenses={hasMoreExpenses}
                                isSearching={searchQuery.trim().length > 0}
                            />
                        }
                        contentContainerStyle={{
                            paddingBottom: 100,
                            paddingTop: 10,
                            flexGrow: unifiedDisplayItems.length === 0 ? 1 : undefined,
                        }}
                        ListEmptyComponent={
                            <ActivityListEmpty
                                activeTab={activeTab}
                                searchQuery={searchQuery}
                                onClearSearch={() => setSearchQuery('')}
                            />
                        }
                    />
                )}
            </View>

            <DateRangeBottomSheet
                visible={dateRangeVisible}
                initialStartDate={dateRange?.startDate}
                initialEndDate={dateRange?.endDate}
                title="Select duration"
                confirmLabel="Apply range"
                onClose={() => setDateRangeVisible(false)}
                onConfirm={(result) => {
                    setDateRange(result);
                    setDateRangeVisible(false);
                }}
                onClearFilter={() => setDateRange(null)}
            />
        </ScreenWrapper>
    );
};

export default ExpenseChatGroupListScreen;
