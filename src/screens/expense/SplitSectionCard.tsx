// --- Split Between Component ---
import React from 'react';
import {COLORS} from '@/src/constants/colors';
import {Pressable, View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {Iconify} from 'react-native-iconify';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {ExpenseItem, PayerUser} from '@/src/store/draft/expenseDraftStore';
import {buildSplitBreakdown} from '@/src/utils/expense/expenseCalculations';

interface SectionCardProps {
    currencySymbol?: string;
    isDark: boolean;
    onPress: () => void;
}

export const SplitSectionCard = React.memo(
    ({
        participants,
        expenseItems = [],
        currencySymbol = '₹',
        isDark,
        onPress,
    }: SectionCardProps & {
        participants: PayerUser[];
        expenseItems?: ExpenseItem[];
    }) => {
        const colors = isDark ? COLORS.dark : COLORS.light;

        return (
            <Pressable
                className="rounded-2xl border p-4 shadow-sm"
                style={{
                    backgroundColor: colors.bg.lighter,
                    borderColor: colors.status.border,
                }}
                onPress={onPress}
            >
                <View className="mb-4 flex-row items-center justify-between">
                    <AppText variant="h4" className="font-bold" style={{color: colors.text.primary}}>
                        Split Between
                    </AppText>
                    <Iconify icon="heroicons:chevron-right" size={20} color={colors.icon.primary} />
                </View>

                {participants.length > 0 ? (
                    participants.map((participant, index) => {
                        const breakdown = buildSplitBreakdown(participant, expenseItems);
                        return (
                            <View
                                key={`split-${participant.id}-${participant.user_type}`}
                                className="py-3"
                                style={
                                    index !== participants.length - 1
                                        ? {
                                              borderBottomWidth: 1,
                                              borderBottomColor: colors.status.border,
                                          }
                                        : undefined
                                }
                            >
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1 flex-row items-center">
                                        <View
                                            style={{
                                                width: 24,
                                                height: 24,
                                                backgroundColor: colors.bg.darker,
                                            }}
                                            className="items-center justify-center overflow-hidden rounded-full"
                                        >
                                            <AppImageV2
                                                id={`avatar-${participant.name}`}
                                                url={participant.avatar?.url}
                                                style={{width: 24, height: 24}}
                                                className="rounded-full"
                                                fallbackComponent={
                                                    <EntityFallbackIcon
                                                        kind="user"
                                                        size={12}
                                                        color={colors.icon.lighter}
                                                    />
                                                }
                                            />
                                        </View>
                                        <AppText
                                            className="ml-3 flex-1 font-medium"
                                            style={{color: colors.text.primary}}
                                        >
                                            {participant.name}
                                        </AppText>
                                    </View>
                                    <AppText
                                        className="font-bold"
                                        style={{color: colors.text.primary}}
                                    >
                                        {currencySymbol}
                                        {breakdown.total.toFixed(2)}
                                    </AppText>
                                </View>
                                {breakdown.items > 0.009 && (
                                    <View className="ml-9 mt-1 flex-row justify-between">
                                        <AppText
                                            variant="caption-xs"
                                            className="text-text-primary-lighter"
                                        >
                                            Items {currencySymbol}
                                            {breakdown.items.toFixed(2)}
                                            {' · '}
                                            Share {currencySymbol}
                                            {breakdown.share.toFixed(2)}
                                        </AppText>
                                    </View>
                                )}
                            </View>
                        );
                    })
                ) : (
                    <AppText
                        variant="caption-xs"
                        className="font-medium opacity-60"
                        style={{color: colors.text.primary}}
                    >
                        Nobody selected
                    </AppText>
                )}
            </Pressable>
        );
    }
);

SplitSectionCard.displayName = 'SplitSectionCard';
