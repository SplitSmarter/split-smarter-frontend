import { format, isToday, isYesterday } from 'date-fns';
import { Image } from 'expo-image';
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, TextInput, View } from 'react-native';
import { Iconify } from "react-native-iconify";

import { GroupStatus } from "@/src/api/dto/constants";
import { GroupDetails } from "@/src/api/dto/user/group";
import { GetGroupsApi } from "@/src/api/group/group";
import { AppText } from '@/src/components/common/AppText';
import { ScreenWrapper } from "@/src/components/common/ScreenWrapper";
import { themeStore } from "@/src/store/themeStore";
import { GroupActivityHelper } from "@/src/utils/GroupActivityHelper";

type FilterTab = 'All' | 'Chat' | 'Groups' | 'Expenses';

const GroupListScreen = () => {
    const { t } = useTranslation();
    const { theme } = themeStore();
    const router = useRouter();
    const isDark = theme === 'dark';

    // Master data from API
    const [allGroups, setAllGroups] = useState<GroupDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // UI State
    const [activeTab, setActiveTab] = useState<FilterTab>('All');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchGroups = async () => {
        try {
            const res = await GetGroupsApi({ statuses: [GroupStatus.ACTIVE] });
            if (res.data) {
                setAllGroups(res.data);
            }
        } catch (error) {
            console.error("Fetch groups failed:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchGroups();
    };

    const displayedItems = useMemo(() => {
        let filtered = allGroups;

        if (activeTab === 'Chat' || activeTab === 'Expenses') {
            filtered = [];
        }

        if (searchQuery.trim().length > 0) {
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [allGroups, activeTab, searchQuery]);

    const renderTime = (dateString: string) => {
        const date = new Date(dateString);
        if (isToday(date)) return format(date, 'h:mm a');
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'dd/MM/yyyy');
    };

    const renderGroupItem = ({ item }: { item: GroupDetails }) => {
        const lastActivity = item.activities?.[0];
        const activitySummary = lastActivity
            ? GroupActivityHelper.getSummary(lastActivity)
            : t('group.noActivity', 'No recent activity');

        return (
            <Pressable
                className={`flex-row items-center p-4 mb-1 border-b ${
                    isDark ? 'border-gray-800' : 'border-gray-100'
                }`}
                onPress={() => {
                    router.push(`/(authenticated)/group/details?id=${item.id}`);
                }}
            >
                <View className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden items-center justify-center">
                    <Image
                        source={{ uri: item.icon.url }}
                        style={{ width: 40, height: 40 }}
                        contentFit="contain"
                    />
                </View>

                <View className="flex-1 ml-4">
                    <View className="flex-row justify-between items-center">
                        <AppText variant="h4" className="text-lg" numberOfLines={1}>{item.title}</AppText>
                        <AppText variant="caption-xs" className="opacity-60">{renderTime(item.updated_at)}</AppText>
                    </View>
                    <View className="flex-row justify-between items-center mt-1">
                        <AppText variant="body-small" className="opacity-50 flex-1 mr-2" numberOfLines={1}>
                            {activitySummary}
                        </AppText>
                        {item.activities.length > 0 && (
                            <View
                                className="bg-[#52B788] px-2 h-5 rounded-full items-center justify-center min-w-[20px]">
                                <AppText className="text-white text-[10px] font-bold">{item.activities.length}</AppText>
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <ScreenWrapper backgroundColor="#2D6A4F" statusBarStyle="light-content" withPadding={false}>
            {/* Header Section */}
            <View className="bg-[#2D6A4F] pt-4 pb-6 rounded-b-[30px] w-full">
                <View className="items-center mb-4">
                    <AppText variant="h3" className="text-white">Expenses</AppText>
                </View>

                {/* Search Bar */}
                <View className="px-4 mb-4">
                    <View className="bg-white flex-row items-center px-4 h-12 rounded-full">
                        <Iconify icon="heroicons:magnifying-glass" size={20} color="#666"/>
                        <TextInput
                            placeholder="Type to search"
                            className="flex-1 ml-2 text-base h-full"
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => setSearchQuery('')}>
                                <Iconify icon="heroicons:x-mark" size={18} color="#666"/>
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Filter Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                    {(['All', 'Chat', 'Groups', 'Expenses'] as FilterTab[]).map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <Pressable
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className={`px-8 py-2 rounded-full mr-3 ${
                                    isActive ? 'bg-[#409167]' : 'bg-transparent'
                                } border border-white/20`}
                            >
                                <AppText className={`font-medium ${isActive ? 'text-white' : 'text-white/70'}`}>
                                    {tab}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {/* List Section */}
            <View className="flex-1 mt-4">
                <View className={`flex-1 rounded-t-[24px] overflow-hidden ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
                    <FlatList
                        data={displayedItems}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderGroupItem}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D6A4F" />
                        }
                        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                        ListEmptyComponent={
                            !loading ? (
                                <View className="items-center pt-20">
                                    <AppText className="opacity-40">
                                        {searchQuery ? t('common.no_results') : t('common.no_items', {item: activeTab})}
                                    </AppText>
                                </View>
                            ) : (
                                <View className="pt-20"><ActivityIndicator color="#2D6A4F" /></View>
                            )
                        }
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default GroupListScreen;