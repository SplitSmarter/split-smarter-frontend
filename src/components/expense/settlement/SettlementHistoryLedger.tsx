import React, {useMemo} from 'react';
import {View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {BaseSettlementDetails} from '@/src/api/dto/expense/settlement';
import {RelationWithUserType} from '@/src/api/dto/constants';
import {Currency, CurrencyCode} from '@/src/constants/expense/currency';
import {COLORS} from '@/src/constants/colors';

interface SettlementHistoryLedgerProps {
    history: BaseSettlementDetails[];
    currentUserId: number | undefined;
    currentUserType: RelationWithUserType;
    isDark: boolean;
}

function involvesCurrentUser(
    link: BaseSettlementDetails,
    currentUserId: number | undefined,
    currentUserType: RelationWithUserType,
): boolean {
    if (currentUserId == null) return true;
    const isFrom =
        link.from_user.id === currentUserId &&
        link.from_user.user_type === currentUserType;
    const isTo =
        link.to_user.id === currentUserId &&
        link.to_user.user_type === currentUserType;
    return isFrom || isTo;
}

export const SettlementHistoryLedger = ({
    history,
    currentUserId,
    currentUserType,
    isDark,
}: SettlementHistoryLedgerProps) => {
    const colors = isDark ? COLORS.dark : COLORS.light;

    // Group settlements tab is personal — only links involving the signed-in user.
    const personalHistory = useMemo(
        () =>
            history.filter((link) =>
                involvesCurrentUser(link, currentUserId, currentUserType),
            ),
        [history, currentUserId, currentUserType],
    );

    return (
        <View className="space-y-3">
            <View className="mb-4 flex-row items-center justify-between px-1">
                <AppText
                    variant="body-small"
                    className="font-bold uppercase tracking-wider text-text-primary-lighter"
                >
                    Your settlements
                </AppText>
                <Iconify icon="heroicons:shield-check" size={16} color={colors.icon.lighter} />
            </View>

            {personalHistory.length === 0 ? (
                <View className="items-center py-8">
                    <AppText variant="body-base" className="font-medium text-text-primary-lighter">
                        No settlements involving you in this group yet.
                    </AppText>
                </View>
            ) : (
                personalHistory.map((link) => {
                    const formattedLinkDate = new Date().toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    });

                    const isFromMe =
                        currentUserId != null &&
                        link.from_user.id === currentUserId &&
                        link.from_user.user_type === currentUserType;
                    const isToMe =
                        currentUserId != null &&
                        link.to_user.id === currentUserId &&
                        link.to_user.user_type === currentUserType;

                    const fromLabel = isFromMe ? 'You' : link.from_user.name;
                    const toLabel = isToMe ? 'You' : link.to_user.name;

                    return (
                        <View
                            key={link.id}
                            className="border-b border-border-input bg-bg-primary p-4"
                        >
                            <View className="flex-row items-start justify-between">
                                <AppText
                                    variant="body-base"
                                    className="mr-4 flex-1 font-semibold text-text-primary"
                                >
                                    {fromLabel} settled with {toLabel}
                                </AppText>
                                <AppText
                                    variant="body-small"
                                    className="font-medium text-text-primary-lighter"
                                >
                                    {formattedLinkDate}
                                </AppText>
                            </View>
                            <AppText
                                variant="body-large"
                                className="mt-2 font-extrabold text-green-increase"
                            >
                                {Currency[link.currency as CurrencyCode]?.symbol || '₹'}
                                {link.amount.toFixed(2)}
                            </AppText>
                        </View>
                    );
                })
            )}
        </View>
    );
};
