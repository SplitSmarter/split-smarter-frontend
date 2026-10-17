import React from 'react';
import { View } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { BaseSettlementDetails } from "@/src/api/dto/expense/settlement";
import { RelationWithUserType } from "@/src/api/dto/constants";
import { Currency, CurrencyCode } from '@/src/constants/expense/currency';
import { COLORS } from '@/src/constants/colors';

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
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View className="space-y-3">
            <View className="flex-row items-center justify-between mb-4 px-1">
                <AppText variant="body-small" className="font-bold text-text-primary-lighter uppercase tracking-wider">
                    Settlement History
                </AppText>
                <Iconify icon="heroicons:shield-check" size={16} color={colors.icon.lighter} />
            </View>

            {history.length === 0 ? (
                <View className="py-8 items-center">
                    <AppText variant="body-base" className="text-text-primary-lighter font-medium">
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
                            className="p-4 border-b border-border-input bg-bg-primary"
                        >
                            <View className="flex-row justify-between items-start">
                                <AppText variant="body-base" className="font-semibold text-text-primary flex-1 mr-4">
                                    {link.from_user.name} settled with {isToCurrentUser ? 'You' : link.to_user.name}
                                </AppText>
                                <AppText variant="body-small" className="text-text-primary-lighter font-medium">
                                    {formattedLinkDate}
                                </AppText>
                            </View>
                            <AppText variant="body-large" className="font-extrabold text-green-increase mt-2">
                                {Currency[link.currency as CurrencyCode]?.symbol || '₹'}{link.amount.toFixed(2)}
                            </AppText>
                        </View>
                    );
                })
            )}
        </View>
    );
};