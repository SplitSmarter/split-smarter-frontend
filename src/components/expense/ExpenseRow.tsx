import React from 'react';
import { View, Pressable } from 'react-native';
import { Iconify } from "react-native-iconify";
import { AppText } from '@/src/components/common/AppText';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { ExpenseDetailsBasicResponse } from "@/src/api/dto/expense/expense";
import { ExpenseComponentType } from "@/src/api/dto/expense/constant";
import { RelationWithUserType } from "@/src/api/dto/constants";
import { getPayerContextText } from "@/src/utils/expense/payers";
import { Currency, CurrencyCode } from '@/src/constants/expense/currency';

interface ExpenseRowProps {
    item: ExpenseDetailsBasicResponse;
    userId: number | undefined;
    viewType: 'absolute' | 'custom';
    userProfileCurrencyCode: CurrencyCode;
    isDark: boolean;
    onPress?: (item: ExpenseDetailsBasicResponse) => void;
}

export const ExpenseRow = ({
                               item,
                               userId,
                               viewType,
                               userProfileCurrencyCode,
                               isDark,
                               onPress
                           }: ExpenseRowProps) => {
    const isTransfer = item.expense_type === ExpenseComponentType.TRANSFER;
    const isSettled = item.is_settled;
    const baseContribution = item.user_contribution ?? 0;

    let displayContribution = baseContribution;
    let displayCurrencySymbol = Currency[item.currency as CurrencyCode]?.symbol || item.currency;

    // Handle currency transformation conversions
    if (viewType === 'custom' && baseContribution !== 0 && item.currency !== userProfileCurrencyCode) {
        const exchangeRates = item.exchange_rate;
        const baseRate = exchangeRates ? (exchangeRates[item.currency as keyof typeof exchangeRates] ?? 1) : 1;
        const targetRate = exchangeRates ? (exchangeRates[userProfileCurrencyCode as keyof typeof exchangeRates] ?? 1) : 1;

        if (baseRate > 0 && targetRate > 0) {
            const valueInUSD = baseContribution / baseRate;
            displayContribution = valueInUSD * targetRate;
            displayCurrencySymbol = Currency[userProfileCurrencyCode]?.symbol || userProfileCurrencyCode;
        }
    }

    const formattedRowDate = new Date(item.expense_date).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short'
    });

    const getCurrencySymbol = (code: string): string => {
        return Currency[code as CurrencyCode]?.symbol || code;
    };

    // --- RENDER FLOW A: Transfer Component Row ---
    if (isTransfer) {
        const senderName = item.paid_by_users?.[0]?.name || "Someone";
        const recipientName = item.sharers?.[0]?.name || "Someone";

        return (
            <Pressable
                onPress={() => onPress?.(item)}
                disabled={!onPress}
                className="flex-row items-center py-3 border-b border-gray-50 dark:border-zinc-900 last:border-b-0 active:opacity-70"
            >
                <View className="relative w-12 h-12 rounded-full bg-blue-50 dark:bg-zinc-800/50 items-center justify-center mr-4">
                    <Iconify icon="heroicons:arrows-right-left" size={22} color="#2563EB" />
                    {isSettled && (
                        <View className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full w-5 h-5 items-center justify-center border border-white dark:border-black">
                            <Iconify icon="heroicons:tag" size={12} color="white" />
                        </View>
                    )}
                </View>

                <View className="flex-1 justify-center">
                    <View className="flex-row items-center justify-between">
                        <AppText variant="body-base" className="font-semibold text-gray-900 dark:text-zinc-100 flex-1 mr-2" numberOfLines={1}>
                            {`${senderName} paid ${recipientName}`}
                        </AppText>
                        <AppText variant="body-small" className="text-gray-400 dark:text-zinc-500 font-medium">
                            {formattedRowDate}
                        </AppText>
                    </View>

                    <View className="flex-row items-center justify-between mt-0.5">
                        <AppText variant="body-small" className="text-gray-400 dark:text-zinc-500" numberOfLines={1}>
                            Settlement Payment
                        </AppText>
                        <AppText variant="body-base" className="font-bold text-gray-900 dark:text-zinc-50 text-right">
                            {getCurrencySymbol(item.currency)}{item.total_amount.toFixed(2)}
                        </AppText>
                    </View>
                </View>
            </Pressable>
        );
    }

    // --- RENDER FLOW B: Standard Expense Row ---
    const structuralPayers = (item.paid_by_users || []).map(p => ({
        id: p.id,
        name: p.name,
        user_type: p.user_type
    }));

    const payerContext = getPayerContextText(structuralPayers, {
        user_type: RelationWithUserType.USER,
        id: userId || 0
    });

    return (
        <Pressable
            onPress={() => onPress?.(item)}
            disabled={!onPress}
            className="flex-row items-center py-3 border-b border-gray-50 dark:border-zinc-900 last:border-b-0 active:opacity-70"
        >
            <View className="relative w-12 h-12 rounded-full bg-emerald-50 dark:bg-zinc-800/60 items-center justify-center mr-4">
                {item.category?.icon?.id ? (
                    <AppImageV2
                        id={`${item.category.icon.id}`}
                        url={item.category.icon.url}
                        style={{ width: 24, height: 24 }}
                        contentFit="contain"
                        fallbackComponent={<Iconify icon="heroicons:receipt-percent" size={22} color={isDark ? "#32966E" : "#2B8761"} />}
                    />
                ) : (
                    <Iconify icon="heroicons:receipt-percent" size={22} color={isDark ? "#32966E" : "#2B8761"} />
                )}

                {isSettled && (
                    <View className="absolute -bottom-1 -right-1 bg-emerald-600 rounded-full w-5 h-5 items-center justify-center border border-white dark:border-black">
                        <Iconify icon="heroicons:check" size={12} color="white" />
                    </View>
                )}
            </View>

            <View className="flex-1 justify-center">
                <View className="flex-row items-center justify-between">
                    <AppText variant="body-base" className="font-semibold text-gray-900 dark:text-zinc-100 flex-1 mr-2" numberOfLines={1}>
                        {item.name}
                    </AppText>
                    <AppText variant="body-small" className="text-gray-400 dark:text-zinc-500 font-medium">
                        {formattedRowDate}
                    </AppText>
                </View>

                <View className="flex-row items-center justify-between mt-0.5">
                    <View className="flex-row items-center flex-1 mr-2">
                        <AppText variant="body-small" className="text-gray-500 dark:text-zinc-400" numberOfLines={1}>
                            {payerContext}
                        </AppText>
                        {item.has_attachment && (
                            <View className="ml-1.5 justify-center">
                                <Iconify icon="heroicons:paper-clip" size={12} color={isDark ? "#A1A1AA" : "#646464"} />
                            </View>
                        )}
                    </View>

                    {baseContribution !== 0 ? (
                        <AppText
                            variant="body-small"
                            className={`font-bold text-right ${baseContribution > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}
                        >
                            {baseContribution > 0 ? '+' : ''}{displayCurrencySymbol}{displayContribution.toFixed(2)}
                        </AppText>
                    ) : (
                        <AppText variant="body-small" className="text-gray-400 dark:text-zinc-500 text-right font-medium">
                            Not involved
                        </AppText>
                    )}
                </View>

                <View className="flex-row items-center justify-between mt-0.5">
                    <View className="flex-1 mr-2">
                        {item.place?.name ? (
                            <AppText variant="body-small" className="text-gray-400 dark:text-zinc-500" numberOfLines={1}>
                                📍 {item.place.name}
                            </AppText>
                        ) : (
                            <View className="h-4" />
                        )}
                    </View>
                    <AppText variant="body-small" className="text-gray-400 dark:text-zinc-500 font-medium text-right">
                        {getCurrencySymbol(item.currency)}{item.total_amount.toFixed(2)}
                    </AppText>
                </View>
            </View>
        </Pressable>
    );
};