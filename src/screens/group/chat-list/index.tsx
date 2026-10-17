import React, { useEffect, useState, useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { COLORS, PLATINUM_HEADER } from '@/src/constants/colors';
import { View, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from "@/src/components/common/ScreenWrapper";
import { themeStore } from "@/src/store/themeStore";
import { GroupStatus } from "@/src/api/dto/constants";
import { GetGroupsApi } from "@/src/api/group/group";
import { listUserExpensesApi } from "@/src/api/expense/expense";
import {BaseGroupDetails} from "@/src/api/dto/user/group";
import { AppText } from '@/src/components/common/AppText';

import {ExpenseDetailsBasicResponse} from "@/src/api/dto/expense/expense";
import { ActivityListItem, UnifiedActivityItem } from "./components/ActivityListItem";
import { ActivityListEmpty } from "./components/ActivityListEmpty";
import { SearchHeader } from "./components/SearchHeader";
import { FilterTabs } from "./components/FilterTabs";
import type { FilterTab } from "./types";

export type { FilterTab };

const FILTER_TABS: FilterTab[] = ['All', 'Chat', 'Groups', 'Expenses'];

function parseFilterTab(raw: string | string[] | undefined): FilterTab | null {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value) return null;
    return FILTER_TABS.includes(value as FilterTab) ? (value as FilterTab) : null;
}

// TODO: Fix the values based on the schema returned by group and expenses

const ExpenseChatGroupListScreen = () => {
    const isDark = themeStore((state) => state.theme) === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;
    const headerChrome = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;
    const params = useLocalSearchParams<{ tab?: string }>();

    // Master centralized API storage arrays
    const [groups, setGroups] = useState<BaseGroupDetails[]>([]);
    const [expenses, setExpenses] = useState<ExpenseDetailsBasicResponse[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<FilterTab>(
        () => parseFilterTab(params.tab) ?? 'All',
    );
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const next = parseFilterTab(params.tab);
        if (next) setActiveTab(next);
    }, [params.tab]);

    const fetchData = async () => {
        try {
            const [groupsRes, expensesRes] = await Promise.all([
                GetGroupsApi({ statuses: [GroupStatus.ACTIVE] }),
                listUserExpensesApi({ limit: 50 })
            ]);

            if (groupsRes?.data) setGroups(groupsRes.data);
            if (expensesRes?.data) setExpenses(expensesRes.data);
        } catch (error) {
            console.error("Central synchronization operational matrix failure:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Transform and map multi-source arrays into a unified display list
    const unifiedDisplayItems = useMemo(() => {
        let combinedList: UnifiedActivityItem[] = [];

        // 1. Inject Groups into matrix
        if (activeTab === 'All' || activeTab === 'Groups') {
            groups.forEach(g => {
                combinedList.push({
                    id: `group-${g.id}`,
                    rawId: g.id,
                    type: 'group',
                    title: g.title,
                    subtitle: g.description || null,
                    timestamp: g.updated_at,
                    avatarUrl: g.icon.url,
                    rawItem: g
                });
            });
        }

        // 2. Inject Expenses into matrix
        if (activeTab === 'All' || activeTab === 'Expenses') {
            expenses.forEach(e => {
                // 👈 FIX: If on 'All' tab, exclude expenses that belong to a group to prevent clutter
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
                    rawItem: e
                });
            });
        }

        // 3. Apply Text Search Query Filters Globally
        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            combinedList = combinedList.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.subtitle?.toLowerCase().includes(query)
            );
        }

        // 4. Sort downstream entities chronologically
        return combinedList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [groups, expenses, activeTab, searchQuery]);

    return (
        <ScreenWrapper
            // Light: slate under status bar (matches header). Dark: deepest body so gaps stay black.
            backgroundColor={isDark ? colors.bg.primary : headerChrome}
            statusBarStyle="light-content"
            withPadding={false}
        >
            {/* Metallic slate header chrome (always dark) */}
            <View
                className="w-full rounded-b-[30px] pb-6 pt-4"
                style={{backgroundColor: headerChrome}}
            >
                <View className="mb-4 items-center">
                    <AppText variant="h3" className="text-white">Expenses</AppText>
                </View>

                <SearchHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
                <FilterTabs activeTab={activeTab} onTabSelect={setActiveTab} />
            </View>

            {/* List canvas — COLORS.bg.primary */}
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
                        renderItem={({ item }) => <ActivityListItem item={item} isDark={isDark} />}
                        style={{backgroundColor: colors.bg.primary}}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                tintColor={colors.icon.primary}
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
        </ScreenWrapper>
    );
};

export default ExpenseChatGroupListScreen;