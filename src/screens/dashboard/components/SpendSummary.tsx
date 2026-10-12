import React from 'react';
import {View, Text} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {userStore} from '@/src/store/userStore';
import {formatCurrency} from '../utils/dashboard.utils';

interface SpendSummaryProps {
    totalSpend: number;
    categoryTag: string;
}

/** Hardcoded vs-past delta until API compares prior equal-length range. */
const HARDCODED_VS_PAST_PERCENT = 12;

export const SpendSummary: React.FC<SpendSummaryProps> = ({
    totalSpend,
    // categoryTag reserved — pill now shows vs-past until API wires category back
}) => {
    const userCurrency = userStore((s) => s.user?.currency);
    const isUp = HARDCODED_VS_PAST_PERCENT >= 0;

    return (
        <View className="mb-1 items-center">
            <Text className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-white/70">
                Total Spend
            </Text>
            <Text className="mb-2 text-4xl font-extrabold tracking-tight text-white">
                {formatCurrency(totalSpend, userCurrency)}
            </Text>

            {/* Same pill style as former category chip — vs prior equal-length range (hardcoded) */}
            <View className="flex-row items-center gap-1 rounded-full border border-white/20 bg-white/20 px-3 py-1">
                <Feather
                    name={isUp ? 'arrow-up-right' : 'arrow-down-right'}
                    size={13}
                    color="white"
                />
                <Text className="text-xs font-medium text-white">
                    {isUp ? '+' : ''}
                    {HARDCODED_VS_PAST_PERCENT}% vs past
                </Text>
            </View>
        </View>
    );
};
