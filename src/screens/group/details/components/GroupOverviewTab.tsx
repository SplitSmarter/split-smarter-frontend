import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { format } from 'date-fns';
import { Iconify } from "react-native-iconify";
import { AppText } from '@/src/components/common/AppText';
import { GroupDetails } from "@/src/api/dto/user/group";

interface Props {
    group: GroupDetails | null;
    isDark: boolean;
}

export const GroupOverviewTab = ({ group, isDark }: Props) => {
    if (!group) return null;

    return (
        <View className="p-6">
            {/* Group Info Card */}
            <View className={`p-6 rounded-[32px] ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-gray-50 border border-gray-100'} mb-6 shadow-sm`}>
                <View className="flex-row items-center mb-4">
                    <Iconify icon="heroicons:information-circle" size={20} color="#2D6A4F" />
                    <AppText className="ml-2 font-bold text-[#2D6A4F] uppercase tracking-widest text-[10px]">Group Info</AppText>
                </View>
                <AppText className="text-text-secondary leading-5 text-base">
                    {group.description || 'No description provided for this group.'}
                </AppText>
                <View className="flex-row items-center mt-4 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
                    <Iconify icon="heroicons:calendar" size={16} color="#666" />
                    <AppText variant="caption-xs" className="ml-2 opacity-60">
                        Created {format(new Date(group.created_at), 'PPP')}
                    </AppText>
                </View>
            </View>

            {/* Stats Grid */}
            <View className="flex-row justify-between mb-6">
                <View className="w-[48%] p-5 rounded-[28px] bg-emerald-500/10 border border-emerald-500/20">
                    <Iconify icon="heroicons:arrow-trending-up" size={20} color="#059669" />
                    <AppText variant="h3" className="mt-2 text-emerald-700">₹0</AppText>
                    <AppText className="text-emerald-600/70 font-medium text-[10px] uppercase">Total Spent</AppText>
                </View>
                <View className="w-[48%] p-5 rounded-[28px] bg-blue-500/10 border border-blue-500/20">
                    <Iconify icon="heroicons:users" size={20} color="#2563eb" />
                    <AppText variant="h3" className="mt-2 text-blue-700">1</AppText>
                    <AppText className="text-blue-600/70 font-medium text-[10px] uppercase">Active Members</AppText>
                </View>
            </View>

            {/* Admin Badge */}
            <View className={`flex-row items-center p-4 rounded-2xl ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                <Image source={{ uri: group.owner?.avatar?.url }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                <View className="ml-3">
                    <AppText variant="caption-xs" className="opacity-60">Group Admin</AppText>
                    <AppText className="font-bold">{group.owner?.name}</AppText>
                </View>
                <View className="ml-auto bg-[#2D6A4F]/10 px-3 py-1 rounded-full">
                    <AppText className="text-[#2D6A4F] text-[10px] font-bold">OWNER</AppText>
                </View>
            </View>
        </View>
    );
};