import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Iconify } from "react-native-iconify";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ScreenWrapper } from "@/src/components/common/ScreenWrapper";
import { AppText } from '@/src/components/common/AppText';
import { themeStore } from "@/src/store/themeStore";
import { GroupDetails } from "@/src/api/dto/user/group";
import { GetGroupByIdApi } from "@/src/api/group/group";
import { GroupOverviewTab } from "@/src/components/user/group/GroupOverviewTab";
import { GroupExpensesTab } from "@/src/components/user/group/GroupExpensesTab";
import { GroupGalleryTab } from "@/src/components/user/group/GroupGalleryTab";

type GroupTab = 'Overview' | 'Expenses' | 'Gallery' | 'Members';

const GroupDetailsScreen = () => {
    const { theme } = themeStore();
    const router = useRouter();
    const isDark = theme === 'dark';
    const { id } = useLocalSearchParams<{ id: string }>();

    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<GroupTab>('Overview');

    const fetchGroupDetails = async () => {
        if (!id) return;
        try {
            const res = await GetGroupByIdApi(Number(id));
            if (res.data) setGroup(res.data);
        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchGroupDetails(); }, [id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchGroupDetails();
    };

    return (
        <ScreenWrapper backgroundColor="#2D6A4F" statusBarStyle="light-content" withPadding={false}>
            {/* --- FIXED HEADER SECTION (Non-Scrollable) --- */}
            <View className="bg-[#2D6A4F] pt-2 pb-6 w-full items-center">
                <View className="flex-row justify-between w-full px-6 mb-4 items-center">
                    <Pressable onPress={() => router.back()} className="p-2 bg-white/10 rounded-full">
                        <Iconify icon="heroicons:chevron-left" size={24} color="white" />
                    </Pressable>
                    <Pressable className="p-2 bg-white/10 rounded-full">
                        <Iconify icon="heroicons:cog-6-tooth" size={24} color="white" />
                    </Pressable>
                </View>

                <View className="items-center px-6 mb-6">
                    <View className="w-24 h-24 rounded-[32px] bg-white shadow-xl overflow-hidden items-center justify-center mb-4 border-4 border-white/20">
                        <Image source={{ uri: group?.icon?.url }} style={{ width: 60, height: 60 }} contentFit="contain" />
                    </View>
                    <AppText variant="h2" className="text-white text-center font-bold text-3xl">
                        {group?.title || 'Loading...'}
                    </AppText>
                    <AppText variant="body-small" className="text-white/60 text-center mt-1 px-4">
                        {group?.description}
                    </AppText>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                    {(['Overview', 'Expenses', 'Gallery', 'Members'] as GroupTab[]).map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <Pressable
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className={`px-8 h-12 justify-center rounded-[20px] mr-3 ${isActive ? 'bg-white' : 'bg-white/10'}`}
                            >
                                <AppText className={`font-bold text-base ${isActive ? 'text-[#2D6A4F]' : 'text-white'}`}>
                                    {tab}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {/* --- FULL HEIGHT CONTENT CONTAINER --- */}
            <View className={`flex-1 rounded-t-[40px] ${isDark ? 'bg-black' : 'bg-white'} overflow-hidden`}>
                <ScrollView
                    className="flex-1"
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? "white" : "#2D6A4F"} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1, paddingTop: 24 }}
                >
                    {loading ? (
                        <View className="flex-1 justify-center items-center"><ActivityIndicator color="#2D6A4F" size="large" /></View>
                    ) : (
                        <View className="flex-1 px-4">
                            {activeTab === 'Overview' && <GroupOverviewTab group={group} isDark={isDark} />}
                            {activeTab === 'Expenses' && <GroupExpensesTab isDark={isDark} />}
                            {activeTab === 'Gallery' && <GroupGalleryTab />}
                        </View>
                    )}
                </ScrollView>
            </View>

            {activeTab === 'Expenses' && (
                <Pressable className="absolute bottom-10 right-6 w-16 h-16 bg-[#2D6A4F] rounded-full items-center justify-center shadow-2xl" onPress={() => router.push("/expense/add")}>
                    <Iconify icon="heroicons:plus" size={30} color="white" />
                </Pressable>
            )}
        </ScreenWrapper>
    );
};

export default GroupDetailsScreen;