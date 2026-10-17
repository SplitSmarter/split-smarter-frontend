import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import type {Currency} from '@/src/api/dto/constants';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {ViewerPosition} from '@/src/screens/expense/details/utils/viewerPosition';
import {formatExpenseMoney} from '@/src/screens/expense/details/utils/formatExpenseMoney';

type ExpensePositionStripProps = {
    position: ViewerPosition;
    currency: Currency;
};

export function ExpensePositionStrip({position, currency}: ExpensePositionStripProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const even = position.type === 'even';
    const owe = position.type === 'owe';

    const headline = even
        ? 'You are all even on this bill'
        : owe
          ? `You owe ${formatExpenseMoney(position.remainingOwed, currency)}`
          : `You are owed ${formatExpenseMoney(position.remainingOwedToYou, currency)}`;

    const remaining = owe
        ? position.remainingOwed
        : position.type === 'owed'
          ? position.remainingOwedToYou
          : 0;

    const remainingColor = even
        ? colors.status.success
        : owe
          ? colors.status.decrease
          : colors.status.success;

    return (
        <View>
            <AppText
                variant="h4"
                className="mb-3 font-bold"
                style={{color: colors.text.primary}}
            >
                Your Position
            </AppText>
            <View
                className="rounded-3xl border p-4"
                style={{
                    backgroundColor: colors.bg.lighter,
                    borderColor: colors.status.border,
                    shadowColor: COLORS.light.brand.primary,
                    shadowOpacity: isDark ? 0.35 : 0.08,
                    shadowRadius: 12,
                    shadowOffset: {width: 0, height: 4},
                    elevation: 3,
                }}
            >
                <View className="mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <View
                            className="h-2 w-2 rounded-full"
                            style={{
                                backgroundColor: even
                                    ? colors.status.success
                                    : colors.accent.sky,
                            }}
                        />
                        <AppText
                            variant="caption-xs"
                            className="font-bold uppercase tracking-wider"
                            style={{color: colors.text.lighter}}
                        >
                            With settlements
                        </AppText>
                    </View>
                </View>

                <View className="flex-row items-center justify-between">
                    <View className="min-w-0 flex-1 pr-3">
                        <AppText
                            variant="body-base"
                            className="font-bold"
                            style={{color: colors.text.primary}}
                        >
                            {headline}
                        </AppText>
                        <AppText
                            variant="caption-xs"
                            className="mt-1 font-medium"
                            style={{color: colors.text.lighter}}
                        >
                            You paid {formatExpenseMoney(position.paid, currency)} · Share{' '}
                            {formatExpenseMoney(position.share, currency)}
                            {position.settledContribution > 0.005
                                ? ` · Settled ${formatExpenseMoney(position.settledContribution, currency)}`
                                : ''}
                        </AppText>
                    </View>
                    <View className="items-end">
                        <AppText
                            variant="body-base"
                            className="font-bold"
                            style={{color: remainingColor}}
                        >
                            {formatExpenseMoney(remaining, currency)}
                        </AppText>
                        <AppText
                            variant="caption-xs"
                            className="uppercase"
                            style={{color: colors.text.lighter}}
                        >
                            Remaining
                        </AppText>
                    </View>
                </View>
            </View>
        </View>
    );
}
