import React from 'react';
import { View, Pressable, Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppImage } from '@/src/components/common/AppImage';
import { COLORS } from '@/src/constants/colors';

interface PaidByUserRowProps {
    user: any;
    amount: number;
    percentage: string;
    isLocked: boolean;
    onToggleLock: () => void;
    onDelete: () => void;
}

export const PaidByUserRow = ({ user, amount, percentage, isLocked, onToggleLock, onDelete }: PaidByUserRowProps) => {

    // Action displayed when swiping right (Left side of row)
    const renderLeftActions = (progress: any, dragX: any) => {
        return (
            <View className="bg-orange-500 justify-center items-start px-6 rounded-l-2xl">
                <Iconify icon={isLocked ? "heroicons:lock-open" : "heroicons:lock-closed"} size={24} color="white" />
            </View>
        );
    };

    // Action displayed when swiping left (Right side of row)
    const renderRightActions = (progress: any, dragX: any) => {
        return (
            <View className="bg-red-500 justify-center items-end px-6 rounded-r-2xl">
                <Iconify icon="heroicons:trash" size={24} color="white" />
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
            <View className="flex-row items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b border-bg-secondary-lighter">
                <View className="flex-row items-center flex-1">
                    <View className="relative">
                        <AppImage url={user.avatar_url} size="md" variant="circular" />
                        {isLocked && (
                            <View className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-1 border-2 border-white">
                                <Iconify icon="heroicons:lock-closed-solid" size={10} color="white" />
                            </View>
                        )}
                    </View>
                    <View className="ml-3">
                        <AppText className="font-bold text-text-primary">{user.name}</AppText>
                        <AppText variant="caption-xs" className="text-text-secondary">{percentage}%</AppText>
                    </View>
                </View>

                <View className="items-end">
                    <AppText className="font-bold text-text-primary">₹{amount.toFixed(2)}</AppText>
                    {isLocked && <AppText variant="caption-xs" className="text-orange-500">Locked</AppText>}
                </View>
            </View>
        </Swipeable>
    );
};