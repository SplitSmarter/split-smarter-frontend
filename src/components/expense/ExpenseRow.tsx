import React from 'react';
import { View, Pressable } from 'react-native';
import { Iconify } from "react-native-iconify";
import { AppText } from '@/src/components/common/AppText';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { EntityFallbackIcon } from '@/src/components/common/EntityFallbackIcon';
import { ExpenseDetailsBasicResponse } from "@/src/api/dto/expense/expense";
import { RelationWithUserType } from "@/src/api/dto/constants";
import { getPayerContextText } from "@/src/utils/expense/payers";
import { Currency, CurrencyCode } from '@/src/constants/expense/currency';
import { COLORS } from '@/src/constants/colors';

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
    const colors = isDark ? COLORS.dark : COLORS.light;
    const isSettled = item.is_user_settled;
    const userShare = item.user_share ?? 0;
    const userPaid = item.user_paid ?? 0;
    const userNet = item.user_net ?? userPaid - userShare;
    const isInvolved = userShare !== 0 || userPaid !== 0;

    // Row accent amount = signed net (paid - share): + owed to you, - you owe
    let displayNet = userNet;
    let displayCurrencySymbol = Currency[item.currency as CurrencyCode]?.symbol || item.currency;

    if (viewType === 'custom' && userNet !== 0 && item.currency !== userProfileCurrencyCode) {
        const exchangeRates = item.exchange_rate;
        const baseRate = exchangeRates ? (exchangeRates[item.currency as keyof typeof exchangeRates] ?? 1) : 1;
        const targetRate = exchangeRates ? (exchangeRates[userProfileCurrencyCode as keyof typeof exchangeRates] ?? 1) : 1;

        if (baseRate > 0 && targetRate > 0) {
            displayNet = (userNet / baseRate) * targetRate;
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
            className="flex-row items-center py-3.5 border-b border-border-input last:border-b-0 active:opacity-70"
        >
            {/* Left Side Icon Stack */}
            <View className="relative w-12 h-12 rounded-full bg-bg-primary-lighter items-center justify-center mr-4 border border-border-input">
                <AppImageV2
                    id={`${item.category?.icon?.id ?? item.id}`}
                    url={item.category?.icon?.url}
                    style={{ width: 24, height: 24 }}
                    contentFit="contain"
                    fallbackComponent={
                        <EntityFallbackIcon kind="expense" size={22} color={colors.icon.primary} />
                    }
                />

                {isSettled && (
                    <View className="absolute -bottom-1 -right-1 bg-bg-secondary rounded-full w-5 h-5 items-center justify-center border border-bg-primary-lighter">
                        <Iconify icon="heroicons:check" size={12} color={colors.text.contrast} />
                    </View>
                )}
            </View>

            {/* 3-Row Layout Grid */}
            <View className="flex-1 justify-center">
                {/* Row 1 */}
                <View className="flex-row items-center justify-between">
                    <AppText variant="body-base" className="font-semibold text-text-primary flex-1 mr-2" numberOfLines={1}>
                        {item.name}
                    </AppText>
                    <AppText variant="body-small" className="text-text-primary-lighter font-medium">
                        {formattedRowDate}
                    </AppText>
                </View>

                {/* Row 2 */}
                <View className="flex-row items-center justify-between mt-0.5">
                    <View className="flex-row items-center flex-1 mr-2">
                        <AppText variant="body-small" className="text-text-primary-lighter" numberOfLines={1}>
                            {payerContext}
                        </AppText>
                        {item.has_attachment && (
                            <View className="ml-1.5 justify-center">
                                <Iconify icon="heroicons:paper-clip" size={12} color={colors.icon.lighter} />
                            </View>
                        )}
                    </View>

                    {isInvolved ? (
                        <AppText
                            variant="body-small"
                            className={`font-bold text-right ${displayNet >= 0 ? 'text-green-increase' : 'text-red-decrease'}`}
                        >
                            {displayNet > 0 ? '+' : ''}{displayCurrencySymbol}{displayNet.toFixed(2)}
                        </AppText>
                    ) : (
                        <AppText variant="body-small" className="text-text-primary-lighter text-right font-medium">
                            Not involved
                        </AppText>
                    )}
                </View>

                {/* Row 3 */}
                <View className="flex-row items-center justify-between mt-0.5">
                    <View className="flex-1 mr-2">
                        {item.place?.name ? (
                            <AppText variant="body-small" className="text-text-primary-lighter" numberOfLines={1}>
                                📍 {item.place.name}
                            </AppText>
                        ) : (
                            <View className="h-4" />
                        )}
                    </View>
                    <AppText variant="body-small" className="text-text-primary-lighter font-medium text-right">
                        {getCurrencySymbol(item.currency)}{item.total_amount.toFixed(2)}
                    </AppText>
                </View>
            </View>
        </Pressable>
    );
};