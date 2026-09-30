import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { AppText } from "@/src/components/common/AppText";
import { Transaction } from '../types/dashboard';

interface TransactionItemProps {
    transaction: Transaction;
    isLast?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, isLast = false }) => {
    const renderIcon = () => {
        switch (transaction.iconType) {
            case 'material':
                return (
                    <MaterialCommunityIcons
                        name={transaction.iconName as any}
                        size={20}
                        color={transaction.iconColor}
                    />
                );
            case 'fontawesome':
                return (
                    <FontAwesome5
                        name={transaction.iconName as any}
                        size={18}
                        color={transaction.iconColor}
                    />
                );
            case 'feather':
            default:
                return (
                    <Feather
                        name={transaction.iconName as any}
                        size={18}
                        color={transaction.iconColor}
                    />
                );
        }
    };

    const isExpense = transaction.type === 'expense';
    const amountPrefix = isExpense ? '-' : '+';
    const amountColorClass = isExpense ? 'text-white' : 'text-emerald-400';

    return (
        <View
            className={`flex-row items-center justify-between py-2 ${
                !isLast ? 'border-b border-white/5' : ''
            }`}
        >
            <View className="flex-row items-center">
                <View
                    className={`w-10 h-10 rounded-2xl ${transaction.iconBgColor} border ${transaction.iconBorderColor} items-center justify-center mr-3`}
                >
                    {renderIcon()}
                </View>
                <View className="justify-center">
                    <AppText variant="body-base" className="text-white font-semibold">
                        {transaction.title}
                    </AppText>
                    <AppText variant="caption-xs" className="text-white/40 mt-0.5">
                        {transaction.timeLabel}
                    </AppText>
                </View>
            </View>
            <AppText variant="body-base" className={`${amountColorClass} font-bold`}>
                {amountPrefix}${Math.abs(transaction.amount).toFixed(2)}
            </AppText>
        </View>
    );
};