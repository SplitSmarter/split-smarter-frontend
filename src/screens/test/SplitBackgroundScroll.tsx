import React from 'react';
import { View, ScrollView, Dimensions, Pressable, Platform, StatusBar } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppText } from "@/src/components/common/AppText";
import { AppImageV2 } from "@/src/components/common/AppImageV2";
import { themeStore } from "@/src/store/themeStore";
import { COLORS } from "@/src/constants/colors";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TOP_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.22;

const STATUS_BAR_PADDING = Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 16);

const GROUP_META = {
    title: "Trip to Goa",
    coverUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
    avatarUrl: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3",
};

const MOCK_MEMBERS = [
    { id: 1, name: 'You', role: 'Coordinator', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' },
    { id: 2, name: 'Alex Johnson', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' },
    { id: 3, name: 'Sarah Smith', role: 'Member', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' },
    { id: 4, name: 'John Doe', role: 'Member', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' },
    { id: 5, name: 'Emma Watson', role: 'Member', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80' },
];

export const SplitBackgroundScroll = () => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';

    const headerHeight = Platform.OS === 'ios' ? 95 : 75;

    return (
        <View className="flex-1 bg-background">

            {/* 1. TOP UTILITY ACTION BAR */}
            <View
                style={{ height: headerHeight, paddingTop: STATUS_BAR_PADDING }}
                className="absolute top-0 left-0 right-0 w-full flex-row items-center justify-between px-6 z-50"
            >
                <Pressable
                    onPress={() => console.log("Back Pressed")}
                    className="w-10 h-10 items-center justify-center bg-black/40 rounded-full active:opacity-70"
                >
                    <Iconify icon="heroicons:arrow-left" size={24} color="#FFFFFF" />
                </Pressable>

                <Pressable
                    onPress={() => console.log("Share Pressed")}
                    className="w-10 h-10 items-center justify-center bg-black/40 rounded-full active:opacity-70"
                >
                    <Iconify icon="heroicons:share-20-solid" size={24} color={COLORS.light.bg.primary} />
                </Pressable>
            </View>

            {/* 2. BACKGROUND LAYER (Cover Image Canvas) */}
            <View style={{ height: TOP_IMAGE_HEIGHT }} className="absolute top-0 left-0 right-0 w-full z-1 overflow-hidden rounded-b-[40px]">
                <AppImageV2
                    id="group_cover_bg"
                    url={GROUP_META.coverUrl}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                />
            </View>

            {/* 3. SCROLLABLE INTERACTION SURFACE */}
            <ScrollView
                className="flex-1 z-10"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ top: -40 }}
            >
                {/* A. TRANSPARENT HEADER ZONE */}
                <View style={{ height: TOP_IMAGE_HEIGHT }} className="relative justify-end">
                    <View className="absolute inset-0 bg-black/10 rounded-b-[40px]" />
                </View>

                {/* B. SOLID CARD BASE BLOCK */}
                <View className="bg-background rounded-t-[40px] px-6 pt-16 pb-20 min-h-[600px] relative -mt-6 shadow-2xl">

                    {/* FLOATING AVATAR LOCATION */}
                    <View
                        style={{ top: -40, width: 80, height: 80, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 15 }}
                        className="absolute self-center rounded-full bg-background z-50 overflow-hidden items-center justify-center"
                    >
                        {GROUP_META.avatarUrl ? (
                            <AppImageV2
                                id="group_avatar_floating"
                                url={GROUP_META.avatarUrl}
                                style={{ width: '100%', height: '100%', borderRadius: 9999 }}
                                contentFit="cover"
                            />
                        ) : (
                            <View className="w-full h-full items-center justify-center bg-zinc-800 rounded-full">
                                <Iconify icon="heroicons:user-group-solid" size={45} color="#FFFFFF" />
                            </View>
                        )}
                    </View>

                    {/* GROUP META: NAME & INTERACTION HEADERS */}
                    <View className="items-center mb-8 mt-2">
                        <AppText variant="h1" className="text-foreground font-extrabold text-center mb-3 text-4xl tracking-tight">
                            {GROUP_META.title}
                        </AppText>

                        <Pressable
                            onPress={() => console.log("Add Member Pressed")}
                            className="flex-row items-center active:opacity-60 py-1"
                        >
                            <Iconify icon="heroicons:user-plus" size={16} color={COLORS.dark.icon.brand} />
                            <AppText className="text-bg-secondary font-semibold ml-1.5 text-sm">
                                Add Members?
                            </AppText>
                        </Pressable>
                    </View>

                    {/* MEMBERS SECTION LIST ROUTINE */}
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-4 pb-2">
                            <AppText variant="h4" className="text-foreground font-bold text-xl">
                                Members
                            </AppText>
                            <View className="px-3 py-1 rounded-full bg-bg-primary-darker">
                                <AppText className="font-medium text-xs text-text-primary-lighter">
                                    {MOCK_MEMBERS.length} Total
                                </AppText>
                            </View>
                        </View>

                        {MOCK_MEMBERS.map((member) => (
                            <View
                                key={`member-row-${member.id}`}
                                className="flex-row items-center justify-between p-4 rounded-2xl mb-3 bg-bg-primary-lighter border border-bg-primary-darker"
                            >
                                <View className="flex-row items-center flex-1 pr-4">
                                    <View className="p-0.5 rounded-full w-10 h-10 overflow-hidden items-center justify-center border border-text-primary-placeholder">
                                        <AppImageV2
                                            id={`member_avatar_${member.id}`}
                                            url={member.avatar}
                                            style={{ width: '100%', height: '100%', borderRadius: 9999 }}
                                            contentFit="cover"
                                        />
                                    </View>
                                    <AppText numberOfLines={1} className="text-foreground font-medium ml-4 text-base flex-1">
                                        {member.name}
                                    </AppText>
                                </View>

                                {/* Role Badge */}
                                <View className="px-4 py-1.5 rounded-full bg-bg-primary border border-bg-primary-darker">
                                    <AppText className="font-medium tracking-wide text-xs text-text-primary-lighter">
                                        {member.role}
                                    </AppText>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* HISTORICAL ACCESSIBLE CONTENT SPACES */}
                    <AppText variant="h4" className="text-foreground font-bold mb-4 text-xl">
                        Recent Activity
                    </AppText>
                    <View className="h-28 rounded-2xl p-4 justify-center items-center bg-bg-primary border border-bg-primary-darker">
                        <AppText className="text-text-primary-lighter">No active operational actions logged.</AppText>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
};