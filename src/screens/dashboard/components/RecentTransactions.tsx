import React from 'react';
import {View, TouchableOpacity, ScrollView} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {Transaction} from '../types/dashboard';
import {TransactionItem} from './TransactionItem';

const VISIBLE_TRANSACTION_COUNT = 5;
/** Approx row height (icon + padding + border) for capping the list viewport. */
const TRANSACTION_ROW_HEIGHT = 68;

interface RecentTransactionsProps {
    transactions: Transaction[];
    onViewAllPress?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
    transactions,
    onViewAllPress,
}) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const isScrollable = transactions.length > VISIBLE_TRANSACTION_COUNT;
    const listMaxHeight = VISIBLE_TRANSACTION_COUNT * TRANSACTION_ROW_HEIGHT;
    const isEmpty = transactions.length === 0;

    return (
        <View className="mb-6 px-5">
            <View className="mb-3 flex-row items-center justify-between">
                <AppText
                    variant="h4"
                    className="font-bold"
                    style={{color: colors.text.primary}}
                >
                    Recent Transactions
                </AppText>
                {!isEmpty && (
                    <TouchableOpacity onPress={onViewAllPress}>
                        <AppText
                            variant="body-small"
                            className="font-semibold"
                            style={{color: colors.text.lighter}}
                        >
                            View All
                        </AppText>
                    </TouchableOpacity>
                )}
            </View>

            {isEmpty ? (
                <View
                    className="items-center justify-center rounded-3xl border px-5 py-8"
                    style={{
                        backgroundColor: colors.bg.overlay,
                        borderColor: colors.status.border,
                    }}
                >
                    <View
                        className="mb-3 h-12 w-12 items-center justify-center rounded-full"
                        style={{backgroundColor: isDark ? colors.bg.darker : colors.bg.darker}}
                    >
                        <Iconify
                            icon="heroicons:banknotes"
                            size={24}
                            color={colors.icon.lighter}
                        />
                    </View>
                    <AppText
                        variant="body-small"
                        className="text-center font-semibold"
                        style={{color: colors.text.primary}}
                    >
                        No transactions in this range
                    </AppText>
                    <AppText
                        variant="caption-xs"
                        className="mt-1 text-center"
                        style={{color: colors.text.lighter}}
                    >
                        Try a wider duration or clear the filter
                    </AppText>
                </View>
            ) : (
                <ScrollView
                    nestedScrollEnabled
                    scrollEnabled={isScrollable}
                    showsVerticalScrollIndicator={isScrollable}
                    style={isScrollable ? {maxHeight: listMaxHeight} : undefined}
                >
                    {transactions.map((transaction, index) => (
                        <TransactionItem
                            key={transaction.id}
                            transaction={transaction}
                            isLast={index === transactions.length - 1}
                        />
                    ))}
                </ScrollView>
            )}
        </View>
    );
};
