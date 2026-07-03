import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Iconify} from "react-native-iconify";
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Image} from 'expo-image';
import {ScreenWrapper} from "@/src/components/common/ScreenWrapper";
import {AppText} from '@/src/components/common/AppText';
import {themeStore} from "@/src/store/themeStore";
import {GroupDetails} from "@/src/api/dto/user/group";
import {GetGroupByIdApi} from "@/src/api/group/group";
import {listUserExpensesApi} from "@/src/api/expense/expense"; // 👈 Imported API
import {ExpenseDetailsBasicResponse} from "@/src/api/dto/expense/expense"; // 👈 Imported Type
import {GroupOverviewTab} from "@/src/components/user/group/GroupOverviewTab";
import {GroupExpensesTab} from "@/src/components/user/group/GroupExpensesTab";
import {GroupGalleryTab} from "@/src/components/user/group/GroupGalleryTab";

type GroupTab = 'Overview' | 'Expenses' | 'Gallery' | 'Members';

const GroupDetailsScreen = () => {
    const {theme} = themeStore();
    const router = useRouter();
    const isDark = theme === 'dark';
    const {id} = useLocalSearchParams<{ id: string }>();

    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [expenses, setExpenses] = useState<ExpenseDetailsBasicResponse[]>([]); // 👈 Global State Matrix
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<GroupTab>('Overview');

    const fetchGroupDetails = async () => {
        if (!id) return;
        try {
            // Parallel execution matrix synchronizing profile meta and specific group ledger logs
            const [groupRes, expensesRes] = await Promise.all([
                GetGroupByIdApi(Number(id)),
                listUserExpensesApi({group_id: [Number(id)], limit: 50})
            ]);

            if (groupRes.data) setGroup(groupRes.data);
            if (expensesRes?.data) setExpenses(expensesRes.data);
        } catch (error) {
            console.error("Fetch operational matrix failed:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchGroupDetails();
    }, [id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchGroupDetails();
    };

    return (
        <ScreenWrapper backgroundColor="#2D6A4F" statusBarStyle="light-content" withPadding={false}>
            {/* --- FIXED HEADER SECTION (Non-Scrollable) --- */}
            <View className="bg-[#2D6A4F] pt-4 pb-6 w-full">
                <View className="flex-row items-center justify-between w-full px-4 mb-6">
                    <View className="flex-row items-center flex-1 mr-4">
                        <Pressable onPress={() => router.back()} className="p-2 mr-1">
                            <Iconify icon="heroicons:arrow-left" size={24} color="white"/>
                        </Pressable>

                        <View
                            className="w-12 h-12 rounded-full bg-white/20 items-center justify-center border border-white/30 overflow-hidden mr-3">
                            <Image source={{uri: group?.icon?.url}} style={{width: 30, height: 30}}
                                   contentFit="contain"/>
                        </View>

                        <View className="flex-1">
                            <AppText variant="h3" className="text-white font-bold leading-tight" numberOfLines={1}>
                                {group?.title || 'Loading...'}
                            </AppText>
                            <AppText variant="body-small" className="text-white/70 mt-0.5" numberOfLines={1}>
                                {group?.members?.length || 1} Members
                            </AppText>
                        </View>
                    </View>

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
                            contentContainerStyle={{paddingHorizontal: 24}}>
                    {(['Overview', 'Expenses', 'Gallery', 'Members'] as GroupTab[]).map((tab) => {
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

            {/* --- FULL HEIGHT CONTENT CONTAINER --- */}
            <View className={`flex-1 rounded-t-[20px] ${isDark ? 'bg-black' : 'bg-white'} overflow-hidden`}>
                <ScrollView
                    className="flex-1"
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}
                                                    tintColor={isDark ? "white" : "#2D6A4F"}/>}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{flexGrow: 1, paddingTop: 24}}
                >
                    {loading ? (
                        <View className="flex-1 justify-center items-center"><ActivityIndicator color="#2D6A4F"
                                                                                                size="large"/></View>
                    ) : (
                        <View className="flex-1 px-4">
                            {activeTab === 'Overview' && <GroupOverviewTab group={group} isDark={isDark}/>}
                            {/* 👈 Pass Down Data to clean presenting component */}
                            {activeTab === 'Expenses' && <GroupExpensesTab expenses={expenses} isDark={isDark}/>}
                            {activeTab === 'Gallery' && <GroupGalleryTab/>}
                        </View>
                    )}
                </ScrollView>
            </View>

            {activeTab === 'Expenses' && (
                <Pressable
                    className="absolute bottom-10 right-6 w-16 h-16 bg-[#2D6A4F] rounded-full items-center justify-center shadow-2xl"
                    onPress={() => router.push("/expense/add")}>
                    <Iconify icon="heroicons:plus" size={30} color="white"/>
                </Pressable>
            )}
        </ScreenWrapper>
    );
};

export default GroupDetailsScreen;