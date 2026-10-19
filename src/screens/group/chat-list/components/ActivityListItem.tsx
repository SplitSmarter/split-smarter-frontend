import React from 'react';
import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from "expo-router";
import { useTranslation } from 'react-i18next';
import { format, isToday, isYesterday } from 'date-fns';
import { AppText } from '@/src/components/common/AppText';
import { EntityFallbackIcon } from '@/src/components/common/EntityFallbackIcon';
import { COLORS } from '@/src/constants/colors';
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

    const iconColor = isDark ? COLORS.dark.icon.lighter : COLORS.light.icon.lighter;

    return (
        <Pressable
            className="flex-row items-center p-4 mb-1 border-b border-border-input active:opacity-75"
            onPress={handlePress}
        >
            {/* Avatar Profile Matrix Frame Container */}
            <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-bg-primary-darker">
                {item.avatarUrl ? (
                    <Image
                        source={{ uri: item.avatarUrl }}
                        style={{ width: '100%', height: '100%', borderRadius: 9999 }}
                        contentFit="cover"
                    />
                ) : item.type === 'group' ? (
                    <EntityFallbackIcon kind="group" size={24} color={iconColor} />
                ) : (
                    <EntityFallbackIcon kind="expense" size={24} color={iconColor} />
                )}
            </View>

            {/* Typography Description Alignment Block */}
            <View className="flex-1 ml-4">
                <View className="flex-row justify-between items-center">
                    <AppText variant="h4" className="text-lg text-text-primary" numberOfLines={1}>{item.title}</AppText>
                    <AppText variant="caption-xs" className="text-text-primary-lighter">{renderTime(item.timestamp)}</AppText>
                </View>
                <View className="flex-row justify-between items-center mt-1">
                    <AppText variant="body-small" className="text-text-primary-lighter flex-1 mr-2" numberOfLines={1}>
                        {detailedSummaryText()}
                    </AppText>

                    {/* Activity updates counter specific to Group items */}
                    {item.type === 'group' && item.rawItem.activities?.length > 0 && (
                        <View className="bg-bg-secondary px-2 h-5 rounded-full items-center justify-center min-w-[20px]">
                            <AppText className="text-text-secondary text-[10px] font-bold">{item.rawItem.activities.length}</AppText>
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
});

ActivityListItem.displayName = 'ActivityListItem';