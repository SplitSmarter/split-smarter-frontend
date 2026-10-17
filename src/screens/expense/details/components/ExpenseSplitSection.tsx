import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import type {
    ExpensePaidByDetail,
    ExpenseSharerDetail,
} from '@/src/api/dto/expense/expense';
import type {Currency} from '@/src/api/dto/constants';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {formatExpenseMoney} from '../utils/formatExpenseMoney';

interface ExpenseSplitSectionProps {
    paidBy: ExpensePaidByDetail[];
    sharers: ExpenseSharerDetail[];
    currency: Currency;
}

function PersonRow({
    name,
    amount,
    currency,
    avatarId,
    avatarUrl,
    isLast,
}: {
    name: string;
    amount: number;
    currency: Currency;
    avatarId?: string;
    avatarUrl?: string;
    isLast: boolean;
}) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View
            className={`flex-row items-center px-4 py-3 ${
                isLast ? '' : 'border-b border-border-input'
            }`}
        >
            <View className="mr-3 h-9 w-9 overflow-hidden rounded-full bg-bg-primary">
                <AppImageV2
                    id={avatarId ?? name}
                    url={avatarUrl}
                    style={{width: '100%', height: '100%'}}
                    contentFit="cover"
                    fallbackComponent={
                        <EntityFallbackIcon
                            kind="user"
                            size={16}
                            color={colors.icon.lighter}
                        />
                    }
                />
            </View>
            <AppText
                variant="body-base"
                className="min-w-0 flex-1 font-semibold text-text-primary"
                numberOfLines={1}
            >
                {name}
            </AppText>
            <AppText variant="body-base" className="font-bold text-text-primary">
                {formatExpenseMoney(amount, currency)}
            </AppText>
        </View>
    );
}

export function ExpenseSplitSection({
    paidBy,
    sharers,
    currency,
}: ExpenseSplitSectionProps) {
    if (paidBy.length === 0 && sharers.length === 0) return null;

    return (
        <View className="gap-4">
            {paidBy.length > 0 ? (
                <View>
                    <AppText
                        variant="caption-xs"
                        className="mb-2 px-0.5 font-semibold uppercase tracking-[1.2px] text-text-primary-lighter"
                    >
                        Paid by
                    </AppText>
                    <View className="overflow-hidden rounded-[28px] border border-border-input bg-bg-canvas">
                        {paidBy.map((u, i) => (
                            <PersonRow
                                key={`paid-${u.id}-${i}`}
                                name={u.name}
                                amount={u.amount}
                                currency={currency}
                                avatarId={u.avatar?.id}
                                avatarUrl={u.avatar?.url}
                                isLast={i === paidBy.length - 1}
                            />
                        ))}
                    </View>
                </View>
            ) : null}

            {sharers.length > 0 ? (
                <View>
                    <AppText
                        variant="caption-xs"
                        className="mb-2 px-0.5 font-semibold uppercase tracking-[1.2px] text-text-primary-lighter"
                    >
                        Shared by
                    </AppText>
                    <View className="overflow-hidden rounded-[28px] border border-border-input bg-bg-canvas">
                        {sharers.map((u, i) => (
                            <PersonRow
                                key={`share-${u.id}-${i}`}
                                name={u.name}
                                amount={u.amount}
                                currency={currency}
                                avatarId={u.avatar?.id}
                                avatarUrl={u.avatar?.url}
                                isLast={i === sharers.length - 1}
                            />
                        ))}
                    </View>
                </View>
            ) : null}
        </View>
    );
}
