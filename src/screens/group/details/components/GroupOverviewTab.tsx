import React from 'react';
import { View } from 'react-native';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { EntityFallbackIcon } from '@/src/components/common/EntityFallbackIcon';
import { format } from 'date-fns';
import { Iconify } from "react-native-iconify";
import { AppText } from '@/src/components/common/AppText';
import { GroupDetails } from "@/src/api/dto/user/group";
import { COLORS } from '@/src/constants/colors';

interface Props {
    group: GroupDetails | null;
    isDark: boolean;
}

export const GroupOverviewTab = ({ group, isDark }: Props) => {
    const colors = isDark ? COLORS.dark : COLORS.light;

    if (!group) return null;

    return (
        <View className="p-6">
            {/* Group Info Card */}
            <View className="p-6 rounded-[32px] bg-bg-canvas border border-border-input mb-6 shadow-sm">
                <View className="flex-row items-center mb-4">
                    <Iconify icon="heroicons:information-circle" size={20} color={COLORS.light.icon.primary} />
                    <AppText className="ml-2 font-bold text-text-primary-lighter uppercase tracking-widest text-[10px]">Group Info</AppText>
                </View>
                <AppText className="text-text-primary-lighter leading-5 text-base">
                    {group.description || 'No description provided for this group.'}
                </AppText>
                <View className="flex-row items-center mt-4 pt-4 border-t border-border-input">
                    <Iconify icon="heroicons:calendar" size={16} color={colors.icon.lighter} />
                    <AppText variant="caption-xs" className="ml-2 opacity-60">
                        Created {format(new Date(group.created_at), 'PPP')}
                    </AppText>
                </View>
            </View>

            {/* Stats Grid */}
            <View className="flex-row justify-between mb-6">
                <View className="w-[48%] rounded-[28px] border border-green-increase/30 bg-bg-secondary-lighter p-5">
                    <Iconify icon="heroicons:arrow-trending-up" size={20} color={COLORS.light.icon.brand} />
                    <AppText variant="h3" className="mt-2 text-green-increase">₹0</AppText>
                    <AppText className="text-green-increase/70 font-medium text-[10px] uppercase">Total Spent</AppText>
                </View>
                <View className="w-[48%] p-5 rounded-[28px] bg-accent-sky-bg border border-accent-sky/20">
                    <Iconify icon="heroicons:users" size={20} color={colors.accent.sky} />
                    <AppText variant="h3" className="mt-2 text-blue-700">1</AppText>
                    <AppText className="text-blue-600/70 font-medium text-[10px] uppercase">Active Members</AppText>
                </View>
            </View>

            {/* Admin Badge */}
            <View className="flex-row items-center p-4 rounded-2xl bg-bg-primary-darker">
                <View className="h-8 w-8 overflow-hidden rounded-full">
                    <AppImageV2
                        id={`owner-${group.owner?.id ?? 'unknown'}`}
                        url={group.owner?.avatar?.url}
                        style={{ width: 32, height: 32, borderRadius: 16 }}
                        contentFit="cover"
                        fallbackComponent={
                            <EntityFallbackIcon kind="user" size={16} color={colors.icon.lighter} />
                        }
                    />
                </View>
                <View className="ml-3">
                    <AppText variant="caption-xs" className="opacity-60">Group Admin</AppText>
                    <AppText className="font-bold">{group.owner?.name}</AppText>
                </View>
                <View className="ml-auto bg-accent-sky-bg px-3 py-1 rounded-full">
                    <AppText className="text-accent-sky text-[10px] font-bold">OWNER</AppText>
                </View>
            </View>
        </View>
    );
};