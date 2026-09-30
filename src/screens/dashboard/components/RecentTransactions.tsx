import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {AppText} from "@/src/components/common/AppText";
import {Transaction} from '../types/dashboard';
import {TransactionItem} from './TransactionItem';

interface RecentTransactionsProps {
    transactions: Transaction[];
    onViewAllPress?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
                                                                          transactions,
                                                                          onViewAllPress,
                                                                      }) => {
    return (
        <View className="px-5 mb-6">
            <View className="flex-row justify-between items-center mb-4">
                <AppText variant="h4" className="text-white font-bold">
                    Recent Transactions
                </AppText>
                <TouchableOpacity onPress={onViewAllPress}>
                    <AppText variant="body-small" className="text-white/50 font-semibold">
                        View All
                    </AppText>
                </TouchableOpacity>
            </View>

            <View className="flex-col space-y-3">
                {transactions.map((transaction, index) => (
                    <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        isLast={index === transactions.length - 1}
                    />
                ))}
            </View>
        </View>
    );
};