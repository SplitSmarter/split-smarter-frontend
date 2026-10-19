import React from 'react';
import {ActivityIndicator, Alert, Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {SheetEmptyState} from '@/src/components/empty-states/SheetEmptyState';
import {BudgetRuleListItem} from '@/src/api/dto/expense/budget';
import {
    BudgetCapMode,
    BudgetPeriod,
} from '@/src/api/dto/expense/constant';
import {COLORS} from '@/src/constants/colors';
import {Currency, CurrencyCode} from '@/src/constants/expense/currency';
import {themeStore} from '@/src/store/themeStore';
import {userStore} from '@/src/store/userStore';

const PERIOD_LABELS: Record<BudgetPeriod, string> = {
    [BudgetPeriod.DAILY]: 'Daily',
    [BudgetPeriod.MONTHLY]: 'Monthly',
    [BudgetPeriod.QUARTERLY]: 'Quarterly',
    [BudgetPeriod.YEARLY]: 'Yearly',
};

type Props = {
    budgets: BudgetRuleListItem[];
    loading?: boolean;
    onCreatePress: () => void;
    /** Stub until budget details screen exists */
    onBudgetPress?: (budgetId: number) => void;
};

function elevatedCardStyle(isDark: boolean) {
    const colors = isDark ? COLORS.dark : COLORS.light;
    return {
        backgroundColor: colors.bg.lighter,
        borderColor: colors.status.border,
        shadowColor: COLORS.light.brand.primary,
        shadowOpacity: isDark ? 0.35 : 0.08,
        shadowRadius: 12,
        shadowOffset: {width: 0, height: 4},
        elevation: 3,
    };
}

export function GroupBudgetsTab({
    budgets,
    loading = false,
    onCreatePress,
    onBudgetPress,
}: Props) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const currencyCode = (userStore((s) => s.user)?.currency || 'INR') as CurrencyCode;
    const currencySymbol = Currency[currencyCode]?.symbol ?? '₹';

    const handlePress = (budgetId: number) => {
        if (onBudgetPress) {
            onBudgetPress(budgetId);
            return;
        }
        // TODO: navigate to budget details when the screen exists
        Alert.alert('Coming soon', 'Budget details will be available in a later update.');
    };

    if (loading) {
        return (
            <View className="items-center py-16">
                <ActivityIndicator color={colors.icon.primary} size="large" />
            </View>
        );
    }

    if (budgets.length === 0) {
        return (
            <View className="flex-1 py-8">
                <SheetEmptyState
                    icon={
                        <Iconify
                            icon="heroicons:banknotes"
                            size={28}
                            color={colors.icon.primary}
                        />
                    }
                    title="No group budgets"
                    description="Create a budget for this group to track shared spending caps."
                    primaryAction={{
                        label: 'Create budget',
                        onPress: onCreatePress,
                        renderIcon: (c) => (
                            <Iconify icon="heroicons:plus-circle" size={18} color={c} />
                        ),
                    }}
                />
            </View>
        );
    }

    return (
        <View className="gap-3 pb-24">
            <View className="mb-1 flex-row items-center justify-between">
                <AppText variant="body-small" className="font-bold text-text-primary">
                    Group budgets
                </AppText>
                <Pressable
                    onPress={onCreatePress}
                    className="flex-row items-center gap-1 active:opacity-70"
                    accessibilityRole="button"
                    accessibilityLabel="Create budget"
                >
                    <Iconify icon="heroicons:plus" size={16} color={colors.accent.sky} />
                    <AppText variant="caption-xs" className="font-semibold text-accent-sky">
                        Create
                    </AppText>
                </Pressable>
            </View>

            {budgets.map((budget) => {
                const isHard = budget.cap_mode === BudgetCapMode.HARD;
                const periodLabel = budget.period
                    ? PERIOD_LABELS[budget.period] ?? budget.period
                    : 'No reset';

                return (
                    <Pressable
                        key={budget.id}
                        onPress={() => handlePress(budget.id)}
                        className="rounded-3xl border p-4 active:opacity-90"
                        style={elevatedCardStyle(isDark)}
                        accessibilityRole="button"
                        accessibilityLabel={`Budget ${budget.name}`}
                    >
                        <View className="mb-2 flex-row items-start justify-between gap-3">
                            <View className="min-w-0 flex-1">
                                <AppText
                                    className="font-bold text-text-primary"
                                    numberOfLines={2}
                                >
                                    {budget.name}
                                </AppText>
                                <AppText
                                    variant="caption-xs"
                                    className="mt-1 text-text-primary-lighter"
                                >
                                    {periodLabel}
                                    {!budget.is_active ? ' · Inactive' : ''}
                                </AppText>
                            </View>
                            <View
                                className={`rounded-full border px-2.5 py-0.5 ${
                                    isHard
                                        ? 'border-red-decrease/30 bg-red-decrease/10'
                                        : 'border-accent-sky bg-accent-sky-bg'
                                }`}
                            >
                                <AppText
                                    variant="caption-xs"
                                    className={`font-bold ${
                                        isHard ? 'text-red-decrease' : 'text-accent-sky'
                                    }`}
                                >
                                    {isHard ? 'Hard' : 'Soft'}
                                </AppText>
                            </View>
                        </View>

                        <View className="mt-1 flex-row items-end justify-between">
                            <AppText variant="h4" className="font-bold text-text-primary">
                                {currencySymbol}
                                {Number(budget.amount).toLocaleString('en-IN')}
                            </AppText>
                            <Iconify
                                icon="heroicons:chevron-right"
                                size={18}
                                color={colors.icon.lighter}
                            />
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );
}
