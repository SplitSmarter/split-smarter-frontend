import React from 'react';
import {View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
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
    const trendColor = COLORS.light.status.success;

    return (
        <View className="mb-3 items-center px-1">
            <AppText
                variant="body-small"
                className="mb-1 font-semibold uppercase tracking-wider text-white/70"
            >
                Total Spend
            </AppText>
            <AppText
                variant="h1"
                className="mb-3 text-center font-extrabold tracking-tight text-white"
                style={{fontSize: 40, lineHeight: 46}}
            >
                {formatCurrency(totalSpend, userCurrency)}
            </AppText>

            <View className="flex-row items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5">
                {isUp ? (
                    <Iconify
                        icon="heroicons:arrow-trending-up"
                        size={16}
                        color={trendColor}
                    />
                ) : (
                    <Iconify
                        icon="heroicons:arrow-trending-down"
                        size={16}
                        color={trendColor}
                    />
                )}
                <AppText
                    variant="body-small"
                    className="font-semibold text-green-increase"
                >
                    {isUp ? '+' : ''}
                    {HARDCODED_VS_PAST_PERCENT}% vs past month
                </AppText>
            </View>
        </View>
    );
};
