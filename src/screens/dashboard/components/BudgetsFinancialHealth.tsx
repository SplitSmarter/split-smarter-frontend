import React from 'react';
import {View, Pressable} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {BudgetCategory, BudgetGoal} from '../types/dashboard';

function successBorderColor(hex: string, alpha: number) {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface BudgetsFinancialHealthProps {
    budgets: BudgetGoal[];
    onCreateNewPress?: () => void;
}

const CategoryIconRow: React.FC<{
    categories: BudgetCategory[];
    colors: (typeof COLORS)['light'] | (typeof COLORS)['dark'];
}> = ({categories, colors}) => {
    const maxVisible = 3;
    const visibleCategories = categories.slice(0, maxVisible);
    const overflowCount = categories.length - maxVisible;

    if (visibleCategories.length === 0) return null;

    return (
        <View className="flex-row items-center gap-1.5">
            {visibleCategories.map((cat) => (
                <View
                    key={cat.id}
                    className="h-6 w-6 items-center justify-center overflow-hidden rounded-full border p-1"
                    style={{
                        backgroundColor: colors.bg.primary,
                        borderColor: colors.status.border,
                    }}
                >
                    <AppImageV2
                        id={cat.icon.id}
                        url={cat.icon.url}
                        contentFit="contain"
                        style={{width: '100%', height: '100%'}}
                        fallbackComponent={
                            <EntityFallbackIcon
                                kind="expenseCategory"
                                size={12}
                                color={colors.icon.lighter}
                            />
                        }
                    />
                </View>
            ))}
            {overflowCount > 0 && (
                <View
                    className="items-center justify-center rounded-full border px-1.5 py-0.5"
                    style={{
                        backgroundColor: colors.bg.primary,
                        borderColor: colors.status.border,
                    }}
                >
                    <AppText
                        variant="caption-xs"
                        className="text-[9px] font-bold"
                        style={{color: colors.text.primary}}
                    >
                        +{overflowCount}
                    </AppText>
                </View>
            )}
        </View>
    );
};

export const BudgetsFinancialHealth: React.FC<BudgetsFinancialHealthProps> = ({
    budgets,
    onCreateNewPress,
}) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View className="mb-6 px-5">
            <View className="mb-3 flex-row items-center justify-between">
                <AppText variant="h4" className="font-bold" style={{color: colors.text.primary}}>
                    Budgets & Goals
                </AppText>
                <Pressable onPress={onCreateNewPress} className="active:opacity-70">
                    <AppText
                        variant="body-small"
                        className="font-semibold"
                        style={{color: colors.text.link}}
                    >
                        Create New
                    </AppText>
                </Pressable>
            </View>

            <View className="gap-3">
                {budgets.map((budget) => {
                    const isLinear = budget.type === 'linear';
                    const remaining = budget.totalAmount - budget.usedAmount;
                    const categories = budget.categories || [];
                    const progressFill =
                        budget.progressPercent >= 90
                            ? colors.status.decrease
                            : colors.status.warning;

                    return (
                        <View
                            key={budget.id}
                            className="rounded-3xl border p-4"
                            style={{
                                backgroundColor: colors.bg.lighter,
                                borderColor: colors.status.border,
                                // Soft elevation so white cards separate from light canvas
                                shadowColor: COLORS.light.brand.primary,
                                shadowOpacity: isDark ? 0.35 : 0.08,
                                shadowRadius: 12,
                                shadowOffset: {width: 0, height: 4},
                                elevation: 3,
                            }}
                        >
                            <View className="mb-3 flex-row items-start justify-between">
                                <View className="min-w-0 flex-1 pr-3">
                                    <AppText
                                        variant="body-base"
                                        className="font-bold"
                                        style={{color: colors.text.primary}}
                                    >
                                        {budget.title}
                                    </AppText>
                                    <AppText
                                        variant="caption-xs"
                                        className="mt-1 font-medium"
                                        style={{color: colors.text.lighter}}
                                    >
                                        {budget.statusText}
                                    </AppText>
                                </View>

                                {isLinear && (
                                    <View className="shrink-0 items-end gap-1.5">
                                        <View
                                            className="rounded-full border px-2.5 py-1"
                                            style={{
                                                backgroundColor: colors.brand.lighter,
                                                borderColor: successBorderColor(
                                                    colors.status.success,
                                                    isDark ? 0.35 : 0.3
                                                ),
                                            }}
                                        >
                                            <AppText
                                                variant="caption-xs"
                                                className="font-bold"
                                                style={{color: colors.status.success}}
                                            >
                                                {budget.currencySymbol}
                                                {remaining.toLocaleString('en-IN')} left
                                            </AppText>
                                        </View>
                                        {categories.length > 0 && (
                                            <CategoryIconRow
                                                categories={categories}
                                                colors={colors}
                                            />
                                        )}
                                    </View>
                                )}
                            </View>

                            {isLinear ? (
                                <View>
                                    <View
                                        className="h-2.5 w-full overflow-hidden rounded-full"
                                        style={{backgroundColor: colors.bg.darker}}
                                    >
                                        <View
                                            style={{
                                                width: `${Math.min(budget.progressPercent, 100)}%`,
                                                backgroundColor: progressFill,
                                            }}
                                            className="h-full rounded-full"
                                        />
                                    </View>

                                    <View className="mt-2.5 flex-row items-center justify-between">
                                        <AppText
                                            variant="caption-xs"
                                            className="font-medium"
                                            style={{color: colors.text.lighter}}
                                        >
                                            {budget.currencySymbol}
                                            {budget.usedAmount.toLocaleString('en-IN')} spent
                                        </AppText>
                                        <AppText
                                            variant="caption-xs"
                                            className="font-bold"
                                            style={{
                                                color:
                                                    budget.progressPercent >= 90
                                                        ? colors.status.decrease
                                                        : colors.text.primary,
                                            }}
                                        >
                                            {budget.progressPercent}% used
                                        </AppText>
                                    </View>
                                </View>
                            ) : (
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-3">
                                        <View className="relative h-12 w-12 items-center justify-center">
                                            <Svg height="48" width="48" viewBox="0 0 36 36">
                                                <Circle
                                                    cx="18"
                                                    cy="18"
                                                    r="15.915"
                                                    stroke={colors.bg.darker}
                                                    strokeWidth="3.5"
                                                    fill="transparent"
                                                />
                                                <Circle
                                                    cx="18"
                                                    cy="18"
                                                    r="15.915"
                                                    stroke={colors.text.primary}
                                                    strokeWidth="3.5"
                                                    strokeDasharray={`${Math.max(budget.progressPercent, 2)}, 100`}
                                                    strokeLinecap="round"
                                                    fill="transparent"
                                                    transform="rotate(-90 18 18)"
                                                />
                                            </Svg>
                                            <AppText
                                                variant="caption-xs"
                                                className="absolute text-[10px] font-bold"
                                                style={{color: colors.text.primary}}
                                            >
                                                {budget.progressPercent}%
                                            </AppText>
                                        </View>
                                        {categories.length > 0 && (
                                            <CategoryIconRow
                                                categories={categories}
                                                colors={colors}
                                            />
                                        )}
                                    </View>

                                    <View className="items-end gap-0.5">
                                        {/* TODO(savings-goals): “Goal Target” is yearly/group spend UI — swap to saved/of-goal when kind=save exists */}
                                        <AppText
                                            variant="caption-xs"
                                            className="font-medium"
                                            style={{color: colors.text.lighter}}
                                        >
                                            Goal Target
                                        </AppText>
                                        <AppText
                                            variant="body-base"
                                            className="font-extrabold"
                                            style={{color: colors.text.primary}}
                                        >
                                            {budget.currencySymbol}
                                            {budget.totalAmount.toLocaleString('en-IN')}
                                        </AppText>
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};
