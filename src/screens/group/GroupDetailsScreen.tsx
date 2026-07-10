import React, { useEffect, useState } from 'react';
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
import { GroupOverviewTab } from "@/src/components/user/group/GroupOverviewTab";
import { GroupTransactionsTab } from "@/src/components/user/group/GroupTransactionsTab";
import { GroupSettlementsTab } from "@/src/components/user/group/GroupSettlementsTab";
import { listUserTransfersApi } from "@/src/api/expense/transfer";
import { TransferDetailsBasicResponse } from "@/src/api/dto/expense/transfer";
import { BaseSettlementDetails } from "@/src/api/dto/expense/settlement";
import { GroupInfoView } from "@/src/components/user/group/GroupInfoView";

type GroupTab = 'Overview' | 'Transactions' | 'Settlements' | 'Members';

const GroupDetailsScreen = () => {
    const { theme } = themeStore();
    const router = useRouter();
    const isDark = theme === 'dark';
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

    // --- INTERCEPT ROUTE LAYER IF USER CLICKED ROW SUBSECTION ---
    if (showGroupInfo) {
        return (
            <GroupInfoView
                onBackPress={() => setShowGroupInfo(false)}
                groupData={group!}
                membersData={members}
                onMemberAdded={fetchSettlementTabMetrics} // 👈 Refresh callback provided here
            />
        );
    }

    return (
        <ScreenWrapper backgroundColor="#2D6A4F" statusBarStyle="light-content" withPadding={false}>
            {/* --- FIXED HEADER CONTAINER --- */}
            <View className="bg-[#2D6A4F] pt-4 pb-6 w-full">
                <View className="flex-row items-center justify-between w-full px-4 mb-6">

                    {/* 👈 FIXED BACK BUTTON: Moved completely out of the inner touch target container */}
                    <Pressable onPress={() => router.back()} className="p-2 mr-1 active:opacity-70 z-50">
                        <Iconify icon="heroicons:arrow-left" size={24} color="white"/>
                    </Pressable>

                    {/* TOUCH TARGET INTERCEPTOR LAYER */}
                    <Pressable
                        onPress={() => setShowGroupInfo(true)}
                        className="flex-row items-center flex-1 mr-4 active:opacity-80"
                    >
                        <View
                            className="w-12 h-12 rounded-full bg-white/20 items-center justify-center border border-white/30 overflow-hidden mr-3">
                            {groupLoading ? (
                                <ActivityIndicator color="white" size="small"/>
                            ) : (
                                <Image source={{ uri: group?.icon?.url }} style={{ width: 30, height: 30 }}
                                       contentFit="contain"/>
                            )}
                        </View>

                        <View className="flex-1">
                            <AppText variant="h3" className="text-white font-bold leading-tight" numberOfLines={1}>
                                {groupLoading ? 'Loading metadata...' : (group?.title || 'Group Details')}
                            </AppText>
                            <AppText variant="body-small" className="text-white/70 mt-0.5" numberOfLines={1}>
                                {groupLoading ? '--' : group?.no_of_members} Members
                            </AppText>
                        </View>
                    </Pressable>

                    <View className="flex-row items-center space-x-1">
                        <Pressable className="p-2">
                            <Iconify icon="heroicons:camera" size={24} color="white"/>
                        </Pressable>
                        <Pressable className="p-2">
                            <Iconify icon="heroicons:ellipsis-vertical" size={24} color="white"/>
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
                                className={`px-8 h-12 justify-center rounded-[20px] mr-3 ${isActive ? 'bg-white' : 'bg-white/10'}`}
                            >
                                <AppText variant="body-base"
                                         className={`font-bold ${isActive ? 'text-[#2D6A4F]' : 'text-white'}`}>
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
                                <ActivityIndicator color="#2D6A4F" size="large"/>
                            </View>
                        ) : (
                            <ScrollView
                                className="flex-1 px-4 pt-4"
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl refreshing={transactionsLoading} onRefresh={handleTabRefresh}
                                                    tintColor={isDark ? "white" : "#2D6A4F"}/>
                                }
                            >
                                <GroupTransactionsTab expenses={expenses} transfers={transfers} isDark={isDark}/>
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
                                    tintColor={isDark ? "white" : "#2D6A4F"}
                                />
                            }
                        >
                            {activeTab === 'Overview' && (
                                groupLoading ? (
                                    <ActivityIndicator color="#2D6A4F" size="large" className="mt-8"/>
                                ) : (
                                    <GroupOverviewTab group={group} isDark={isDark}/>
                                )
                            )}

                            {activeTab === 'Settlements' && (
                                settlementsLoading ? (
                                    <ActivityIndicator color="#2D6A4F" size="large" className="mt-8"/>
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
                    className="absolute bottom-10 right-6 w-16 h-16 bg-[#2D6A4F] rounded-full items-center justify-center z-50"
                    onPress={() => router.push("/expense/add")}
                    style={({ pressed }) => [
                        {
                            transform: [{ scale: pressed ? 0.95 : 1 }],
                            ...Platform.select({
                                ios: {
                                    shadowColor: '#000',
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
                    <Iconify icon="heroicons:plus" size={30} color="white"/>
                </Pressable>
            )}
        </ScreenWrapper>
    );
};

export default GroupDetailsScreen;