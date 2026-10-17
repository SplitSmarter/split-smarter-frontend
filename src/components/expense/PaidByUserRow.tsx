import React from 'react';
import { View, Pressable, Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppImage } from '@/src/components/common/AppImage';
import { EntityFallbackIcon } from '@/src/components/common/EntityFallbackIcon';
import { COLORS } from '@/src/constants/colors';
import { themeStore } from '@/src/store/themeStore';

interface PaidByUserRowProps {
    user: any;
    amount: number;
    percentage: string;
    isLocked: boolean;
    onToggleLock: () => void;
    onDelete: () => void;
}

export const PaidByUserRow = ({ user, amount, percentage, isLocked, onToggleLock, onDelete }: PaidByUserRowProps) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    // Action displayed when swiping right (Left side of row)
    const renderLeftActions = (progress: any, dragX: any) => {
        return (
            <View className="justify-center items-start px-6 rounded-l-2xl" style={{ backgroundColor: colors.status.warning }}>
                <Iconify icon={isLocked ? "heroicons:lock-open" : "heroicons:lock-closed"} size={24} color={colors.text.contrast} />
            </View>
        );
    };

    // Action displayed when swiping left (Right side of row)
    const renderRightActions = (progress: any, dragX: any) => {
        return (
            <View className="justify-center items-end px-6 rounded-r-2xl" style={{ backgroundColor: colors.status.error }}>
                <Iconify icon="heroicons:trash" size={24} color={colors.text.contrast} />
            </View>
        );
    };

    return (
        <Swipeable
            renderLeftActions={renderLeftActions}
            renderRightActions={renderRightActions}
            onSwipeableLeftOpen={onToggleLock} // Swiped right -> Lock
            onSwipeableRightOpen={onDelete}     // Swiped left -> Delete
            friction={2}
        >
            <View className="flex-row items-center justify-between p-4 bg-bg-primary-lighter border-b border-border-input">
                <View className="flex-row items-center flex-1">
                    <View className="relative">
                        <AppImage
                            url={user.avatar_url}
                            size="md"
                            variant="circular"
                            fallbackIcon={
                                <EntityFallbackIcon kind="user" size={22} color={colors.icon.lighter} />
                            }
                        />
                        {isLocked && (
                            <View className="absolute -top-1 -right-1 rounded-full p-1 border-2 border-bg-primary-lighter" style={{ backgroundColor: colors.status.warning }}>
                                <Iconify icon="heroicons:lock-closed-solid" size={10} color={colors.text.contrast} />
                            </View>
                        )}
                    </View>
                    <View className="ml-3">
                        <AppText className="font-bold text-text-primary">{user.name}</AppText>
                        <AppText variant="caption-xs" className="text-text-primary-lighter">{percentage}%</AppText>
                    </View>
                </View>

                <View className="items-end">
                    <AppText className="font-bold text-text-primary">₹{amount.toFixed(2)}</AppText>
                    {isLocked && <AppText variant="caption-xs" style={{ color: colors.status.warning }}>Locked</AppText>}
                </View>
            </View>
        </Swipeable>
    );
};