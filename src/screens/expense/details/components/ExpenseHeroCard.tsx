import React from 'react';
import {ActivityIndicator, Pressable, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import type {ExpenseDetailsBasicResponse} from '@/src/api/dto/expense/expense';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {PLATINUM_HERO_GRADIENT} from '@/src/screens/dashboard/constants/dashboard.constants';
import type {ViewerPosition} from '@/src/screens/expense/details/utils/viewerPosition';
import {formatExpenseMoney} from '@/src/screens/expense/details/utils/formatExpenseMoney';

type ExpenseHeroCardProps = {
    expense: ExpenseDetailsBasicResponse;
    position: ViewerPosition | null;
    /** Full-bleed platinum hero (dashboard). Compact card for sheets. */
    variant?: 'hero' | 'card';
    expenseIdLabel?: string;
    loading?: boolean;
    onBack?: () => void;
    onRefresh?: () => void;
};

export function ExpenseHeroCard({
    expense,
    position,
    variant = 'card',
    expenseIdLabel,
    loading = false,
    onBack,
    onRefresh,
}: ExpenseHeroCardProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const status = position?.statusLabel ?? (expense.is_user_settled ? 'Fully Settled' : 'Open');
    const settled = status === 'Fully Settled';

    if (variant === 'hero') {
        const gradient = isDark ? PLATINUM_HERO_GRADIENT.dark : PLATINUM_HERO_GRADIENT.light;

        return (
            <LinearGradient
                colors={[...gradient]}
                start={{x: 0.1, y: 0.1}}
                end={{x: 0.9, y: 0.9}}
                className="px-5 pb-10 pt-1"
                style={{
                    borderBottomLeftRadius: 15,
                    borderBottomRightRadius: 15,
                    overflow: 'hidden',
                }}
            >
                <View className="mb-4 flex-row items-center justify-between">
                    <Pressable
                        onPress={onBack}
                        hitSlop={12}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/20 active:opacity-70"
                    >
                        <Iconify
                            icon="heroicons:chevron-left"
                            size={20}
                            color={COLORS.light.text.contrast}
                        />
                    </Pressable>

                    <View className="items-center px-2">
                        <AppText
                            variant="caption-xs"
                            className="uppercase font-semibold tracking-wider text-white/70"
                        >
                            Expense Record
                        </AppText>
                        {expenseIdLabel ? (
                            <AppText variant="body-xs" className="font-bold text-white">
                                {expenseIdLabel}
                            </AppText>
                        ) : null}
                    </View>

                    <Pressable
                        onPress={onRefresh}
                        hitSlop={12}
                        accessibilityRole="button"
                        accessibilityLabel="Refresh"
                        className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/20 active:opacity-70"
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color={COLORS.light.text.contrast} />
                        ) : (
                            <Iconify
                                icon="heroicons:arrow-path"
                                size={18}
                                color={COLORS.light.text.contrast}
                            />
                        )}
                    </Pressable>
                </View>

                <View className="mb-3 items-center">
                    <View className="mb-3 h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/25 bg-white/15">
                        {expense.category?.icon?.url ? (
                            <AppImageV2
                                id={expense.category.icon.id ?? `cat-${expense.category.id}`}
                                url={expense.category.icon.url}
                                style={{width: '100%', height: '100%'}}
                                contentFit="cover"
                                fallbackComponent={
                                    <EntityFallbackIcon
                                        kind="expenseCategory"
                                        size={22}
                                        color={COLORS.light.icon.lighter}
                                    />
                                }
                            />
                        ) : (
                            <Iconify
                                icon="heroicons:tag"
                                size={22}
                                color={COLORS.light.icon.lighter}
                            />
                        )}
                    </View>

                    <AppText
                        variant="caption-xs"
                        className="mb-0.5 font-semibold uppercase tracking-wider text-white/70"
                    >
                        {expense.category?.title ?? 'Expense'}
                    </AppText>
                    <AppText
                        variant="h1"
                        className="mb-1 font-extrabold tracking-tight text-white"
                    >
                        {formatExpenseMoney(expense.total_amount, expense.currency)}
                    </AppText>
                    <AppText
                        variant="body-base"
                        className="mb-3 px-4 text-center font-semibold text-white"
                        numberOfLines={2}
                    >
                        {expense.name}
                    </AppText>

                    <View className="flex-row items-center gap-2">
                        <View className="flex-row items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1">
                            {settled ? (
                                <Iconify
                                    icon="heroicons:check-circle"
                                    size={14}
                                    color={COLORS.light.status.success}
                                />
                            ) : (
                                <Iconify
                                    icon="heroicons:clock"
                                    size={14}
                                    color={COLORS.light.icon.lighter}
                                />
                            )}
                            <AppText
                                variant="caption-xs"
                                className={`font-semibold ${
                                    settled ? 'text-green-increase' : 'text-white'
                                }`}
                            >
                                {status}
                            </AppText>
                        </View>
                        {expense.expense_date ? (
                            <View className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1">
                                <AppText variant="caption-xs" className="font-semibold text-white/80">
                                    {expense.expense_date?.slice?.(0, 10) ?? expense.expense_date}
                                </AppText>
                            </View>
                        ) : null}
                    </View>
                </View>
            </LinearGradient>
        );
    }

    // Compact card (bottom sheet / snapshot)
    const statusTone = settled
        ? {
              bg: 'bg-secondary-lighter',
              text: 'text-green-increase',
              icon: colors.status.success,
          }
        : status === 'Partially Settled'
          ? {
                bg: 'bg-bg-primary',
                text: 'text-text-primary',
                icon: colors.status.warning,
            }
          : {
                bg: 'bg-bg-primary',
                text: 'text-text-primary-lighter',
                icon: colors.icon.lighter,
            };

    return (
        <View
            className="rounded-3xl border p-4"
            style={{
                backgroundColor: colors.bg.lighter,
                borderColor: colors.status.border,
            }}
        >
            <View className="mb-3 flex-row items-center justify-between">
                <View className="min-w-0 flex-1 flex-row items-center gap-2.5 pr-2">
                    <View className="h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-accent-sky bg-accent-sky-bg">
                        {expense.category?.icon?.url ? (
                            <AppImageV2
                                id={expense.category.icon.id ?? `cat-${expense.category.id}`}
                                url={expense.category.icon.url}
                                style={{width: '100%', height: '100%'}}
                                contentFit="cover"
                                fallbackComponent={
                                    <EntityFallbackIcon
                                        kind="expenseCategory"
                                        size={18}
                                        color={colors.accent.sky}
                                    />
                                }
                            />
                        ) : (
                            <Iconify icon="heroicons:tag" size={18} color={colors.accent.sky} />
                        )}
                    </View>
                    <View className="min-w-0 flex-1">
                        <AppText
                            variant="caption-xs"
                            className="font-bold uppercase tracking-wider text-text-primary-lighter"
                            numberOfLines={1}
                        >
                            {expense.category?.title ?? 'Expense'}
                        </AppText>
                        <AppText
                            variant="caption-xs"
                            className="mt-0.5 text-text-primary-lighter"
                        >
                            {expense.expense_date?.slice?.(0, 10) ?? expense.expense_date}
                        </AppText>
                    </View>
                </View>

                <View
                    className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${statusTone.bg}`}
                >
                    {settled ? (
                        <Iconify
                            icon="heroicons:check-circle"
                            size={12}
                            color={statusTone.icon}
                        />
                    ) : (
                        <Iconify icon="heroicons:clock" size={12} color={statusTone.icon} />
                    )}
                    <AppText variant="caption-xs" className={`font-bold ${statusTone.text}`}>
                        {status}
                    </AppText>
                </View>
            </View>

            <AppText variant="h4" className="font-bold text-text-primary" numberOfLines={2}>
                {expense.name}
            </AppText>
            <View className="mt-1 flex-row items-baseline gap-1.5">
                <AppText variant="h3" className="font-bold text-text-primary">
                    {formatExpenseMoney(expense.total_amount, expense.currency)}
                </AppText>
                <AppText variant="caption-xs" className="font-bold text-text-primary-lighter">
                    {expense.currency}
                </AppText>
            </View>
        </View>
    );
}
