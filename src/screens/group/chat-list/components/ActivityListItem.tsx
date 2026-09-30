import React from 'react';
import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from "expo-router";
import { useTranslation } from 'react-i18next';
import { Iconify } from "react-native-iconify";
import { format, isToday, isYesterday } from 'date-fns';
import { AppText } from '@/src/components/common/AppText';
import { GroupActivityHelper } from "@/src/utils/GroupActivityHelper";

export interface UnifiedActivityItem {
    id: string;
    rawId: number;
    type: 'group' | 'expense' | 'chat';
    title: string;
    subtitle: string | null;
    timestamp: string;
    avatarUrl?: string | null;
    rawItem: any;
}

interface ActivityListItemProps {
    item: UnifiedActivityItem;
    isDark: boolean;
}

export const ActivityListItem = React.memo(({ item, isDark }: ActivityListItemProps) => {
    const router = useRouter();
    const { t } = useTranslation();

    const renderTime = (dateString: string) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        if (isToday(date)) return format(date, 'h:mm a');
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'dd/MM/yyyy');
    };

    const handlePress = () => {
        if (item.type === 'group') {
            router.push(`/(authenticated)/group/details?id=${item.rawId}`);
        } else if (item.type === 'expense') {
            router.push(`/(authenticated)/expense/details?id=${item.rawId}`);
        }
    };

    // 👈 FIX: Resolves back custom activity text string generation using your native GroupActivityHelper schema
    const detailedSummaryText = () => {
        if (item.type === 'group') {
            const lastActivity = item.rawItem.activities?.[0];
            return lastActivity
                ? GroupActivityHelper.getSummary(lastActivity)
                : t('group.noActivity', 'No recent activity');
        }
        return item.subtitle;
    };

    return (
        <Pressable
            className={`flex-row items-center p-4 mb-1 border-b ${
                isDark ? 'border-gray-800' : 'border-gray-100'
            } active:opacity-75`}
            onPress={handlePress}
        >
            {/* Avatar Profile Matrix Frame Container */}
            <View className="w-14 h-14 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden items-center justify-center">
                {item.avatarUrl ? (
                    <Image source={{ uri: item.avatarUrl }} style={{ width: 40, height: 40 }} contentFit="contain" />
                ) : item.type === 'group' ? (
                    <Iconify icon="heroicons:users-solid" size={24} color="#999" />
                ) : (
                    <Iconify icon="heroicons:credit-card-solid" size={24} color="#999" />
                )}
            </View>

            {/* Typography Description Alignment Block */}
            <View className="flex-1 ml-4">
                <View className="flex-row justify-between items-center">
                    <AppText variant="h4" className="text-lg text-text-primary" numberOfLines={1}>{item.title}</AppText>
                    <AppText variant="caption-xs" className="text-text-secondary opacity-60">{renderTime(item.timestamp)}</AppText>
                </View>
                <View className="flex-row justify-between items-center mt-1">
                    <AppText variant="body-small" className="text-text-secondary opacity-50 flex-1 mr-2" numberOfLines={1}>
                        {detailedSummaryText()}
                    </AppText>

                    {/* Activity updates counter specific to Group items */}
                    {item.type === 'group' && item.rawItem.activities?.length > 0 && (
                        <View className="bg-[#52B788] px-2 h-5 rounded-full items-center justify-center min-w-[20px]">
                            <AppText className="text-white text-[10px] font-bold">{item.rawItem.activities.length}</AppText>
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
});

ActivityListItem.displayName = 'ActivityListItem';