import React from 'react';
import { View } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { BaseSettlementDetails } from "@/src/api/dto/expense/settlement";
import { RelationWithUserType } from "@/src/api/dto/constants";
import { Currency, CurrencyCode } from '@/src/constants/expense/currency';

interface SettlementHistoryLedgerProps {
    history: BaseSettlementDetails[];
    currentUserId: number | undefined;
    currentUserType: RelationWithUserType;
    isDark: boolean;
}

export const SettlementHistoryLedger = ({
                                            history,
                                            currentUserId,
                                            currentUserType,
                                            isDark
                                        }: SettlementHistoryLedgerProps) => {
    return (
        <View className="space-y-3">
            <View className="flex-row items-center justify-between mb-4 px-1">
                <AppText variant="body-small" className="font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    Settlement History
                </AppText>
                <Iconify icon="heroicons:shield-check" size={16} color={isDark ? "#52525B" : "#A1A1AA"} />
            </View>

            {history.length === 0 ? (
                <View className="py-8 items-center">
                    <AppText variant="body-base" className="text-gray-400 dark:text-zinc-500 font-medium">
                        No verified historic transfers logged.
                    </AppText>
                </View>
            ) : (
                history.map((link) => {
                    const formattedLinkDate = new Date().toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    });

                    const isToCurrentUser = link.to_user.id === currentUserId && link.to_user.user_type === currentUserType;

                    return (
                        <View
                            key={link.id}
                            className="p-4 border-b border-gray-100 dark:border-zinc-900 bg-white dark:bg-black"
                        >
                            <View className="flex-row justify-between items-start">
                                <AppText variant="body-base" className="font-semibold text-gray-900 dark:text-zinc-100 flex-1 mr-4">
                                    {link.from_user.name} settled with {isToCurrentUser ? 'You' : link.to_user.name}
                                </AppText>
                                <AppText variant="body-small" className="text-gray-400 dark:text-zinc-500 font-medium">
                                    {formattedLinkDate}
                                </AppText>
                            </View>
                            <AppText variant="body-large" className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                                {Currency[link.currency as CurrencyCode]?.symbol || '₹'}{link.amount.toFixed(2)}
                            </AppText>
                        </View>
                    );
                })
            )}
        </View>
    );
};