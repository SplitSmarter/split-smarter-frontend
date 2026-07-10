import React, { useState, useMemo } from 'react';
import { View, ScrollView, Dimensions, Pressable, Platform, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppText } from "@/src/components/common/AppText";
import { AppImageV2 } from "@/src/components/common/AppImageV2";
import { GroupDetails, GroupMemberDetails } from "@/src/api/dto/user/group";
import { GroupJoinMethod } from "@/src/api/dto/constants";
import { HiddenUserTarget, SelectSinglePeopleBottomSheet } from "@/src/components/user/SelectSinglePeopleBottomSheet";
import { JoinGroupApi } from "@/src/api/group/membership";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TOP_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.25;
const STATUS_BAR_PADDING = Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 16);

interface GroupInfoViewProps {
    onBackPress: () => void;
    groupData: GroupDetails;
    membersData: GroupMemberDetails[];
    onMemberAdded?: () => void;
}

export const GroupInfoView: React.FC<GroupInfoViewProps> = ({
                                                                onBackPress,
                                                                groupData,
                                                                membersData,
                                                                onMemberAdded,
                                                            }) => {
    const headerHeight = Platform.OS === 'ios' ? 95 : 75;

    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);

    const coverUrl = groupData.background?.url;
    const avatarUrl = groupData.icon?.url;
    const totalMembers = groupData.no_of_members ?? membersData.length;

    const hiddenUsersList = useMemo<HiddenUserTarget[]>(() => {
        if (!membersData) return [];
        return membersData.map(member => ({
            id: member.id,
            user_type: member.user_type
        }));
    }, [membersData]);

    const handleSelectPerson = async (userId: number, userType: any) => {
        try {
            setIsAddingUser(true);
            const payload = {
                group_id: groupData.id,
                user_id: userId,
                user_type: userType
            };

            const response = await JoinGroupApi(payload, GroupJoinMethod.ADD_USER);

            if (response && response.data !== undefined) {
                Alert.alert("Success", "Member successfully added to group.");
                if (onMemberAdded) onMemberAdded(); // 👈 Triggers re-fetching metrics up top
            } else {
                Alert.alert("Error", response?.message || "Failed to add member to group.");
            }
        } catch (err) {
            console.error("Failed to add user payload:", err);
            Alert.alert("Error", "A network tracking error occurred.");
        } finally {
            setIsAddingUser(false);
        }
    };

    return (
        <View className="flex-1 bg-background">

            {/* 1. TOP UTILITY ACTION BAR */}
            <View
                style={{ height: headerHeight, paddingTop: STATUS_BAR_PADDING }}
                className="absolute top-0 left-0 right-0 w-full flex-row items-center justify-between px-6 z-50"
            >
                <Pressable
                    onPress={onBackPress}
                    className="w-10 h-10 items-center justify-center bg-black/40 rounded-full active:opacity-70"
                >
                    <Iconify icon="heroicons:arrow-left" size={24} color="#FFFFFF" />
                </Pressable>

                <View className="w-10 h-10" />
            </View>

            {/* 2. BACKGROUND LAYER */}
            <View
                style={{ height: TOP_IMAGE_HEIGHT }}
                className="absolute top-0 left-0 right-0 w-full z-1 overflow-hidden rounded-b-[40px]"
            >
                {coverUrl ? (
                    <AppImageV2
                        id={groupData.background?.id ? `${groupData.background.id}` : "group_cover_bg"}
                        url={coverUrl}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                    />
                ) : (
                    <View style={{ backgroundColor: '#2D6A4F', width: '100%', height: '100%' }} />
                )}
            </View>

            {/* 3. SCROLLABLE INTERACTION SURFACE */}
            <ScrollView
                className="flex-1 z-10"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ top: -40 }}
            >
                <View style={{ height: TOP_IMAGE_HEIGHT }} className="relative justify-end">
                    <View className="absolute inset-0 bg-black/10 rounded-b-[40px]" />
                </View>

                <View className="bg-background rounded-t-[40px] px-6 pt-16 pb-20 min-h-[600px] relative -mt-6 shadow-2xl">

                    {/* FLOATING AVATAR LOCATION */}
                    <View
                        style={{ top: -40, width: 80, height: 80, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 15 }}
                        className="absolute self-center rounded-full bg-background z-50 overflow-hidden items-center justify-center"
                    >
                        {avatarUrl ? (
                            <AppImageV2
                                id="group_avatar_floating"
                                url={avatarUrl}
                                style={{ width: '100%', height: '100%', borderRadius: 9999 }}
                                contentFit="cover"
                            />
                        ) : (
                            <View className="w-full h-full items-center justify-center bg-zinc-800 rounded-full">
                                <Iconify icon="heroicons:user-group-solid" size={40} color="#FFFFFF" />
                            </View>
                        )}
                    </View>

                    {/* GROUP META: NAME & ADD MEMBERS SECTION */}
                    <View className="items-center mb-8 mt-2">
                        <AppText variant="h1" className="text-foreground font-extrabold text-center mb-3 text-4xl tracking-tight">
                            {groupData.title || 'Group Details'}
                        </AppText>

                        {isAddingUser ? (
                            <ActivityIndicator size="small" color="#2D6A4F" className="py-1" />
                        ) : (
                            <Pressable
                                onPress={() => setIsBottomSheetVisible(true)}
                                className="flex-row items-center py-1 active:opacity-60"
                            >
                                <Iconify icon="heroicons:user-plus" size={16} color="#2D6A4F" />
                                <AppText className="text-[#2D6A4F] font-semibold ml-1.5 text-sm">
                                    Add Members
                                </AppText>
                            </Pressable>
                        )}
                    </View>

                    {/* MEMBERS SECTION LIST ROUTINE */}
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-4 pb-2">
                            <AppText variant="h4" className="text-foreground font-bold text-xl">
                                Members
                            </AppText>
                            <View className="px-3 py-1 rounded-full bg-bg-primary-darker">
                                <AppText className="font-medium text-xs text-text-primary-lighter">
                                    {totalMembers} Total
                                </AppText>
                            </View>
                        </View>

                        {membersData && membersData.length > 0 ? (
                            membersData.map((membership) => (
                                <View
                                    key={`${membership.id}_${membership.user_type}`}
                                    className="flex-row items-center justify-between p-4 rounded-2xl mb-3 bg-bg-primary-lighter border border-bg-primary-darker"
                                >
                                    <View className="flex-row items-center flex-1 pr-4">
                                        <View className="p-0.5 rounded-full w-10 h-10 overflow-hidden items-center justify-center border border-text-primary-placeholder">
                                            {membership.avatar?.url ? (
                                                <AppImageV2
                                                    id={`${membership.avatar.id}`}
                                                    url={membership.avatar.url}
                                                    style={{ width: '100%', height: '100%', borderRadius: 9999 }}
                                                    contentFit="cover"
                                                />
                                            ) : (
                                                <View className="w-full h-full items-center justify-center bg-zinc-700 rounded-full">
                                                    <Iconify icon="heroicons:user" size={18} color="#FFFFFF" />
                                                </View>
                                            )}
                                        </View>
                                        <AppText numberOfLines={1} className="text-foreground font-medium ml-4 text-base flex-1">
                                            {membership?.name || 'Unknown User'}
                                        </AppText>
                                    </View>

                                    <View className="px-4 py-1.5 rounded-full bg-bg-primary border border-bg-primary-darker">
                                        <AppText className="font-medium tracking-wide text-xs text-text-primary-lighter capitalize">
                                            {membership.role?.toLowerCase() || 'member'}
                                        </AppText>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View className="p-4 rounded-2xl bg-bg-primary border border-bg-primary-darker items-center">
                                <AppText className="text-text-primary-lighter text-sm">No member details available.</AppText>
                            </View>
                        )}
                    </View>

                    {/* GROUP ACTIVITIES PLACEHOLDER ZONE */}
                    <AppText variant="h4" className="text-foreground font-bold mb-4 text-xl">
                        Group Activities
                    </AppText>
                    <View className="h-24 rounded-2xl p-4 justify-center items-center bg-bg-primary border border-bg-primary-darker">
                        <AppText className="text-text-primary-lighter text-sm">No recent activities available.</AppText>
                    </View>

                </View>
            </ScrollView>

            <SelectSinglePeopleBottomSheet
                visible={isBottomSheetVisible}
                hideUsers={hiddenUsersList}
                onClose={() => setIsBottomSheetVisible(false)}
                onSelect={handleSelectPerson}
            />
        </View>
    );
};