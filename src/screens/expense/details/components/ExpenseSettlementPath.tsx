import React from 'react';
import {View, Pressable} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppButton} from '@/src/components/common/AppButton';
import type {BaseSettlementDetails} from '@/src/api/dto/expense/settlement';
import type {Currency} from '@/src/api/dto/constants';
import type {ViewerPosition} from '@/src/screens/expense/details/utils/viewerPosition';
import {formatExpenseMoney} from '@/src/screens/expense/details/utils/formatExpenseMoney';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';

type ExpenseSettlementPathProps = {
    settlements: BaseSettlementDetails[];
    position: ViewerPosition;
    currency: Currency;
    onSettle?: () => void;
    onUseTransfer?: () => void;
};

function cardStyle(colors: (typeof COLORS)['light'], isDark: boolean) {
    return {
        backgroundColor: colors.bg.lighter,
        borderColor: colors.status.border,
        shadowColor: COLORS.light.brand.primary,
        shadowOpacity: isDark ? 0.35 : 0.08,
        shadowRadius: 12,
        shadowOffset: {width: 0, height: 4} as const,
        elevation: 3,
    };
}

export function ExpenseSettlementPath({
    settlements,
    position,
    currency,
    onSettle,
    onUseTransfer,
}: ExpenseSettlementPathProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const pending = position.remainingOwed > 0.005;
    const badgeLabel = pending
        ? `${position.remainingOwed > 0 ? '1' : '0'} Pending`
        : 'All Settled';
    const surface = cardStyle(colors, isDark);

    return (
        <View>
            <View className="mb-3 flex-row items-center justify-between">
                <AppText
                    variant="h4"
                    className="font-bold"
                    style={{color: colors.text.primary}}
                >
                    Settlement Path
                </AppText>
                <View
                    className="rounded-full border px-2.5 py-1"
                    style={{
                        backgroundColor: colors.bg.primary,
                        borderColor: colors.status.border,
                    }}
                >
                    <AppText
                        variant="caption-xs"
                        className="font-semibold"
                        style={{color: colors.text.lighter}}
                    >
                        {badgeLabel}
                    </AppText>
                </View>
            </View>

            <View className="gap-y-3">
                {settlements.length === 0 && !pending ? (
                    <View className="rounded-3xl border p-4" style={surface}>
                        <AppText
                            variant="body-small"
                            style={{color: colors.text.lighter}}
                        >
                            No settlement links on this expense yet.
                        </AppText>
                    </View>
                ) : null}

                {settlements.map((link) => (
                    <View
                        key={link.id}
                        className="flex-row items-center justify-between rounded-3xl border p-4"
                        style={{
                            ...surface,
                            borderLeftWidth: 3,
                            borderLeftColor: colors.accent.orbIndigo,
                        }}
                    >
                        <View className="min-w-0 flex-1 pr-3">
                            <AppText
                                variant="body-small"
                                className="font-semibold"
                                style={{color: colors.text.primary}}
                                numberOfLines={1}
                            >
                                {link.from_user?.name ?? 'Someone'} paid{' '}
                                {link.to_user?.name ?? 'someone'}
                            </AppText>
                            <View className="mt-0.5 flex-row items-center gap-1">
                                <Iconify
                                    icon="heroicons:check-circle"
                                    size={12}
                                    color={colors.status.success}
                                />
                                <AppText
                                    variant="caption-xs"
                                    style={{color: colors.text.lighter}}
                                >
                                    Cleared via settlement link
                                </AppText>
                            </View>
                        </View>
                        <View className="items-end">
                            <AppText
                                variant="body-small"
                                className="font-bold"
                                style={{color: colors.text.primary}}
                            >
                                {formatExpenseMoney(link.amount_inr ?? link.amount, currency)}
                            </AppText>
                            <AppText
                                variant="caption-xs"
                                className="font-semibold uppercase text-green-increase"
                            >
                                Cleared
                            </AppText>
                        </View>
                    </View>
                ))}

                {pending ? (
                    <View
                        className="flex-row items-center justify-between rounded-3xl border p-4"
                        style={{
                            ...surface,
                            borderLeftWidth: 3,
                            borderLeftColor: colors.status.warning,
                        }}
                    >
                        <View className="min-w-0 flex-1 pr-3">
                            <AppText
                                variant="body-small"
                                className="font-semibold"
                                style={{color: colors.text.primary}}
                            >
                                You → payers
                            </AppText>
                            <AppText
                                variant="caption-xs"
                                className="mt-0.5"
                                style={{color: colors.text.lighter}}
                            >
                                Suggested settlement path
                            </AppText>
                        </View>
                        <View className="items-end">
                            <AppText
                                variant="body-small"
                                className="font-bold"
                                style={{color: colors.status.decrease}}
                            >
                                {formatExpenseMoney(position.remainingOwed, currency)}
                            </AppText>
                            <AppText
                                variant="caption-xs"
                                className="uppercase"
                                style={{color: colors.text.lighter}}
                            >
                                Pending
                            </AppText>
                        </View>
                    </View>
                ) : null}

                {pending && (onSettle || onUseTransfer) ? (
                    <View className="flex-row gap-2 pt-0.5">
                        {onSettle ? (
                            <View className="flex-1">
                                <AppButton
                                    variant="primary"
                                    onPress={onSettle}
                                    renderIcon={(c) => (
                                        <Iconify
                                            icon="heroicons:paper-airplane"
                                            size={16}
                                            color={c}
                                        />
                                    )}
                                >
                                    Settle{' '}
                                    {formatExpenseMoney(position.remainingOwed, currency)}
                                </AppButton>
                            </View>
                        ) : null}
                        {onUseTransfer ? (
                            <Pressable
                                onPress={onUseTransfer}
                                className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl border py-3.5 active:opacity-80"
                                style={{
                                    backgroundColor: colors.bg.lighter,
                                    borderColor: colors.status.border,
                                }}
                            >
                                <Iconify
                                    icon="heroicons:link"
                                    size={16}
                                    color={colors.accent.sky}
                                />
                                <AppText
                                    variant="caption-xs"
                                    className="font-bold"
                                    style={{color: colors.text.primary}}
                                >
                                    Use Transfer
                                </AppText>
                            </Pressable>
                        ) : null}
                    </View>
                ) : null}
            </View>
        </View>
    );
}
