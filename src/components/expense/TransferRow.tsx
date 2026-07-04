import React from 'react';
import { View, Pressable } from 'react-native';
import { Iconify } from "react-native-iconify";
import { AppText } from '@/src/components/common/AppText';
import { Currency, CurrencyCode } from '@/src/constants/expense/currency';
import { TransferDetailsBasicResponse } from '@/src/api/dto/expense/transfer';

interface TransferRowProps {
    item: TransferDetailsBasicResponse;
    userId: number | undefined;
    onPress?: (item: TransferDetailsBasicResponse) => void;
}

export const TransferRow = ({ item, userId, onPress }: TransferRowProps) => {
    const isSettled = item.is_settled;

    const senderName = item.from_user?.id === userId ? "You" : (item.from_user?.name || "Someone");
    const recipientName = item.to_user?.id === userId ? "You" : (item.to_user?.name || "Someone");
    const displayMode = item.mode ? `via ${item.mode}` : "Settlement Transfer";

    const formattedRowDate = new Date(item.transfer_date).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short'
    });

    const getCurrencySymbol = (code: string): string => {
        return Currency[code as CurrencyCode]?.symbol || code;
    };

    return (
        <Pressable
            onPress={() => onPress?.(item)}
            disabled={!onPress}
            className="flex-row items-center py-3.5 border-b border-gray-50 dark:border-zinc-900 last:border-b-0 active:opacity-70"
        >
            {/* Left Side Icon Stack */}
            <View className="relative w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 items-center justify-center mr-4">
                <Iconify icon="heroicons:arrows-right-left" size={22} color="#2563EB" />
                {isSettled && (
                    <View className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full w-5 h-5 items-center justify-center border border-white dark:border-zinc-950">
                        <Iconify icon="heroicons:tag" size={12} color="white" />
                    </View>
                )}
            </View>

            {/* 2-Row Matrix Layout Grid */}
            <View className="flex-1 justify-center">
                {/* Row 1 */}
                <View className="flex-row items-center justify-between">
                    <AppText variant="body-base" className="font-semibold text-gray-900 dark:text-zinc-100 flex-1 mr-2" numberOfLines={1}>
                        {`${senderName} paid ${recipientName}`}
                    </AppText>
                    <AppText variant="body-small" className="text-gray-400 dark:text-zinc-500 font-medium">
                        {formattedRowDate}
                    </AppText>
                </View>

                {/* Row 2 */}
                <View className="flex-row items-center justify-between mt-0.5">
                    <AppText variant="body-small" className="text-gray-400 dark:text-zinc-500 capitalize" numberOfLines={1}>
                        {displayMode}
                    </AppText>
                    <AppText variant="body-base" className="font-bold text-gray-900 dark:text-zinc-50 text-right">
                        {getCurrencySymbol(item.currency)}{item.total_amount.toFixed(2)}
                    </AppText>
                </View>
            </View>
        </Pressable>
    );
};