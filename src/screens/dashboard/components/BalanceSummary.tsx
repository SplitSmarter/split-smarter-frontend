import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { formatCurrency } from '../utils/dashboard.utils';

interface BalanceSummaryProps {
    totalBalance: number;
    categoryTag: string;
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({ totalBalance, categoryTag }) => {
    return (
        <View className="items-center mb-4">
            <Text className="text-white/70 text-xs font-semibold tracking-wider uppercase mb-1">
                Total Balance
            </Text>
            <Text className="text-white text-4xl font-extrabold tracking-tight mb-2">
                {formatCurrency(totalBalance)}
            </Text>
            <View className="bg-white/20 px-3 py-1 rounded-full flex-row items-center border border-white/20">
                <Feather name="arrow-up-right" size={13} color="white" />
                <Text className="text-white text-xs font-medium ml-1">
                    {categoryTag}
                </Text>
            </View>
        </View>
    );
};