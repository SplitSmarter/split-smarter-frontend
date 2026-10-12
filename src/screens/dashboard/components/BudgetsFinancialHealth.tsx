import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {BudgetCategory, BudgetGoal} from '../types/dashboard';

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
                <AppText
                    variant="h4"
                    className="font-bold"
                    style={{color: colors.text.primary}}
                >
                    Budgets & Goals
                </AppText>
                <TouchableOpacity onPress={onCreateNewPress} activeOpacity={0.7}>
                    <AppText
                        variant="body-small"
                        className="font-semibold"
                        style={{color: colors.text.lighter}}
                    >
                        Create New
                    </AppText>
                </TouchableOpacity>
            </View>

            <View className="gap-3">
                {budgets.map((budget) => {
                    const isLinear = budget.type === 'linear';
                    const remaining = budget.totalAmount - budget.usedAmount;
                    const categories = budget.categories || [];

                    return (
                        <View
                            key={budget.id}
                            className="rounded-3xl border p-4 shadow-2xl"
                            style={{
                                backgroundColor: colors.bg.overlay,
                                borderColor: colors.status.border,
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
                                        <View className="rounded-full border border-bg-secondary/20 bg-bg-secondary-lighter px-2.5 py-1">
                                            <AppText variant="caption-xs" className="font-bold text-green-increase">
                                                {budget.currencySymbol}
                                                {remaining.toLocaleString('en-IN')} left
                                            </AppText>
                                        </View>
                                        {categories.length > 0 && (
                                            <CategoryIconRow categories={categories} colors={colors} />
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
                                                backgroundColor: '#FF7A00',
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
                                            style={{color: colors.text.primary}}
                                        >
                                            {budget.progressPercent}% used
                                        </AppText>
                                    </View>
                                </View>
                            ) : (
                                <>
                                    <View className="flex-row items-center justify-between">
                                        <View className="relative h-12 w-12 items-center justify-center">
                                            <Svg height="48" width="48" viewBox="0 0 36 36">
                                                <Circle
                                                    cx="18"
                                                    cy="18"
                                                    r="15.915"
                                                    stroke={colors.status.border}
                                                    strokeWidth="3.5"
                                                    fill="transparent"
                                                />
                                                <Circle
                                                    cx="18"
                                                    cy="18"
                                                    r="15.915"
                                                    stroke="#FF7A00"
                                                    strokeWidth="3.5"
                                                    strokeDasharray={`${budget.progressPercent}, 100`}
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

                                        <View className="items-end gap-0.5">
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

                                    {/* Ring goals keep the categories footer */}
                                    {categories.length > 0 && (
                                        <View
                                            className="mt-3 flex-row items-center justify-between border-t pt-3"
                                            style={{borderTopColor: colors.status.border}}
                                        >
                                            <AppText
                                                variant="caption-xs"
                                                className="text-[10px] font-medium"
                                                style={{color: colors.text.lighter}}
                                            >
                                                Categories
                                            </AppText>
                                            <CategoryIconRow categories={categories} colors={colors} />
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};
