import React, { useEffect, useState, useMemo } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from "@/src/components/common/ScreenWrapper";
import { themeStore } from "@/src/store/themeStore";
import { GroupStatus } from "@/src/api/dto/constants";
import { GetGroupsApi } from "@/src/api/group/group";
import { listUserExpensesApi } from "@/src/api/expense/expense";
import {BaseGroupDetails, GroupDetails} from "@/src/api/dto/user/group";
import { AppText } from '@/src/components/common/AppText';

import {ExpenseDetailsBasicResponse, ExpenseDetailsResponse} from "@/src/api/dto/expense/expense";
import { ActivityListItem, UnifiedActivityItem } from "@/src/screens/ExpenseChatGroupListScreen_comps/ActivityListItem";
import { SearchHeader } from "@/src/screens/ExpenseChatGroupListScreen_comps/SearchHeader";
import { FilterTabs } from "@/src/screens/ExpenseChatGroupListScreen_comps/FilterTabs";

export type FilterTab = 'All' | 'Chat' | 'Groups' | 'Expenses';

// TODO: Fix the values based on the schema returned by group and expenses

const ExpenseChatGroupListScreen = () => {
    const { t } = useTranslation();
    const isDark = themeStore((state) => state.theme) === 'dark';

    // Master centralized API storage arrays
    const [groups, setGroups] = useState<BaseGroupDetails[]>([]);
    const [expenses, setExpenses] = useState<ExpenseDetailsBasicResponse[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<FilterTab>('All');
    const [searchQuery, setSearchQuery] = useState('');

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
        <ScreenWrapper backgroundColor="#2D6A4F" statusBarStyle="light-content" withPadding={false}>
            {/* Direct Central Header Container Box */}
            <View className="bg-[#2D6A4F] pt-4 pb-6 rounded-b-[30px] w-full">
                <View className="items-center mb-4">
                    <AppText variant="h3" className="text-white">Expenses</AppText>
                </View>

                <SearchHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
                <FilterTabs activeTab={activeTab} onTabSelect={setActiveTab} />
            </View>

            {/* List Canvas Section */}
            <View className="flex-1 mt-4">
                <View className={`flex-1 rounded-t-[24px] overflow-hidden ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
                    {loading && !refreshing ? (
                        <View className="flex-1 justify-center items-center"><ActivityIndicator color="#2D6A4F" size="large" /></View>
                    ) : (
                        <FlatList
                            data={unifiedDisplayItems}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => <ActivityListItem item={item} isDark={isDark} />}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2D6A4F" />
                            }
                            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                            ListEmptyComponent={
                                <View className="items-center pt-20">
                                    <AppText className="opacity-40">
                                        {searchQuery ? t('common.no_results') : t('common.no_items', { item: activeTab })}
                                    </AppText>
                                </View>
                            }
                        />
                    )}
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default ExpenseChatGroupListScreen;