import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {LedgerBudget} from '@/src/screens/dev/ledger-month/types';
import {formatInr} from '@/src/screens/dev/ledger-month/utils/formatInr';
import {getElevatedCardStyle} from '@/src/screens/dev/ledger-month/styles/elevatedCard';

type BudgetWithSpent = LedgerBudget & {spent: number};

type LedgerBudgetStripProps = {
    budgets: BudgetWithSpent[];
};

export function LedgerBudgetStrip({budgets}: LedgerBudgetStripProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    if (budgets.length === 0) return null;

    return (
        <View>
            <View className="mb-3 flex-row items-center justify-between">
                <AppText
                    variant="h4"
                    className="font-bold"
                    style={{color: colors.text.primary}}
                >
                    Budgets this month
                </AppText>
            </View>
            <AppText
                variant="caption-xs"
                className="mb-3"
                style={{color: colors.text.lighter}}
            >
                Posted share only — scheduled outlines stay off these bars.
            </AppText>
            <View className="gap-y-3">
                {budgets.map((budget) => {
                    const pct = Math.min(
                        100,
                        (budget.spent / Math.max(budget.amount, 1)) * 100,
                    );
                    const over = budget.spent > budget.amount;
                    const barColor =
                        budget.capMode === 'hard'
                            ? over
                                ? colors.status.error
                                : colors.accent.sky
                            : over
                              ? colors.status.warning
                              : colors.status.success;

                    return (
                        <View
                            key={budget.id}
                            className="rounded-3xl border p-4"
                            style={getElevatedCardStyle(isDark)}
                        >
                            <View className="mb-2.5 flex-row items-start justify-between">
                                <View className="min-w-0 flex-1 pr-3">
                                    <AppText
                                        variant="body-small"
                                        className="font-bold"
                                        style={{color: colors.text.primary}}
                                    >
                                        {budget.name}
                                    </AppText>
                                    <AppText
                                        variant="caption-xs"
                                        className="mt-0.5"
                                        style={{color: colors.text.lighter}}
                                    >
                                        {budget.windowLabel}
                                        {budget.capMode === 'hard' ? ' · Hard' : ' · Soft'}
                                    </AppText>
                                </View>
                                <AppText
                                    variant="caption-xs"
                                    className="font-semibold"
                                    style={{
                                        color: over
                                            ? colors.status.decrease
                                            : colors.text.lighter,
                                    }}
                                >
                                    {formatInr(budget.spent)} / {formatInr(budget.amount)}
                                </AppText>
                            </View>
                            <View
                                className="h-2.5 overflow-hidden rounded-full"
                                style={{backgroundColor: colors.bg.darker}}
                            >
                                <View
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${pct}%`,
                                        backgroundColor: barColor,
                                    }}
                                />
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
