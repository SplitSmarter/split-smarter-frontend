import React, { useEffect, useState } from 'react';
import { COLORS, PLATINUM_HEADER } from '@/src/constants/colors';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View, Platform, BackHandler } from 'react-native';
import { Iconify } from "react-native-iconify";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ScreenWrapper } from "@/src/components/common/ScreenWrapper";
import { AppText } from '@/src/components/common/AppText';
import { themeStore } from "@/src/store/themeStore";
import { GroupDetails, GroupMemberDetails } from "@/src/api/dto/user/group";
import { GetGroupByIdApi, GetGroupMembershipsApi, GetGroupSettlementsApi } from "@/src/api/group/group";
import { listUserExpensesApi } from "@/src/api/expense/expense";
import { ExpenseDetailsBasicResponse } from "@/src/api/dto/expense/expense";
import { GroupOverviewTab } from "./components/GroupOverviewTab";
import { GroupTransactionsTab } from "./components/GroupTransactionsTab";
import { GroupSettlementsTab } from "./components/GroupSettlementsTab";
import { listUserTransfersApi } from "@/src/api/expense/transfer";
import { TransferDetailsBasicResponse } from "@/src/api/dto/expense/transfer";
import { BaseSettlementDetails } from "@/src/api/dto/expense/settlement";
import { GroupInfoView } from "./components/GroupInfoView";
import {logStore} from "@/src/store/logStore";
import {expenseDetailsSheetStore} from '@/src/store/expenseDetailsSheetStore';

type GroupTab = 'Overview' | 'Transactions' | 'Settlements' | 'Members';

const GroupDetailsScreen = () => {
    const { theme } = themeStore();
    const router = useRouter();
    const isDark = theme === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;
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

    const fetchGroupMeta = async () => {
        if (!groupId) return;
        try {
            setGroupLoading(true);
            const res = await GetGroupByIdApi(groupId);
            if (res?.data) setGroup(res.data);
        } catch (err) {
            console.error("Failed to fetch group metadata:", err);
        } finally {
            setGroupLoading(false);
        }
    };

    const fetchTransactionTabMetrics = async () => {
        if (!groupId) return;
        try {
            setTransactionsLoading(true);
            const [expensesRes, transfersRes] = await Promise.all([
                listUserExpensesApi({ group_id: [groupId], limit: 50 }),
                listUserTransfersApi({ group_id: [groupId], limit: 50 })
            ]);
            if (expensesRes?.data) setExpenses(expensesRes.data);
            if (transfersRes?.data) setTransfers(transfersRes.data);
        } catch (err) {
            console.error("Failed to fetch transaction data layers:", err);
        } finally {
            setTransactionsLoading(false);
        }
    };

    const fetchSettlementTabMetrics = async () => {
        if (!groupId) return;
        try {
            setSettlementsLoading(true);
            const [membersRes, historyRes] = await Promise.all([
                GetGroupMembershipsApi(groupId),
                GetGroupSettlementsApi(groupId, { limit: 50 })
            ]);
            if (membersRes?.data) setMembers(membersRes.data);
            if (historyRes?.data) setSettlementHistory(historyRes.data);
        } catch (err) {
            console.error("Failed to fetch settlements layout components:", err);
        } finally {
            setSettlementsLoading(false);
        }
    };

    useEffect(() => {
        if (groupId) {
            fetchGroupMeta();
            fetchTransactionTabMetrics();
            fetchSettlementTabMetrics();
        }
    }, [groupId]);

    const handleTabRefresh = async () => {
        if (activeTab === 'Transactions') {
            await fetchTransactionTabMetrics();
        } else if (activeTab === 'Settlements') {
            await fetchSettlementTabMetrics();
        } else {
            await fetchGroupMeta();
        }
    };

    const handleNavigateToUserProfile = () => {
        router.push("/(authenticated)/user/details" as any);
    };

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
            backgroundColor={isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light}
            statusBarStyle="light-content"
            withPadding={false}
        >
            {/* --- FIXED HEADER — metallic slate (always dark) --- */}
            <View
                className="w-full pb-6 pt-4"
                style={{backgroundColor: isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light}}
            >
                <View className="mb-6 w-full flex-row items-center justify-between px-4">

                    {/* 👈 FIXED BACK BUTTON: Moved completely out of the inner touch target container */}
                    <Pressable onPress={() => router.back()} className="z-50 mr-1 p-2 active:opacity-70">
                        <Iconify icon="heroicons:arrow-left" size={24} color={headerIconColor}/>
                    </Pressable>

                    {/* TOUCH TARGET INTERCEPTOR LAYER */}
                    <Pressable
                        onPress={() => setShowGroupInfo(true)}
                        className="mr-4 flex-1 flex-row items-center active:opacity-80"
                    >
                        <View
                            className="mr-3 h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/20">
                            {groupLoading ? (
                                <ActivityIndicator color={headerIconColor} size="small"/>
                            ) : (
                                <Image source={{ uri: group?.icon?.url }} style={{ width: 30, height: 30 }}
                                       contentFit="contain"/>
                            )}
                        </View>

                        <View className="flex-1">
                            <AppText variant="h3" className="font-bold leading-tight text-white" numberOfLines={1}>
                                {groupLoading ? 'Loading metadata...' : (group?.title || 'Group Details')}
                            </AppText>
                            <AppText variant="body-small" className="mt-0.5 text-white/70" numberOfLines={1}>
                                {groupLoading ? '--' : group?.no_of_members} Members
                            </AppText>
                        </View>
                    </Pressable>

                    <View className="flex-row items-center space-x-1">
                        <Pressable className="p-2">
                            <Iconify icon="heroicons:camera" size={24} color={headerIconColor}/>
                        </Pressable>
                        <Pressable className="p-2">
                            <Iconify icon="heroicons:ellipsis-vertical" size={24} color={headerIconColor}/>
                        </Pressable>
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 24 }}>
                    {(['Overview', 'Transactions', 'Settlements', 'Members'] as GroupTab[]).map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <Pressable
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className={`mr-3 h-12 justify-center rounded-[20px] px-8 ${isActive ? 'bg-white' : 'bg-white/10'}`}
                            >
                                <AppText variant="body-base"
                                         className={`font-bold ${isActive ? 'text-slate-900' : 'text-white'}`}>
                                    {tab}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {/* --- SHEET CANVAS CONTENT WRAPPER --- */}
            <View className={`flex-1 rounded-t-[20px] ${isDark ? 'bg-black' : 'bg-white'} overflow-hidden`}>
                <View className="flex-1">
                    {activeTab === 'Transactions' ? (
                        transactionsLoading ? (
                            <View className="flex-1 justify-center items-center">
                                <ActivityIndicator color={COLORS.light.icon.primary} size="large"/>
                            </View>
                        ) : (
                            <ScrollView
                                className="flex-1 px-4 pt-4"
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl refreshing={transactionsLoading} onRefresh={handleTabRefresh}
                                                    tintColor={isDark ? headerIconColor : COLORS.light.icon.primary}/>
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
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={activeTab === 'Settlements' ? settlementsLoading : groupLoading}
                                    onRefresh={handleTabRefresh}
                                    tintColor={isDark ? headerIconColor : COLORS.light.icon.primary}
                                />
                            }
                        >
                            {activeTab === 'Overview' && (
                                groupLoading ? (
                                    <ActivityIndicator color={COLORS.light.icon.primary} size="large" className="mt-8"/>
                                ) : (
                                    <GroupOverviewTab group={group} isDark={isDark}/>
                                )
                            )}

                            {activeTab === 'Settlements' && (
                                settlementsLoading ? (
                                    <ActivityIndicator color={COLORS.light.icon.primary} size="large" className="mt-8"/>
                                ) : (
                                    <GroupSettlementsTab
                                        groupId={groupId}
                                        isDark={isDark}
                                        members={members}
                                        history={settlementHistory}
                                    />
                                )
                            )}
                        </ScrollView>
                    )}
                </View>
            </View>

            {/* --- FIXED FLOATING ACTION BUTTON --- */}
            {activeTab === 'Transactions' && (
                <Pressable
                    className="absolute bottom-10 right-6 w-16 h-16 bg-bg-secondary rounded-full items-center justify-center z-50"
                    onPress={() => router.push("/expense/add")}
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
                >
                    <Iconify icon="heroicons:plus" size={30} color={colors.text.contrast}/>
                </Pressable>
            )}
        </ScreenWrapper>
    );
};

export default GroupDetailsScreen;