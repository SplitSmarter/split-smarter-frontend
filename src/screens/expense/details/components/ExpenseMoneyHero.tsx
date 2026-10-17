import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import type {ExpenseDetailsBasicResponse} from '@/src/api/dto/expense/expense';
import {
    formatExpenseMoney,
    netPositionLabel,
} from '../utils/formatExpenseMoney';

interface ExpenseMoneyHeroProps {
    expense: ExpenseDetailsBasicResponse;
}

export function ExpenseMoneyHero({expense}: ExpenseMoneyHeroProps) {
    const net = expense.user_net;
    const netClass =
        net == null || Math.abs(net) < 0.005
            ? 'text-text-primary'
            : net > 0
              ? 'text-green-increase'
              : 'text-red-decrease';

    return (
        <View className="rounded-[28px] border border-border-input bg-bg-canvas px-4 py-4">
            <View className="flex-row items-start justify-between gap-3">
                <View className="min-w-0 flex-1">
                    <AppText
                        variant="h3"
                        className="font-bold text-text-primary"
                        numberOfLines={2}
                    >
                        {expense.name}
                    </AppText>
                    <AppText
                        variant="caption-xs"
                        className="mt-1 font-medium text-text-primary-lighter"
                    >
                        {[
                            expense.category?.title,
                            expense.expense_date?.slice?.(0, 10) ?? expense.expense_date,
                        ]
                            .filter(Boolean)
                            .join(' · ')}
                    </AppText>
                </View>
                <View className="items-end gap-1">
                    {expense.is_user_settled ? (
                        <View className="rounded-full bg-secondary-lighter px-2.5 py-1">
                            <AppText
                                variant="caption-xs"
                                className="font-semibold text-green-increase"
                            >
                                Settled
                            </AppText>
                        </View>
                    ) : (
                        <View className="rounded-full bg-bg-primary px-2.5 py-1">
                            <AppText
                                variant="caption-xs"
                                className="font-semibold text-text-primary-lighter"
                            >
                                {expense.status}
                            </AppText>
                        </View>
                    )}
                    {expense.has_attachment ? (
                        <AppText
                            variant="caption-xs"
                            className="font-medium text-text-primary-lighter"
                        >
                            Has receipt
                        </AppText>
                    ) : null}
                    {expense.is_scheduled_blueprint ? (
                        <AppText
                            variant="caption-xs"
                            className="font-medium text-text-primary-lighter"
                        >
                            Recurring
                        </AppText>
                    ) : null}
                </View>
            </View>

            <View className="mt-4">
                <AppText
                    variant="caption-xs"
                    className="font-semibold uppercase tracking-wider text-text-primary-lighter"
                >
                    {netPositionLabel(net, expense.is_user_settled)}
                </AppText>
                <AppText variant="h2" className={`mt-0.5 font-bold ${netClass}`}>
                    {formatExpenseMoney(net, expense.currency)}
                </AppText>
            </View>

            <View className="mt-4 flex-row gap-2">
                <View className="min-w-0 flex-1 rounded-2xl bg-bg-primary px-3 py-2.5">
                    <AppText
                        variant="caption-xs"
                        className="text-text-primary-lighter"
                    >
                        You paid
                    </AppText>
                    <AppText
                        variant="body-base"
                        className="mt-0.5 font-semibold text-text-primary"
                    >
                        {formatExpenseMoney(expense.user_paid, expense.currency)}
                    </AppText>
                </View>
                <View className="min-w-0 flex-1 rounded-2xl bg-bg-primary px-3 py-2.5">
                    <AppText
                        variant="caption-xs"
                        className="text-text-primary-lighter"
                    >
                        Your share
                    </AppText>
                    <AppText
                        variant="body-base"
                        className="mt-0.5 font-semibold text-text-primary"
                    >
                        {formatExpenseMoney(expense.user_share, expense.currency)}
                    </AppText>
                </View>
                <View className="min-w-0 flex-1 rounded-2xl bg-bg-primary px-3 py-2.5">
                    <AppText
                        variant="caption-xs"
                        className="text-text-primary-lighter"
                    >
                        Total
                    </AppText>
                    <AppText
                        variant="body-base"
                        className="mt-0.5 font-semibold text-text-primary"
                    >
                        {formatExpenseMoney(expense.total_amount, expense.currency)}
                    </AppText>
                </View>
            </View>
        </View>
    );
}
