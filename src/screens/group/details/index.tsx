import React, { useCallback, useEffect, useState } from 'react';
import { COLORS, PLATINUM_HEADER } from '@/src/constants/colors';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View, Platform, BackHandler } from 'react-native';
import { Iconify } from "react-native-iconify";
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenWrapper } from "@/src/components/common/ScreenWrapper";
import { AppText } from '@/src/components/common/AppText';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { EntityFallbackIcon } from '@/src/components/common/EntityFallbackIcon';
import { themeStore } from "@/src/store/themeStore";
import { GroupDetails, GroupMemberDetails } from "@/src/api/dto/user/group";
import { GetGroupByIdApi, GetGroupMembershipsApi, GetGroupSettlementsApi } from "@/src/api/group/group";
import { listUserExpensesApi } from "@/src/api/expense/expense";
import { ExpenseDetailsBasicResponse } from "@/src/api/dto/expense/expense";
import { BudgetRuleListItem } from "@/src/api/dto/expense/budget";
import { BudgetAudienceType } from "@/src/api/dto/expense/constant";
import { listBudgetRulesApi } from "@/src/api/expense/budget";
import { GroupOverviewTab } from "@/src/screens/group/details/components/GroupOverviewTab";
import { GroupTransactionsTab } from "@/src/screens/group/details/components/GroupTransactionsTab";
import { GroupSettlementsTab } from "@/src/screens/group/details/components/GroupSettlementsTab";
import { GroupMembersTab } from "@/src/screens/group/details/components/GroupMembersTab";
import { GroupBudgetsTab } from "@/src/screens/group/details/components/GroupBudgetsTab";
import { listUserTransfersApi } from "@/src/api/expense/transfer";
import { TransferDetailsBasicResponse } from "@/src/api/dto/expense/transfer";
import { BaseSettlementDetails } from "@/src/api/dto/expense/settlement";
import { GroupInfoView } from "@/src/screens/group/details/components/GroupInfoView";
import {expenseDetailsSheetStore} from '@/src/store/expenseDetailsSheetStore';
import {ROUTES} from '@/src/constants/routes';

type GroupTab = 'Overview' | 'Transactions' | 'Settlements' | 'Members' | 'Budgets';

const GroupDetailsScreen = () => {
    const { theme } = themeStore();
    const router = useRouter();
    const isDark = theme === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;
    const headerChrome = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;
    const headerIconColor = COLORS.light.text.contrast;
    const { id } = useLocalSearchParams<{ id: string }>();
    const groupId = Number(id);

    const [activeTab, setActiveTab] = useState<GroupTab>('Settlements');

    // UI Routing State to switch to the info view
    const [showGroupInfo, setShowGroupInfo] = useState(false);

    // 1. Group Core Information States
    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [groupLoading, setGroupLoading] = useState(true);

    // 2. Transactions Tab States
    const [expenses, setExpenses] = useState<ExpenseDetailsBasicResponse[]>([]);
    const [transfers, setTransfers] = useState<TransferDetailsBasicResponse[]>([]);
    const [transactionsLoading, setTransactionsLoading] = useState(true);

    // 3. Settlements Tab States
    const [members, setMembers] = useState<GroupMemberDetails[]>([]);
    const [settlementHistory, setSettlementHistory] = useState<BaseSettlementDetails[]>([]);
    const [settlementsLoading, setSettlementsLoading] = useState(true);

    // 4. Budgets Tab States
    const [budgets, setBudgets] = useState<BudgetRuleListItem[]>([]);
    const [budgetsLoading, setBudgetsLoading] = useState(true);

    // Pull-to-refresh only — keeps page spinner off while RefreshControl is active
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const onBackPress = () => {
            if (showGroupInfo) {
                setShowGroupInfo(false);
                return true;
            }
            return false;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
    }, [showGroupInfo]);

    const fetchGroupMeta = async (opts?: {isRefresh?: boolean}) => {
        if (!groupId) return;
        const isRefresh = opts?.isRefresh === true;
        try {
            if (!isRefresh) setGroupLoading(true);
            const res = await GetGroupByIdApi(groupId);
            if (res?.data) setGroup(res.data);
        } catch (err) {
            console.error("Failed to fetch group metadata:", err);
        } finally {
            if (!isRefresh) setGroupLoading(false);
        }
    };

    const fetchTransactionTabMetrics = async (opts?: {isRefresh?: boolean}) => {
        if (!groupId) return;
        const isRefresh = opts?.isRefresh === true;
        try {
            if (!isRefresh) setTransactionsLoading(true);
            const [expensesRes, transfersRes] = await Promise.all([
                listUserExpensesApi({ group_id: [groupId], limit: 50 }),
                listUserTransfersApi({ group_id: [groupId], limit: 50 })
            ]);
            if (expensesRes?.data) setExpenses(expensesRes.data);
            if (transfersRes?.data) setTransfers(transfersRes.data);
        } catch (err) {
            console.error("Failed to fetch transaction data layers:", err);
        } finally {
            if (!isRefresh) setTransactionsLoading(false);
        }
    };

    const fetchSettlementTabMetrics = async (opts?: {isRefresh?: boolean}) => {
        if (!groupId) return;
        const isRefresh = opts?.isRefresh === true;
        try {
            if (!isRefresh) setSettlementsLoading(true);
            const [membersRes, historyRes] = await Promise.all([
                GetGroupMembershipsApi(groupId),
                GetGroupSettlementsApi(groupId, { limit: 50 })
            ]);
            if (membersRes?.data) setMembers(membersRes.data);
            if (historyRes?.data) setSettlementHistory(historyRes.data);
        } catch (err) {
            console.error("Failed to fetch settlements layout components:", err);
        } finally {
            if (!isRefresh) setSettlementsLoading(false);
        }
    };

    const fetchBudgetsTabMetrics = async (opts?: {isRefresh?: boolean}) => {
        if (!groupId) return;
        const isRefresh = opts?.isRefresh === true;
        try {
            if (!isRefresh) setBudgetsLoading(true);
            const res = await listBudgetRulesApi({
                group_id: groupId,
                audience_type: BudgetAudienceType.GROUP,
                limit: 50,
            });
            if (res?.data) setBudgets(res.data);
        } catch (err) {
            console.error("Failed to fetch group budgets:", err);
        } finally {
            if (!isRefresh) setBudgetsLoading(false);
        }
    };

    useEffect(() => {
        if (groupId) {
            fetchGroupMeta();
            fetchTransactionTabMetrics();
            fetchSettlementTabMetrics();
            fetchBudgetsTabMetrics();
        }
    }, [groupId]);

    // Soft-refresh budgets when returning to this screen on the Budgets tab (e.g. after create)
    useFocusEffect(
        useCallback(() => {
            if (activeTab === 'Budgets' && groupId) {
                fetchBudgetsTabMetrics({isRefresh: true});
            }
        }, [activeTab, groupId]),
    );

    const handleTabRefresh = async () => {
        setRefreshing(true);
        try {
            if (activeTab === 'Transactions') {
                await fetchTransactionTabMetrics({isRefresh: true});
            } else if (activeTab === 'Settlements' || activeTab === 'Members') {
                await fetchSettlementTabMetrics({isRefresh: true});
            } else if (activeTab === 'Budgets') {
                await fetchBudgetsTabMetrics({isRefresh: true});
            } else {
                await fetchGroupMeta({isRefresh: true});
            }
        } finally {
            setRefreshing(false);
        }
    };

    const handleCreateBudget = () => {
        router.push({
            pathname: '/(authenticated)/expense/budget/add',
            params: {
                groupId: String(groupId),
                groupName: group?.title ?? '',
            },
        } as any);
    };

    const handleNavigateToUserProfile = (_userId: number, _userType: string) => {
        router.push("/(authenticated)/user/details" as any);
    };

    const memberCount = group?.no_of_members ?? 0;
    const membersLabel =
        memberCount === 1 ? '1 member' : `${memberCount} members`;
    const categoryLabel = group?.category?.title?.trim();
    const headerSubtitle = groupLoading
        ? 'Loading group…'
        : categoryLabel
            ? `${categoryLabel} · ${membersLabel}`
            : membersLabel;

    // --- INTERCEPT ROUTE LAYER IF USER CLICKED ROW SUBSECTION ---
    if (showGroupInfo) {
        return (
            <GroupInfoView
                onBackPress={() => setShowGroupInfo(false)}
                groupData={group!}
                membersData={members}
                onMemberAdded={fetchSettlementTabMetrics} // 👈 Refresh callback provided here
                onNavigateToUserProfile={handleNavigateToUserProfile}
            />
        );
    }

    return (
        <ScreenWrapper
            // Slate under status bar + behind sheet corners so rounded-t reads as inverted U in both themes.
            backgroundColor={headerChrome}
            statusBarStyle="light-content"
            withPadding={false}
        >
            {/* Flat-bottom platinum chrome — curve lives on the canvas sheet below (inverted U). */}
            <View
                className="w-full pb-6 pt-4"
                style={{backgroundColor: headerChrome}}
            >
                <View className="mb-5 w-full flex-row items-center px-4">
                    <Pressable
                        onPress={() => router.back()}
                        className="mr-2 h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 active:opacity-70"
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <Iconify icon="heroicons:chevron-left" size={22} color={headerIconColor}/>
                    </Pressable>

                    <Pressable
                        onPress={() => setShowGroupInfo(true)}
                        className="mr-2 min-w-0 flex-1 flex-row items-center active:opacity-80"
                        accessibilityRole="button"
                        accessibilityLabel="Open group info"
                    >
                        <View className="mr-3 h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-white/15">
                            <AppImageV2
                                id={group?.icon?.id ?? `group-icon-${groupId}`}
                                url={group?.icon?.url}
                                style={{width: '100%', height: '100%'}}
                                contentFit="cover"
                                fallbackComponent={
                                    <EntityFallbackIcon
                                        kind="group"
                                        size={22}
                                        color={COLORS.light.icon.lighter}
                                    />
                                }
                            />
                        </View>

                        <View className="min-w-0 flex-1">
                            <AppText
                                variant="h3"
                                className="font-semibold leading-tight text-white"
                                numberOfLines={1}
                            >
                                {groupLoading ? 'Group' : (group?.title?.trim() || 'Untitled group')}
                            </AppText>
                            <AppText
                                variant="caption-xs"
                                className="mt-0.5 text-white/70"
                                numberOfLines={1}
                            >
                                {headerSubtitle}
                            </AppText>
                        </View>

                        <Iconify
                            icon="heroicons:chevron-right"
                            size={16}
                            color="rgba(255,255,255,0.55)"
                        />
                    </Pressable>

                    <View className="flex-row items-center">
                        <Pressable
                            className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 active:opacity-70"
                            accessibilityRole="button"
                            accessibilityLabel="Group media"
                        >
                            <Iconify icon="heroicons:camera" size={20} color={headerIconColor}/>
                        </Pressable>
                        <Pressable
                            className="ml-2 h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 active:opacity-70"
                            accessibilityRole="button"
                            accessibilityLabel="More options"
                        >
                            <Iconify icon="heroicons:ellipsis-vertical" size={20} color={headerIconColor}/>
                        </Pressable>
                    </View>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{paddingHorizontal: 16}}
                >
                    {(['Overview', 'Transactions', 'Settlements', 'Members', 'Budgets'] as GroupTab[]).map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <Pressable
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className={`mr-3 rounded-full px-5 py-2 ${
                                    isActive ? 'bg-white' : 'bg-white/10'
                                }`}
                                accessibilityRole="tab"
                                accessibilityState={{selected: isActive}}
                            >
                                <AppText
                                    variant="body-small"
                                    className={`font-medium ${
                                        isActive ? 'text-slate-900' : 'text-white/80'
                                    }`}
                                >
                                    {tab}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Canvas body — inverted U nest under platinum chrome */}
            <View
                className="flex-1 overflow-hidden rounded-t-[28px] pt-4"
                style={{
                    backgroundColor: colors.bg.primary,
                    marginTop: -12,
                }}
            >
                <View className="flex-1">
                    {activeTab === 'Transactions' ? (
                        transactionsLoading && !refreshing ? (
                            <View className="flex-1 items-center justify-center">
                                <ActivityIndicator color={colors.icon.primary} size="large"/>
                            </View>
                        ) : (
                            <ScrollView
                                className="flex-1 px-4 pt-4"
                                style={{backgroundColor: colors.bg.primary}}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={handleTabRefresh}
                                        tintColor={colors.icon.primary}
                                    />
                                }
                            >
                                <GroupTransactionsTab
                                    expenses={expenses}
                                    transfers={transfers}
                                    isDark={isDark}
                                    onTransactionPress={(tx) => {
                                        if (tx.type !== 'EXPENSE') return;
                                        expenseDetailsSheetStore.getState().open(
                                            tx.originalId,
                                            {seed: tx.expenseRaw ?? null}
                                        );
                                    }}
                                />
                            </ScrollView>
                        )
                    ) : (
                        <ScrollView
                            className="flex-1 px-4 pt-6"
                            style={{backgroundColor: colors.bg.primary}}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={handleTabRefresh}
                                    tintColor={colors.icon.primary}
                                />
                            }
                        >
                            {activeTab === 'Overview' && (
                                groupLoading && !refreshing ? (
                                    <ActivityIndicator
                                        color={colors.icon.primary}
                                        size="large"
                                        className="mt-8"
                                    />
                                ) : (
                                    <GroupOverviewTab group={group} isDark={isDark}/>
                                )
                            )}

                            {activeTab === 'Settlements' && (
                                settlementsLoading && !refreshing ? (
                                    <ActivityIndicator
                                        color={colors.icon.primary}
                                        size="large"
                                        className="mt-8"
                                    />
                                ) : (
                                    <GroupSettlementsTab
                                        groupId={groupId}
                                        isDark={isDark}
                                        members={members}
                                        history={settlementHistory}
                                    />
                                )
                            )}

                            {activeTab === 'Members' && (
                                <GroupMembersTab
                                    members={members}
                                    loading={settlementsLoading && !refreshing}
                                    onMemberChanged={fetchSettlementTabMetrics}
                                    onNavigateToUserProfile={handleNavigateToUserProfile}
                                    onAddMember={() => setShowGroupInfo(true)}
                                />
                            )}

                            {activeTab === 'Budgets' && (
                                <GroupBudgetsTab
                                    budgets={budgets}
                                    loading={budgetsLoading && !refreshing}
                                    onCreatePress={handleCreateBudget}
                                />
                            )}
                        </ScrollView>
                    )}
                </View>
            </View>

            {/* --- FIXED FLOATING ACTION BUTTON --- */}
            {(activeTab === 'Transactions' || activeTab === 'Budgets') && (
                <Pressable
                    className="absolute bottom-10 right-6 w-16 h-16 bg-bg-secondary rounded-full items-center justify-center z-50"
                    onPress={() => {
                        if (activeTab === 'Budgets') {
                            handleCreateBudget();
                            return;
                        }
                        router.push(
                            ROUTES.expenseAdd({groupId, tab: 'expense'}) as any,
                        );
                    }}
                    style={({ pressed }) => [
                        {
                            transform: [{ scale: pressed ? 0.95 : 1 }],
                            ...Platform.select({
                                ios: {
                                    shadowColor: COLORS.light.brand.primary,
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 4.65,
                                },
                                android: {
                                    elevation: 8,
                                },
                            }),
                        }
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={
                        activeTab === 'Budgets' ? 'Create budget' : 'Add expense'
                    }
                >
                    <Iconify icon="heroicons:plus" size={30} color={colors.text.contrast}/>
                </Pressable>
            )}
        </ScreenWrapper>
    );
};

export default GroupDetailsScreen;