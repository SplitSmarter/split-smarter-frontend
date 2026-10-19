import React from 'react';
import {ActivityIndicator, ScrollView, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {ApplicableBudgetItem} from '@/src/api/dto/expense/budget';
import {MemoryResponse} from '@/src/api/dto/user/memory';
import {COLORS} from '@/src/constants/colors';
import {Currency, CurrencyCode} from '@/src/constants/expense/currency';

type Props = {
    isDark: boolean;
    memories: MemoryResponse[];
    budgets: ApplicableBudgetItem[];
    loading: boolean;
    currencyCode?: CurrencyCode | string | null;
    /** Inline next to camera — no top margin / full-width strip. */
    compact?: boolean;
};

function formatShortRange(startAt?: string | null, endAt?: string | null): string {
    const fmt = (iso: string) => {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleDateString('en-IN', {month: 'short', day: 'numeric'});
    };
    if (!startAt) return '';
    const start = fmt(startAt);
    if (!endAt) return `${start}–`;
    const end = fmt(endAt);
    return start && end ? `${start}–${end}` : start || end;
}

function formatMoney(amount: number, currencyCode?: CurrencyCode | string | null): string {
    const code = (currencyCode || 'INR') as CurrencyCode;
    const symbol = Currency[code]?.symbol ?? '₹';
    const rounded = Math.round(amount);
    return `${symbol}${rounded.toLocaleString('en-IN')}`;
}

export function ExpenseContextHintsRow({
    isDark,
    memories,
    budgets,
    loading,
    currencyCode,
    compact = false,
}: Props) {
    const colors = isDark ? COLORS.dark : COLORS.light;
    const elevatedChip = {
        backgroundColor: colors.bg.lighter,
        borderColor: colors.status.border,
    };

    if (loading && memories.length === 0 && budgets.length === 0) {
        if (compact) {
            return (
                <View className="ml-1 flex-row items-center">
                    <ActivityIndicator size="small" color={colors.icon.lighter} />
                </View>
            );
        }
        return (
            <View className="mb-3 flex-row items-center gap-x-2">
                <ActivityIndicator size="small" color={colors.icon.lighter} />
                <AppText variant="caption-xs" className="text-text-primary-lighter">
                    Checking context…
                </AppText>
            </View>
        );
    }

    if (memories.length === 0 && budgets.length === 0) {
        return null;
    }

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className={compact ? 'ml-1 flex-1' : 'mb-3'}
            contentContainerStyle={{
                gap: 8,
                paddingRight: 4,
                alignItems: 'center',
            }}
        >
            {memories.map((memory) => {
                const range = formatShortRange(memory.start_at, memory.end_at);
                const isCtx = Boolean(memory.is_current_context);
                return (
                    <View
                        key={`mem-${memory.id}`}
                        className={`max-w-[160px] flex-row items-center gap-x-1.5 rounded-full border px-2.5 py-1.5 ${
                            isCtx ? 'border-accent-sky bg-accent-sky-bg' : ''
                        }`}
                        style={isCtx ? undefined : elevatedChip}
                        accessibilityLabel={`Memory ${memory.title}`}
                    >
                        <Iconify
                            icon="heroicons:map"
                            size={14}
                            color={isCtx ? colors.accent.sky : colors.icon.primary}
                        />
                        <AppText
                            variant="caption-xs"
                            className={`font-semibold ${
                                isCtx ? 'text-accent-sky' : 'text-text-primary'
                            }`}
                            numberOfLines={1}
                        >
                            {memory.title}
                            {range ? ` · ${range}` : ''}
                        </AppText>
                    </View>
                );
            })}

            {budgets.map((budget) => {
                const percent = Math.round(budget.progress?.percent ?? 0);
                const spent = budget.progress?.spent ?? 0;
                const cap = budget.current_instance?.amount ?? budget.amount;
                const hardExceed = budget.would_exceed_hard;
                const label = hardExceed
                    ? `${budget.name} · Hard`
                    : `${budget.name} · ${percent}%`;

                return (
                    <View
                        key={`bud-${budget.id}`}
                        className={`max-w-[150px] flex-row items-center gap-x-1.5 rounded-full border px-2.5 py-1.5 ${
                            hardExceed
                                ? 'border-red-decrease/30 bg-red-decrease/10'
                                : ''
                        }`}
                        style={hardExceed ? undefined : elevatedChip}
                        accessibilityLabel={`Budget ${budget.name} ${formatMoney(spent, currencyCode)} of ${formatMoney(cap, currencyCode)}`}
                    >
                        <Iconify
                            icon="heroicons:banknotes"
                            size={14}
                            color={
                                hardExceed
                                    ? colors.status.error
                                    : colors.accent.sky
                            }
                        />
                        <AppText
                            variant="caption-xs"
                            className={`font-semibold ${
                                hardExceed
                                    ? 'text-red-decrease'
                                    : 'text-text-primary'
                            }`}
                            numberOfLines={1}
                        >
                            {label}
                        </AppText>
                    </View>
                );
            })}
        </ScrollView>
    );
}
